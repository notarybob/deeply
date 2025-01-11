import * as React from "react";
import { StepperContext } from "./context";

function usePrevious<T>(value: T): T | undefined {
	let ref = React.useRef<T>();

	React.useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}

export function useStepper() {
	let context = React.useContext(StepperContext);

	if (context === undefined) {
		throw new Error("useStepper must be used within a StepperProvider");
	}

	let { children, className, ...rest } = context;

	let isLastStep = context.activeStep === context.steps.length - 1;
	let hasCompletedAllSteps = context.activeStep === context.steps.length;

	let previousActiveStep = usePrevious(context.activeStep);

	let currentStep = context.steps[context.activeStep];
	let isOptionalStep = !!currentStep?.optional;

	let isDisabledStep = context.activeStep === 0;

	return {
		...rest,
		isLastStep,
		hasCompletedAllSteps,
		isOptionalStep,
		isDisabledStep,
		currentStep,
		previousActiveStep,
	};
}
