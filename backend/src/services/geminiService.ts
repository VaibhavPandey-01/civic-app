import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  reasonHindi: string;
}

/**
 * Validates a user's report using Google Gemini 2.5 Flash.
 * Compares the image contents with the selected category and text description.
 *
 * @param imageUrl - Cloudinary public URL of the uploaded image
 * @param category - User selected report category
 * @param description - User typed description
 */
export const validateReportWithGemini = async (
  imageUrl: string,
  category: string,
  description: string
): Promise<ValidationResult> => {
  if (!env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not configured. Falling back to mock validation.');
    // Simulated mock validation success
    return {
      isValid: true,
      confidence: 0.95,
      reason: 'Mock validation passed (Gemini API key missing)',
      reasonHindi: 'मॉक सत्यापन सफल (जेमिनी एपीआई कुंजी गायब)',
    };
  }

  try {
    logger.info('Starting Gemini multimodal image validation...', { imageUrl });

    // 1. Download image from Cloudinary as binary buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from Cloudinary: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // 2. Prepare Gemini client
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 3. Construct prompt and parts
    const prompt = `You are a civic issue validator for the CivicSafe application.
Analyze this report image and user-provided metadata:
Category: ${category}
Description: ${description}

Task:
1. Analyze the image to detect if it shows a real civic/environmental issue or safety hazard (e.g. garbage dumps, plastic waste, water pollution, potholes, broken roads, overflowing sewers, or safety hazards).
2. Compare the image with the Category and Description. Determine if they match and represent an authentic report.
3. Check if the image is a selfie, screenshot, clean indoor living space, or a photo taken of a screen/monitor (suggesting location/image spoofing). If so, it is invalid.

You must return a valid JSON object matching this schema:
{
  "isValid": boolean, // true if image shows a real environmental/safety issue matching description & category. false if clean, selfie, spoof, or mismatch.
  "confidence": number, // float in [0.0, 1.0] representing validation confidence
  "reason": string, // Short description explaining your decision in English (keep under 15 words)
  "reasonHindi": string // Short description explaining your decision in Hindi (keep under 15 words)
}`;

    const imagePart: Part = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    };

    // 4. Request validation
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart,
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    logger.info('Gemini validation response text:', { text });

    const parsed: ValidationResult = JSON.parse(text);
    return {
      isValid: typeof parsed.isValid === 'boolean' ? parsed.isValid : true,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      reason: parsed.reason || 'Completed analysis',
      reasonHindi: parsed.reasonHindi || 'सत्यापन पूर्ण हुआ',
    };
  } catch (error) {
    logger.error('Error during Gemini report validation:', { error });
    // Default fallback to true to prevent blocking users on API downtime
    return {
      isValid: true,
      confidence: 0.5,
      reason: 'Validation bypassed due to system error',
      reasonHindi: 'सिस्टम त्रुटi के कारण सत्यापन को बायपास किया गया',
    };
  }
};

export interface ResolutionVerificationResult {
  isVerified: boolean;
  confidence: number;
  reason: string;
  reasonHindi: string;
}

/**
 * Compares the original incident image with the resolution image using Gemini.
 * Matches landmarks to verify same location and checks if incident is resolved.
 */
export const verifyResolutionWithGemini = async (
  originalImageUrl: string,
  resolutionImageUrl: string,
  category: string
): Promise<ResolutionVerificationResult> => {
  if (!env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not configured. Falling back to mock resolution verification.');
    return {
      isVerified: true,
      confidence: 0.95,
      reason: 'Mock verification passed (API key missing)',
      reasonHindi: 'मॉक सत्यापन सफल (एपीआई कुंजी गायब)',
    };
  }

  try {
    logger.info('Starting Gemini multimodal resolution verification...', { originalImageUrl, resolutionImageUrl });

    // 1. Fetch both images as binary data
    const [originalRes, resolutionRes] = await Promise.all([
      fetch(originalImageUrl),
      fetch(resolutionImageUrl),
    ]);

    if (!originalRes.ok || !resolutionRes.ok) {
      throw new Error(`Failed to fetch one or both images: A: ${originalRes.statusText}, B: ${resolutionRes.statusText}`);
    }

    const [origBuffer, resBuffer] = await Promise.all([
      originalRes.arrayBuffer(),
      resolutionRes.arrayBuffer(),
    ]);

    const origBase64 = Buffer.from(origBuffer).toString('base64');
    const resBase64 = Buffer.from(resBuffer).toString('base64');

    // 2. Prepare Gemini client
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 3. Construct prompt
    const prompt = `You are a civic issue resolution validator.
Analyze these two images:
Image A: The original reported incident (Category: ${category}).
Image B: The uploaded cleanup/resolution evidence.

Task:
1. Verify if Image B is taken in the same location as Image A by matching structural background features (e.g. buildings, walls, trees, street poles, floor patterns, or window frames). Note that the camera angles, zoom, and time of day will differ.
2. Verify if the incident reported in Image A (such as garbage piles, leaks, or potholes) has been successfully cleaned, resolved, or repaired in Image B.

You must return a valid JSON object matching this schema:
{
  "isVerified": boolean, // true if both images are in the same location AND the issue is cleaned/resolved. false if mismatched locations or the issue is still active.
  "confidence": number, // float in [0.0, 1.0] representing verification confidence
  "reason": string, // Short description of matching landmarks and cleanliness in English (under 15 words)
  "reasonHindi": string // Short description of matching landmarks and cleanliness in Hindi (under 15 words)
}`;

    const origPart: Part = {
      inlineData: {
        data: origBase64,
        mimeType: 'image/jpeg',
      },
    };

    const resPart: Part = {
      inlineData: {
        data: resBase64,
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            origPart,
            resPart,
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    logger.info('Gemini resolution verification response text:', { text });

    const parsed: ResolutionVerificationResult = JSON.parse(text);
    return {
      isVerified: typeof parsed.isVerified === 'boolean' ? parsed.isVerified : true,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      reason: parsed.reason || 'Verification processed successfully',
      reasonHindi: parsed.reasonHindi || 'सत्यापन सफलतापूर्वक पूर्ण हुआ',
    };
  } catch (error) {
    logger.error('Error during Gemini resolution verification:', { error });
    throw error;
  }
};
