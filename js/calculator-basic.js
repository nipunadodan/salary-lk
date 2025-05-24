// Basic salary calculator functionality
const calculateDeductions = () => {
    const basicInput = document.getElementById('basic');
    const allowanceInput = document.getElementById('allowance');
    const resultsDiv = document.getElementById('results');

    const basicSalary = parseFloat(basicInput.value) || 0;
    const allowance = parseFloat(allowanceInput.value) || 0;

    // Hide results if both inputs are empty
    if (basicInput.value === '' && allowanceInput.value === '') {
        resultsDiv.style.display = 'none';
        return;
    }

    if (basicSalary <= 0) {
        handleInvalidInput(resultsDiv);
        return;
    }

    const components = calculateSalaryComponents(basicSalary, allowance);
    updateCalculationResult(components, resultsDiv);
};

// Initialize basic calculator
const initBasicCalculator = () => {
    const basicInput = document.getElementById('basic');
    const allowanceInput = document.getElementById('allowance');

    // Setup debounced calculations
    [basicInput, allowanceInput].forEach(input => {
        input?.addEventListener('input', debounce(calculateDeductions, 200));
    });
};