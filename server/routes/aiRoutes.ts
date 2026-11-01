import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { checkUserAiQuota, recordAiUsage } from '../services/aiUsageService';

import fs from 'node:fs';

const router = Router();

// Dynamic GoogleGenAI client resolver
function getAiClient(): GoogleGenAI | null {
  let apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if ((!apiKey || apiKey.length < 20 || apiKey.includes('MY_GEMINI')) && fs.existsSync('.env')) {
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const match = envContent.match(/GEMINI_API_KEY=(.*)/);
      if (match && match[1]) {
        apiKey = match[1].trim();
      }
    } catch {}
  }

  if (!apiKey || apiKey.includes('MY_GEMINI')) {
    console.warn('getAiClient warning: GEMINI_API_KEY is unconfigured or dummy placeholder');
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

// GET /api/ai/usage - Fetch user's current AI daily quota usage
router.get('/usage', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const quotaInfo = await checkUserAiQuota(userId);
    res.json({
      success: true,
      quota: quotaInfo,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve AI usage statistics', details: err.message });
  }
});

// POST /api/ai/copilot - Live Interactive Copilot with token accounting & conversation memory
router.post('/copilot', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const startTime = Date.now();
  const userId = req.user!.uid;
  const requestId = `req_copilot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const quotaCheck = await checkUserAiQuota(userId);
    if (!quotaCheck.allowed) {
      res.status(429).json({ error: 'AI Quota Exceeded', message: quotaCheck.reason });
      return;
    }

    const { message, eventContext, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    const ai = getAiClient();
    if (ai) {
      const systemInstruction = `You are Planora AI, an elite, warm, friendly, intelligent, and conversational event planning copilot for weddings, birthdays, engagements, and community celebrations.

Conversational Guidelines:
1. Respond directly to what the user actually said. Understand English, Hindi, and Hinglish naturally.
2. For greetings ("hii", "hello", "namaste"), respond with a warm, friendly greeting and ask what event they are planning today.
3. For planning requests ("wedding plan karni hai", "plan a birthday in Mumbai"), respond directly and ask relevant follow-up questions for missing details (location, budget, guest count, date).
4. When budget and guest count are provided (e.g. ₹5 lakh, 200 guests in Mumbai), analyze those exact figures realistically, explain assumptions, and suggest practical next steps.
5. Avoid repeating generic acknowledgments in every turn.
6. Remember facts stated earlier in the conversation (budget, location, guest count, preferences).
7. Active event context: ${eventContext ? JSON.stringify(eventContext) : 'None currently selected'}. Use this to personalize advice if applicable.
8. If the user asks for actionable checklists, budget category distributions, themes, or vendor recommendations, ALSO append a JSON block at the very end of your response inside triple backticks \`\`\`json ... \`\`\` containing:
{
  "actionType": "tasks" | "budget" | "theme" | "vendor",
  "suggestedTasks": [ { "title": "...", "category": "Venue"|"Catering"|"Decoration"|"Photography"|"Entertainment"|"Others", "dueDate": "YYYY-MM-DD" } ],
  "suggestedBudgets": [ { "category": "Venue & Catering", "percentage": 40, "amount": 200000 } ],
  "suggestedTheme": { "name": "...", "palette": ["#...", "#..."], "description": "..." },
  "suggestedVendor": { "name": "...", "category": "Venue", "location": "Mumbai", "priceMin": 150000 }
}
Do NOT include the JSON block for casual greetings, general chat, or simple follow-up questions.`;

      // Build strictly alternating conversation history turns for Gemini
      const conversationContents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        let lastRole = '';
        history.slice(-10).forEach((item: any) => {
          const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
          const text = (item.text || item.content || '').trim();
          if (text && role !== lastRole) {
            conversationContents.push({ role, parts: [{ text }] });
            lastRole = role;
          }
        });
        if (lastRole === 'user') {
          conversationContents.pop();
        }
      }
      conversationContents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationContents,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text || 'How can I assist you with your event plan today?';
      const latencyMs = Date.now() - startTime;

      // Extract JSON action block if present
      let actionData = null;
      const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonMatch && jsonMatch[1]) {
        try {
          actionData = JSON.parse(jsonMatch[1]);
        } catch {}
      }

      // Clean display text without raw json block
      const cleanReply = replyText.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();

      const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(message.length / 4);
      const completionTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(replyText.length / 4);

      await recordAiUsage({
        userId,
        requestId,
        featureName: 'copilot_chat',
        modelName: 'gemini-2.5-flash',
        promptTokens,
        completionTokens,
        statusCode: 200,
        latencyMs,
      });

      res.json({
        reply: cleanReply || replyText,
        actionData,
        isLiveAi: true,
        usage: { promptTokens, completionTokens },
      });
      return;
    }

    // High quality fallback with structured action data when API key is unconfigured
    const isBudgetQuery = message.toLowerCase().includes('budget');
    const isTaskQuery = message.toLowerCase().includes('task') || message.toLowerCase().includes('timeline') || message.toLowerCase().includes('checklist');
    const isThemeQuery = message.toLowerCase().includes('theme') || message.toLowerCase().includes('decor');

    let fallbackAction = null;
    if (isBudgetQuery) {
      fallbackAction = {
        actionType: 'budget',
        suggestedBudgets: [
          { category: 'Venue & Catering', percentage: 40, amount: 320000 },
          { category: 'Decoration & Lighting', percentage: 25, amount: 200000 },
          { category: 'Photography & Media', percentage: 15, amount: 120000 },
          { category: 'Entertainment & Music', percentage: 10, amount: 80000 },
          { category: 'Buffer & Contingency', percentage: 10, amount: 80000 },
        ],
      };
    } else if (isTaskQuery) {
      fallbackAction = {
        actionType: 'tasks',
        suggestedTasks: [
          { title: 'Confirm & Reserve Primary Resort Venue', category: 'Venue', dueDate: '2026-02-15' },
          { title: 'Finalize Menu Tasting & Catering Contract', category: 'Catering', dueDate: '2026-03-01' },
          { title: 'Select Floral Arch & Lighting Concept', category: 'Decoration', dueDate: '2026-03-15' },
          { title: 'Book Photographer & Videographer', category: 'Photography', dueDate: '2026-04-01' },
        ],
      };
    } else if (isThemeQuery) {
      fallbackAction = {
        actionType: 'theme',
        suggestedTheme: {
          name: 'Golden Riviera Sunset',
          palette: ['#F9EBD7', '#E5A988', '#C96E42', '#8B4513', '#3E2723'],
          description: 'A warm coastal blend of amber festoon lights, terracotta draping, and soft blush florals.',
        },
      };
    }

    const fallbackNotice = process.env.GEMINI_API_KEY
      ? ''
      : '\n\n*(Note: Running in offline mode. Configure GEMINI_API_KEY in environment variables for live dynamic AI reasoning.)*';

    const fallbackText = `Here are thoughtful recommendations for "${message}":\n\n• Venue Strategy: Reserve open lawn or beachside deck with sunset view orientation.\n• Hospitality & Menu: Pair curated regional food stations with acoustic ambient music.\n• Milestone Schedule: Finalize primary vendor contracts 4-6 months before the event.${fallbackNotice}`;

    await recordAiUsage({
      userId,
      requestId,
      featureName: 'copilot_chat',
      modelName: 'fallback-demo',
      promptTokens: 50,
      completionTokens: 80,
      statusCode: 200,
      latencyMs: Date.now() - startTime,
    });

    res.json({ reply: fallbackText, actionData: fallbackAction, isLiveAi: false });
  } catch (err: any) {
    console.error('AI copilot error:', err);
    res.status(500).json({
      error: 'AI processing error',
      details: err.message,
    });
  }
});

// POST /api/ai/theme - Theme Generator with token accounting
router.post('/theme', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const startTime = Date.now();
  const userId = req.user!.uid;
  const requestId = `req_theme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const quotaCheck = await checkUserAiQuota(userId);
    if (!quotaCheck.allowed) {
      res.status(429).json({ error: 'AI Quota Exceeded', message: quotaCheck.reason });
      return;
    }

    const { prompt: userPrompt, eventType } = req.body;
    const ai = getAiClient();
    if (ai && userPrompt) {
      const prompt = `You are Planora AI's Event Studio Theme Generator.
User describes their vision: "${userPrompt}" for event type "${eventType || 'Wedding'}".
Return a JSON object with:
- "name": string (creative theme name)
- "description": string (1-2 poetic sentences)
- "estimatedBudget": string
- "guestCapacity": string
- "palette": array of 5 hex color strings
- "decorSuggestions": array of 4 short strings
- "bestFor": string
Only return pure JSON, no markdown codeblocks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = (response.text || '').replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        const parsed = JSON.parse(text);
        const latencyMs = Date.now() - startTime;
        const promptTokens = response.usageMetadata?.promptTokenCount || 100;
        const completionTokens = response.usageMetadata?.candidatesTokenCount || 120;

        await recordAiUsage({
          userId,
          requestId,
          featureName: 'theme_generator',
          modelName: 'gemini-2.5-flash',
          promptTokens,
          completionTokens,
          statusCode: 200,
          latencyMs,
        });

        res.json({ theme: parsed, isLiveAi: true });
        return;
      } catch {
        // Fall through
      }
    }

    const fallbackTheme = {
      name: 'Golden Riviera Sunset',
      description: 'A warm coastal blend of amber festoon lights, terracotta draping, and soft blush florals celebrating by the shoreline.',
      estimatedBudget: '₹7 – 12 lakh',
      guestCapacity: '150 – 400',
      palette: ['#F9EBD7', '#E5A988', '#C96E42', '#8B4513', '#3E2723'],
      decorSuggestions: ['Floating floral archway with fairy lights', 'Rattan lounge seating on sandy terrace', 'Monogrammed linen table runners', 'Acoustic shoreline stage setup'],
      bestFor: 'Beachside Wedding',
    };

    res.json({ theme: fallbackTheme, isLiveAi: false });
  } catch (err: any) {
    res.status(500).json({ error: 'AI theme generation error', details: err.message });
  }
});

export default router;
