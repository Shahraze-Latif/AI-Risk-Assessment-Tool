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
      return "Your organization demonstrates good AI risk management practices. Continue monitoring and maintaining your current standards.";
    case "Medium":
      return "Your organization has moderate AI risk exposure. Consider implementing additional governance frameworks and regular audits.";
    case "High":
      return "Your organization faces significant AI risks. Immediate action is recommended to establish comprehensive AI governance, ethics policies, and oversight mechanisms.";
  }
}
