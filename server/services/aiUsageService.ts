import { supabase, localDb } from '../config/supabase';

export interface RecordAiUsageParams {
  userId: string;
  eventId?: string;
  requestId: string;
  featureName: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens?: number;
  statusCode?: number;
  latencyMs?: number;
  errorDetails?: string;
}

// Daily Free Tier Quota Limits
export const DAILY_REQUEST_LIMIT = 50;
export const DAILY_TOKEN_LIMIT = 100000;

export async function checkUserAiQuota(userId: string): Promise<{ allowed: boolean; remainingRequests: number; remainingTokens: number; reason?: string }> {
  let usage = { requestCount: 0, totalTokens: 0 };

  if (supabase) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('prompt_tokens, completion_tokens')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString());

    if (!error && data && data.length > 0) {
      usage.requestCount = data.length;
      usage.totalTokens = data.reduce((sum: number, item: { prompt_tokens: number; completion_tokens: number }) => sum + (item.prompt_tokens + item.completion_tokens), 0);
    } else {
      usage = await localDb.getUserDailyAiUsage(userId);
    }
  } else {
    usage = await localDb.getUserDailyAiUsage(userId);
  }

  const remainingRequests = Math.max(0, DAILY_REQUEST_LIMIT - usage.requestCount);
  const remainingTokens = Math.max(0, DAILY_TOKEN_LIMIT - usage.totalTokens);

  if (usage.requestCount >= DAILY_REQUEST_LIMIT) {
    return {
      allowed: false,
      remainingRequests: 0,
      remainingTokens,
      reason: `Daily request quota reached (${DAILY_REQUEST_LIMIT} requests/day). Limit resets at midnight UTC.`,
    };
  }

  if (usage.totalTokens >= DAILY_TOKEN_LIMIT) {
    return {
      allowed: false,
      remainingRequests,
      remainingTokens: 0,
      reason: `Daily token consumption limit reached (${DAILY_TOKEN_LIMIT.toLocaleString()} tokens/day). Limit resets at midnight UTC.`,
    };
  }

  return { allowed: true, remainingRequests, remainingTokens };
}

export async function recordAiUsage(params: RecordAiUsageParams): Promise<void> {
  const promptTokens = params.promptTokens || 0;
  const completionTokens = params.completionTokens || 0;
  const cachedTokens = params.cachedTokens || 0;

  // Gemini 2.5 Flash Pricing: $0.075 / 1M prompt tokens, $0.30 / 1M completion tokens
  const costPrompt = (promptTokens / 1000000) * 0.075;
  const costCompletion = (completionTokens / 1000000) * 0.30;
  const estimatedCostUsd = parseFloat((costPrompt + costCompletion).toFixed(6));

  if (supabase) {
    const { error } = await supabase.from('ai_usage_logs').insert({
      id: `ailog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: params.userId,
      event_id: params.eventId,
      request_id: params.requestId,
      feature_name: params.featureName,
      model_name: params.modelName,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cached_tokens: cachedTokens,
      estimated_cost_usd: estimatedCostUsd,
      status_code: params.statusCode || 200,
      latency_ms: params.latencyMs || 0,
      error_details: params.errorDetails,
    });

    if (error) {
      console.warn('Supabase AI usage logging warning:', error);
    }
  }

  await localDb.logAiUsage({
    user_id: params.userId,
    event_id: params.eventId,
    request_id: params.requestId,
    feature_name: params.featureName,
    model_name: params.modelName,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    cached_tokens: cachedTokens,
    estimated_cost_usd: estimatedCostUsd,
    status_code: params.statusCode || 200,
    latency_ms: params.latencyMs || 0,
    error_details: params.errorDetails,
  });
}
