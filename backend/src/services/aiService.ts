import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// TODO(real-AI): replace with YOLO/MobileNet inference service call —
// see docs/ai-integration.md
//
// This mock returns a randomised but plausible detection result from a fixed
// label set. The function signature is intentionally stable so that swapping
// in a real model later requires NO caller changes — just replace the body
// of this function.
// ---------------------------------------------------------------------------

interface AiDetectionResult {
  label: string;
  confidence: number;
}

const MOCK_LABELS = [
  'garbage_dump',
  'plastic_waste',
  'suspicious_object',
  'clean_area',
] as const;

/**
 * Analyses a report image and returns a predicted label + confidence score.
 *
 * @param imageUrl - Public URL of the uploaded image (Cloudinary)
 * @returns          { label, confidence } — confidence is a float in [0.3, 0.98]
 */
export const analyzeImage = async (
  imageUrl: string
): Promise<AiDetectionResult> => {
  logger.info('AI analysis requested (mock)', { imageUrl });

  // Simulate ~200-500ms inference latency
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  const label = MOCK_LABELS[Math.floor(Math.random() * MOCK_LABELS.length)];
  // Confidence between 0.30 and 0.98, rounded to two decimals
  const confidence = Math.round((0.3 + Math.random() * 0.68) * 100) / 100;

  const result: AiDetectionResult = { label, confidence };
  logger.info('AI analysis result (mock)', result);

  return result;
};
