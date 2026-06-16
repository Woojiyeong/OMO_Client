import type { AiCoordiDetail, AiCoordiSummary } from './types';

export const MOCK_AI_RESULTS: AiCoordiSummary[] = [];

export const MOCK_AI_DETAILS: Record<string, AiCoordiDetail> = {};

export function getAiDetailById(id: string): AiCoordiDetail | undefined {
  return MOCK_AI_DETAILS[id];
}
