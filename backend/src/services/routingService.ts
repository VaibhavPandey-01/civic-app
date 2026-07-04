import { ReportCategory, ReportPriority } from '../models/Report.model';

// ---------------------------------------------------------------------------
// Department Routing
// ---------------------------------------------------------------------------

/**
 * Maps a report category to the responsible government department.
 *
 * Garbage/pollution categories → Municipal Sanitation
 * Suspicious/emergency categories → Police/Emergency
 */
export const resolveDepartment = (category: ReportCategory): string => {
  switch (category) {
    case 'garbage_dump':
    case 'plastic_pollution':
    case 'waste_accumulation':
    case 'water_pollution':
      return 'Municipal Sanitation';

    case 'suspicious_object':
    case 'emergency_situation':
      return 'Police/Emergency';

    default: {
      // Exhaustiveness check — TypeScript will error here if a new category
      // is added to the enum but not handled in this switch.
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
};

// ---------------------------------------------------------------------------
// Priority Derivation
// ---------------------------------------------------------------------------

/**
 * Derives a priority level from the category and optional AI confidence score.
 *
 * Rules:
 *  - emergency_situation & suspicious_object → always 'high'
 *  - Other categories default to 'medium'
 *  - If aiConfidence is provided and < 0.4, downgrade to 'low'
 *    (the detection was uncertain, so the report is less likely urgent)
 */
export const derivePriority = (
  category: ReportCategory,
  aiConfidence?: number
): ReportPriority => {
  // Emergency and suspicious objects are always high-priority
  if (category === 'emergency_situation' || category === 'suspicious_object') {
    return 'high';
  }

  // If AI ran but has low confidence, the report is likely minor
  if (aiConfidence !== undefined && aiConfidence < 0.4) {
    return 'low';
  }

  return 'medium';
};
