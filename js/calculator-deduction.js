// Deduction calculator functionality
const calculateFromDeductions = () => {
    const taxPercentInput = document.getElementById('taxPercent');
    const totalDeductionInput = document.getElementById('totalDeduction');
    const deductionResultsDiv = document.getElementById('deductionResults');

    // Hide results if both inputs are empty
    if (taxPercentInput.value === '' && totalDeductionInput.value === '') {
        deductionResultsDiv.style.display = 'none';
        return;
    }

    // Get values and determine which input to use
    const taxPercent = parseFloat(taxPercentInput.value);
    const totalDeduction = parseFloat(totalDeductionInput.value);

    // Use tax percent if it has a value, otherwise use total deduction
    const targetPercentage = !isNaN(taxPercent) ? taxPercent : totalDeduction;
    const isTaxOnly = !isNaN(taxPercent);

    if (isNaN(targetPercentage) || targetPercentage <= 0 || targetPercentage >= 100) {
        handleInvalidInput(deductionResultsDiv);
        return;
    }

    // Use the generic binary search function if available
    const findGrossForDeduction = (targetPercent, isTaxOnly) => {
        const calcPercentForGross = (gross) => {
            const components = window.memoizedCalculateSalaryComponents 
                ? window.memoizedCalculateSalaryComponents(gross, 0)
                : calculateSalaryComponents(gross, 0);
            return isTaxOnly ? components.taxPercentage : components.deductionPercentage;
        };

        // Use binary search from cache.js if available, otherwise use inline implementation
        if (window.binarySearch) {
            const low = 50000;  // Start with a reasonable minimum
            const high = 1000000;  // Start with a reasonable maximum
            const tolerance = 0.01;

            const grossEstimate = window.binarySearch(calcPercentForGross, targetPercent, low, high, tolerance);

            if (grossEstimate !== null) {
                const roundedGross = Math.ceil(grossEstimate / 10) * 10;

                return window.memoizedCalculateSalaryComponents 
                    ? window.memoizedCalculateSalaryComponents(roundedGross, 0)
                    : calculateSalaryComponents(roundedGross, 0);
            }
            return null;
        } else {
            // Fallback to original implementation
            let low = 50000;  // Start with a reasonable minimum
            let high = 1000000;  // Start with a reasonable maximum
            const tolerance = 0.01;
            const maxIterations = 100;

            for (let i = 0; i < maxIterations; i++) {
                const guess = (low + high) / 2;
                const components = calculateSalaryComponents(guess, 0);
                const currentPercent = isTaxOnly ? components.taxPercentage : components.deductionPercentage;

                if (Math.abs(currentPercent - targetPercent) < tolerance) {
                    return calculateSalaryComponents(Math.ceil(guess / 10) * 10, 0);
                }

                if (currentPercent < targetPercent) low = guess;
                else high = guess;
            }
            return null;
        }
    };

    const result = findGrossForDeduction(targetPercentage, isTaxOnly);
    if (result) {
        updateCalculationResult(result, deductionResultsDiv);
    } else {
        handleInvalidInput(deductionResultsDiv);
    }
};

// Initialize deduction calculator
const initDeductionCalculator = () => {
    const taxPercentInput = document.getElementById('taxPercent');
    const totalDeductionInput = document.getElementById('totalDeduction');

    // Setup debounced handlers for the tax and total deduction inputs
    const setupDeductionInput = (input, otherInput) => {
        input?.addEventListener('input', debounce(() => {
            if (input.value.trim()) {
                otherInput.value = '';
            }
            calculateFromDeductions();
        }, 200));
    };

    setupDeductionInput(taxPercentInput, totalDeductionInput);
    setupDeductionInput(totalDeductionInput, taxPercentInput);
};
