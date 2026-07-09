import { logger } from '../utils/logger';
import { validateReportWithGemini } from './geminiService';

export interface AiAnalysisResult {
  aiDetection: {
    label: string;
    confidence: number;
  };
  aiValidation: {
    isValid: boolean;
    confidence: number;
    reason: string;
    reasonHindi: string;
  };
}

/**
 * Analyses a report image via Gemini to return a predicted label,
 * validation flag, and confidence score.
 *
 * @param imageUrl - Public URL of the uploaded image (Cloudinary)
 * @param category - Category reported by the user
 * @param description - Description typed by the user
 */
export const analyzeImage = async (
  imageUrl: string,
  category: string,
  description: string
): Promise<AiAnalysisResult> => {
  logger.info('AI analysis requested via Gemini', { imageUrl, category });

  // Execute Gemini validation
  const validation = await validateReportWithGemini(imageUrl, category, description);

  const result: AiAnalysisResult = {
    aiDetection: {
      label: validation.isValid ? category : 'clean_area',
      confidence: validation.confidence,
    },
    aiValidation: {
      isValid: validation.isValid,
      confidence: validation.confidence,
      reason: validation.reason,
      reasonHindi: validation.reasonHindi,
    },
  };

  logger.info('AI analysis completed successfully', result);
  return result;
};
