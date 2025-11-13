import { useState } from "react";
import Welcome from "./Welcome";
import Onboarding from "./Onboarding";
import Auth from "./Auth";

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  switch (currentStep) {
    case 0:
      return <Welcome onContinue={handleNext} />;
    case 1:
      return <Onboarding onContinue={handleNext} />;
    case 2:
    default:
      return <Auth />;
  }
};

export default OnboardingFlow;