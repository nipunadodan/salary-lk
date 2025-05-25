// Reverse calculator functionality
const reverseCalculate = () => {
    const netInput = document.getElementById('net');
    const allowanceInput = document.getElementById('reverseAllowance');
    const reverseResultsDiv = document.getElementById('reverseResults');
    const shareButton = document.querySelector('[onclick="shareCalculator(\'net\')"]');

    // Hide results if both inputs are empty
    if (netInput.value === '' && allowanceInput.value === '') {
        reverseResultsDiv.style.display = 'none';
        shareButton.classList.remove('visible');
        return;
    }

    const desiredNet = parseFloat(netInput.value);
    const allowance = parseFloat(allowanceInput.value) || 0;

    if (isNaN(desiredNet) || desiredNet <= 0) {
        handleInvalidInput(reverseResultsDiv);
        shareButton.classList.remove('visible');
        return;
    }

    // Use the generic binary search function if available
    const findGrossForNet = (targetNet, allowance) => {
        const calcNetForGross = (gross) => {
            const basicSalary = Math.max(gross - allowance, 0);
            const components = window.memoizedCalculateSalaryComponents
                ? window.memoizedCalculateSalaryComponents(basicSalary, allowance)
                : calculateSalaryComponents(basicSalary, allowance);
            return components.net;
        };

        // Use binary search from cache.js if available, otherwise use inline implementation
        if (window.binarySearch) {
            const low = targetNet;
            const high = targetNet * 2;
            const tolerance = 1;

            const grossEstimate = window.binarySearch(calcNetForGross, targetNet, low, high, tolerance);

            if (grossEstimate !== null) {
                const basicSalary = Math.max(grossEstimate - allowance, 0);
                const roundedBasic = Math.ceil(basicSalary / 10) * 10;

                return window.memoizedCalculateSalaryComponents
                    ? window.memoizedCalculateSalaryComponents(roundedBasic, allowance)
                    : calculateSalaryComponents(roundedBasic, allowance);
            }
            return null;
        } else {
            // Fallback to original implementation
            let low = targetNet;
            let high = targetNet * 2;
            const tolerance = 1;
            const maxIterations = 100;

            for (let i = 0; i < maxIterations; i++) {
                const guess = (low + high) / 2;
                const basicSalary = Math.max(guess - allowance, 0);
                const {net} = calculateSalaryComponents(basicSalary, allowance);

                if (Math.abs(net - targetNet) < tolerance) {
                    const roundedBasic = Math.ceil(basicSalary / 10) * 10;
                    return calculateSalaryComponents(roundedBasic, allowance);
                }

                if (net < targetNet) low = guess;
                else high = guess;
            }
            return null;
        }
    };

    const result = findGrossForNet(desiredNet, allowance);
    if (result) {
        updateCalculationResult(result, reverseResultsDiv);
        reverseResultsDiv.style.display = 'block';
        shareButton.classList.add('visible');
    } else {
        handleInvalidInput(reverseResultsDiv);
        shareButton.classList.remove('visible');
    }
};

// Initialize reverse calculator
const initReverseCalculator = () => {
    const netInput = document.getElementById('net');
    const reverseAllowanceInput = document.getElementById('reverseAllowance');

    // Setup debounced calculations
    [netInput, reverseAllowanceInput].forEach(input => {
        input?.addEventListener('input', debounce(reverseCalculate, 800));
    });
};
