

interface AiScanResult {
  label: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

const PLAUSIBLE_LABELS = [
  { label: 'Garbage Accumulation', priority: 'medium' },
  { label: 'Plastic Pollution', priority: 'medium' },
  { label: 'Debris/Trash Dump', priority: 'medium' },
  { label: 'Water Contamination', priority: 'medium' },
  { label: 'Safety Hazard / Blockage', priority: 'high' },
  { label: 'Suspicious Material', priority: 'high' },
] as const;

export const mockAnalyzeImage = async (_imageUri: string): Promise<AiScanResult> => {
  // simulate network or processing latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const randomIndex = Math.floor(Math.random() * PLAUSIBLE_LABELS.length);
  const selected = PLAUSIBLE_LABELS[randomIndex];
  const confidence = Math.round((82 + Math.random() * 16) * 10) / 10; // e.g., 82.5 to 98

  return {
    label: selected.label,
    confidence,
    priority: selected.priority,
  };
};
