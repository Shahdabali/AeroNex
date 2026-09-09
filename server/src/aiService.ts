import { aiService } from './services/aiService';

export { aiService };

// Backward-compatible alias
export const legacyAiService = {
  generateDailyInsights: () => aiService.generateDashboardInsights(),
};
