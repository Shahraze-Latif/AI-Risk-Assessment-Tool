export type RiskLevel = "Low" | "Medium" | "High";

export function calculateRisk(answers: boolean[]): RiskLevel {
  const yesCount = answers.filter(a => a).length;
  if (yesCount <= 3) return "Low";
  if (yesCount <= 6) return "Medium";
  return "High";
}

export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case "Low":
      return "bg-green-100 text-green-800 border-green-300";
    case "Medium":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "High":
      return "bg-red-100 text-red-800 border-red-300";
  }
}

export function getRiskRecommendation(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case "Low":
      return "Your system shows minimal risk.";
    case "Medium":
      return "Some regulatory oversight may apply.";
    case "High":
      return "Your system falls into a higher risk zone. Documentation and safeguards recommended.";
  }
}
