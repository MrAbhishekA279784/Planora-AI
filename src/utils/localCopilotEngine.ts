import { EventItem } from '../types';

export interface CopilotResponse {
  reply: string;
  actionData?: any;
  isLiveAi: boolean;
}

export function generateLocalCopilotResponse(
  message: string,
  activeEvent?: EventItem | null
): CopilotResponse {
  const lower = message.trim().toLowerCase();

  // 1. Casual Greetings
  if (/^(hi|hii|hiii|hello|hey|heyy|namaste|hola|greetings)\b/i.test(lower)) {
    const eventContext = activeEvent ? ` for "${activeEvent.name}"` : '';
    return {
      reply: `Hi there! I'm Planora AI, your personal Event Copilot.\n\nI'm ready to help you curate your dream celebration${eventContext}. Tell me what you're planning — I can shape your budget, draft your milestone timeline, discover verified vendors, or suggest decor palettes!`,
      isLiveAi: false,
    };
  }

  // 2. Budget Planning
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('how much') || lower.includes('allocation') || lower.includes('price')) {
    const totalBudget = activeEvent?.totalBudget || 800000;
    const formattedTotal = `₹${totalBudget.toLocaleString('en-IN')}`;

    const suggestedBudgets = [
      { category: 'Venue & Banquet Lawn', percentage: 35, amount: Math.round(totalBudget * 0.35) },
      { category: 'Artisanal Catering & Beverage', percentage: 30, amount: Math.round(totalBudget * 0.30) },
      { category: 'Decor, Mandap & Stage Lighting', percentage: 15, amount: Math.round(totalBudget * 0.15) },
      { category: 'Photography & Drone Media', percentage: 10, amount: Math.round(totalBudget * 0.10) },
      { category: 'Contingency & Hospitality Buffer', percentage: 10, amount: Math.round(totalBudget * 0.10) },
    ];

    return {
      reply: `Here is a balanced, high-impact budget blueprint for a total budget of ${formattedTotal}:\n\n` +
        `• **Venue & Banquet Lawn (35%)**: ₹${suggestedBudgets[0].amount.toLocaleString('en-IN')} — prime coastal or resort spaces\n` +
        `• **Artisanal Catering (30%)**: ₹${suggestedBudgets[1].amount.toLocaleString('en-IN')} — welcome drinks + multi-cuisine buffet\n` +
        `• **Decor & Floral Styling (15%)**: ₹${suggestedBudgets[2].amount.toLocaleString('en-IN')} — ambient lighting, canopies & floral accents\n` +
        `• **Photography & Media (10%)**: ₹${suggestedBudgets[3].amount.toLocaleString('en-IN')} — cinematic bridal and drone footage\n` +
        `• **Contingency Buffer (10%)**: ₹${suggestedBudgets[4].amount.toLocaleString('en-IN')} — taxes, unexpected additions & vendor tips\n\n` +
        `*Click below to apply this allocation directly to your event budget!*`,
      actionData: {
        actionType: 'budget',
        suggestedBudgets,
      },
      isLiveAi: false,
    };
  }

  // 3. Timeline, Tasks & Checklists
  if (lower.includes('timeline') || lower.includes('task') || lower.includes('checklist') || lower.includes('schedule') || lower.includes('plan')) {
    const eventDate = activeEvent?.date || '2026-04-15';

    const suggestedTasks = [
      { title: 'Lock Primary Venue & Sign Agreement', category: 'Venue', dueDate: eventDate, priority: 'critical' },
      { title: 'Finalize Menu Tasting with Caterer', category: 'Catering', dueDate: eventDate, priority: 'high' },
      { title: 'Select Theme Palette & Floral Moodboard', category: 'Decoration', dueDate: eventDate, priority: 'medium' },
      { title: 'Book Candid Wedding / Event Photographer', category: 'Photography', dueDate: eventDate, priority: 'high' },
      { title: 'Send Digital RSVP Invitations to Guests', category: 'Planning', dueDate: eventDate, priority: 'medium' },
    ];

    return {
      reply: `Here is your customized milestone timeline and task roadmap leading up to ${eventDate}:\n\n` +
        `1. **Lock Primary Venue**: Secure dates and confirm sound curfew permissions.\n` +
        `2. **Food & Beverage**: Book food tastings and lock live cooking stations.\n` +
        `3. **Aesthetic Architecture**: Align on stage backdrop, mandap florals, and fairy lighting.\n` +
        `4. **Media Team**: Schedule drone and pre-event portrait sessions.\n` +
        `5. **Guest Logistics**: Dispatch RSVP invitations and track dietary needs.\n\n` +
        `*Click "Add Tasks to Active Event" below to instantly sync these milestones to your timeline.*`,
      actionData: {
        actionType: 'tasks',
        suggestedTasks,
      },
      isLiveAi: false,
    };
  }

  // 4. Themes & Decor
  if (lower.includes('theme') || lower.includes('decor') || lower.includes('aesthetic') || lower.includes('color') || lower.includes('style')) {
    return {
      reply: `I recommend the **Golden Riviera Sunset** aesthetic concept:\n\n` +
        `• **Color Palette**: Terracotta Sunset (#B86B2A), Royal Cream (#FBF7EF), Warm Gold (#D7A34B), and Deep Espresso (#4A2C1B).\n` +
        `• **Decor Accents**: Bohemian macrame arches, warm amber Edison bulbs, rattan lounge seating, and pampas grass florals.\n` +
        `• **Atmosphere**: Relaxed coastal luxury that transitions seamlessly from golden hour into an evening celebration.`,
      actionData: {
        actionType: 'theme',
        suggestedTheme: {
          name: 'Golden Riviera Sunset',
          palette: ['#FBF7EF', '#FBE8D3', '#D7A34B', '#B86B2A', '#4A2C1B'],
          description: 'A warm coastal blend of amber festoon lights, terracotta draping, and soft blush florals.',
        },
      },
      isLiveAi: false,
    };
  }

  // 5. Vendors & Venues
  if (lower.includes('vendor') || lower.includes('venue') || lower.includes('cater') || lower.includes('photo') || lower.includes('places')) {
    return {
      reply: `Here are key recommendations for choosing verified vendors:\n\n` +
        `• **Resort & Banquet Venues**: Verify backup generator capacity, outside vendor corkage policies, and guest accommodation rates.\n` +
        `• **Artisanal Catering**: Ensure a balanced mix of live interactive chaat/gourmet counters and seated dinner.\n` +
        `• **Photography & Cinema**: Request full delivered event galleries rather than just Instagram highlights.\n\n` +
        `Explore the **Vendors** tab in Planora AI to browse verified partners with pricing, ratings, and instant inquiry messaging!`,
      isLiveAi: false,
    };
  }

  // 6. Default Helpful Celebration Planning Advice
  return {
    reply: `Here are thoughtful recommendations for "${message}":\n\n` +
      `• **Prioritize Guest Flow**: Keep welcome drinks and registration seamless within the first 30 minutes.\n` +
      `• **Smart Budgeting**: Keep a 10% unallocated buffer for last-minute upgrades or sound permissions.\n` +
      `• **Vendor Alignment**: Share your day-of schedule with all vendor leads 48 hours prior.\n\n` +
      `Ask me to create a budget breakdown, build your timeline, or suggest themes anytime!`,
    isLiveAi: false,
  };
}
