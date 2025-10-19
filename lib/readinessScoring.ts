/**
 * AI Compliance Readiness Check Scoring Logic
 * 
 * This module implements the exact scoring specifications:
 * - 6 categories with 2 questions each (12 total questions)
 * - Scoring scale: 0-3 for each question
 * - Area scores: average of 2 questions per category (rounded to 1 decimal)
 * - Labels: 0-1 = Low, 2 = Medium, 3 = High
 * - Weighted overall score using specified weights
 * - 30-Day Plan generation based on scoring rules
 */

export interface QuestionScore {
  value: number;
  label: string;
  description: string;
}

export interface AreaScore {
  score: number;
  label: 'Low' | 'Medium' | 'High';
}

export interface ReadinessResult {
  areaScores: Record<string, AreaScore>;
  weightedScore: number;
  overallLabel: 'Low' | 'Medium' | 'High';
  plan: string[];
  heatmap: Record<string, number>;
}

// Category weights as specified
export const CATEGORY_WEIGHTS = {
  governance: 0.25,
  data: 0.20,
  security: 0.20,
  vendors: 0.15,
  human_oversight: 0.10,
  transparency: 0.10
} as const;

// Map question IDs to categories
export const QUESTION_CATEGORY_MAP: Record<string, string> = {
  'roles_ownership': 'governance',
  'policies': 'governance',
  'sensitive_data': 'data',
  'data_geography': 'data',
  'access_controls': 'security',
  'protection_logs': 'security',
  'providers': 'vendors',
  'contracts': 'vendors',
  'human_in_loop': 'human_oversight',
  'rollback_incidents': 'human_oversight',
  'user_disclosure': 'transparency',
  'record_keeping': 'transparency'
};

/**
 * Calculate area score for a category
 * @param answers - User answers keyed by question ID
 * @param category - Category name
 * @returns AreaScore with score (0-3) and label (Low/Medium/High)
 */
export function calculateAreaScore(answers: Record<string, number>, category: string): AreaScore {
  const categoryQuestions = Object.entries(QUESTION_CATEGORY_MAP)
    .filter(([_, cat]) => cat === category)
    .map(([questionId, _]) => questionId);

  const scores = categoryQuestions
    .map(qId => answers[qId])
    .filter(score => score !== undefined);

  if (scores.length === 0) {
    return { score: 0, label: 'Low' };
  }

  // Calculate average and round to nearest integer as per client spec
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const roundedScore = Math.round(averageScore);

  // Determine label based on score (0-1 = Low, 2 = Medium, 3 = High)
  let label: 'Low' | 'Medium' | 'High';
  if (roundedScore <= 1) {
    label = 'Low';
  } else if (roundedScore === 2) {
    label = 'Medium';
  } else {
    label = 'High';
  }

  return { score: roundedScore, label };
}

/**
 * Calculate weighted overall score
 * @param areaScores - Area scores for all categories
 * @returns Weighted overall score (0-3)
 */
export function calculateWeightedScore(areaScores: Record<string, AreaScore>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(areaScores).forEach(([category, scoreData]) => {
    const weight = CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS];
    if (weight) {
      weightedSum += scoreData.score * weight;
      totalWeight += weight;
    }
  });

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Get overall risk label based on weighted score
 * @param weightedScore - Weighted overall score
 * @returns Risk label
 */
export function getOverallLabel(weightedScore: number): 'Low' | 'Medium' | 'High' {
  if (weightedScore <= 1) {
    return 'Low';
  } else if (weightedScore <= 2) {
    return 'Medium';
  } else {
    return 'High';
  }
}

/**
 * Generate 30-Day Plan tasks based on exact client specification
 * @param areaScores - Area scores for all categories
 * @param answers - Raw user answers
 * @returns Array of plan tasks with full details
 */
export function generatePlan(areaScores: Record<string, AreaScore>, answers: Record<string, number>): string[] {
  const plan: string[] = [];

  // Security ≥ 2 AND MFA = No → "Enable MFA and RBAC for all admin users"
  if (areaScores.security.score >= 2 && answers.access_controls >= 2) {
    plan.push("Enable MFA and RBAC for all admin users");
  }

  // Vendors ≥ 2 OR no DPA → "Execute DPA with AI provider; review SOC2/ISO docs"
  if (areaScores.vendors.score >= 2 || answers.contracts >= 2) {
    plan.push("Execute DPA with AI provider; review SOC2/ISO docs");
  }

  // Human Oversight ≥ 2 → "Add real-time human review for escalations; define fallback"
  if (areaScores.human_oversight.score >= 2) {
    plan.push("Add real-time human review for escalations; define fallback");
  }

  // Data ≥ 2 AND PHI = Yes → "Limit PHI in prompts; add redaction"
  if (areaScores.data.score >= 2 && answers.sensitive_data === 3) {
    plan.push("Limit PHI in prompts; add redaction");
  }

  // Transparency ≥ 2 → "Add AI disclosure text in UI and Help Center"
  if (areaScores.transparency.score >= 2) {
    plan.push("Add AI disclosure text in UI and Help Center");
  }

  // Governance ≥ 2 → "Publish 1-page AI policy; assign RACI for approvals"
  if (areaScores.governance.score >= 2) {
    plan.push("Publish 1-page AI policy; assign RACI for approvals");
  }

  return plan;
}

/**
 * Process complete readiness assessment
 * @param answers - User answers keyed by question ID
 * @returns Complete readiness result
 */
export function processReadinessAssessment(answers: Record<string, number>): ReadinessResult {
  const categories = ['governance', 'data', 'security', 'vendors', 'human_oversight', 'transparency'];
  
  // Calculate area scores for each category
  const areaScores: Record<string, AreaScore> = {};
  categories.forEach(category => {
    areaScores[category] = calculateAreaScore(answers, category);
  });

  // Calculate weighted overall score
  const weightedScore = calculateWeightedScore(areaScores);
  const overallLabel = getOverallLabel(weightedScore);

  // Generate 30-Day Plan
  const plan = generatePlan(areaScores, answers);

  // Create heatmap for visualization
  const heatmap: Record<string, number> = {};
  Object.entries(areaScores).forEach(([category, scoreData]) => {
    heatmap[category] = scoreData.score;
  });

  return {
    areaScores,
    weightedScore,
    overallLabel,
    plan,
    heatmap
  };
}

/**
 * Validate that all required questions are answered
 * @param answers - User answers
 * @returns True if all questions answered
 */
export function validateAnswers(answers: Record<string, number>): boolean {
  const requiredQuestions = Object.keys(QUESTION_CATEGORY_MAP);
  return requiredQuestions.every(qId => answers[qId] !== undefined);
}

/**
 * Get question categories for UI organization
 * @returns Array of category information
 */
export function getQuestionCategories() {
  return [
    { id: 'governance', name: 'Governance', weight: CATEGORY_WEIGHTS.governance },
    { id: 'data', name: 'Data', weight: CATEGORY_WEIGHTS.data },
    { id: 'security', name: 'Security', weight: CATEGORY_WEIGHTS.security },
    { id: 'vendors', name: 'Vendors', weight: CATEGORY_WEIGHTS.vendors },
    { id: 'human_oversight', name: 'Human Oversight', weight: CATEGORY_WEIGHTS.human_oversight },
    { id: 'transparency', name: 'Transparency', weight: CATEGORY_WEIGHTS.transparency }
  ];
}
