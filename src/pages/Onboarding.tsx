import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  return <OnboardingFlow onSkipPaywall={() => navigate("/")} />;
}
