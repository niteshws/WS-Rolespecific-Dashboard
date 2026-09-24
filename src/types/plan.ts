export type DemoPlan = "trial" | "proof" | "profit";

export const isProofPlan = (plan: DemoPlan): boolean => plan === "proof";
