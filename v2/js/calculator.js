// Unified Calculator Module
class Calculator {
  // Calculator types
  static TYPES = {
    BASIC: 'basic',
    REVERSE: 'net',
    DEDUCTION: 'deduction'
  };

  constructor() {
    this.initializeCalculators();
  }

  // Initialize all calculators
  initializeCalculators() {
    this.setupBasicCalculator();
    this.setupReverseCalculator();
    this.setupDeductionCalculator();
  }

  // Fallback binary search implementation if window.binarySearch is not available
  fallbackBinarySearch(targetFn, targetValue, low, high, tolerance = 0.01, maxIterations = 100) {
    for (let i = 0; i < maxIterations; i++) {
      const guess = (low + high) / 2;
      const current = targetFn(guess);

      if (Math.abs(current - targetValue) < tolerance) {
        return guess;
      }

      if (current < targetValue) low = guess;
      else high = guess;
    }
    return null;
  }

  // Basic calculator setup
  setupBasicCalculator() {
    const basicInput = document.getElementById('basic');
    const allowanceInput = document.getElementById('allowance');

    if (!basicInput || !allowanceInput) return;

    // Setup debounced calculations
    [basicInput, allowanceInput].forEach(input => {
      input.addEventListener('input', debounce(() => this.calculateBasic(), 200));
    });
  }

  // Reverse calculator setup
  setupReverseCalculator() {
    const netInput = document.getElementById('net');
    const reverseAllowanceInput = document.getElementById('reverseAllowance');

    if (!netInput || !reverseAllowanceInput) return;

    // Setup debounced calculations
    [netInput, reverseAllowanceInput].forEach(input => {
      input.addEventListener('input', debounce(() => this.calculateReverse(), 800));
    });
  }

  // Deduction calculator setup
  setupDeductionCalculator() {
    const taxPercentInput = document.getElementById('taxPercent');
    const totalDeductionInput = document.getElementById('totalDeduction');

    if (!taxPercentInput || !totalDeductionInput) return;

    // Setup debounced calculations
    [taxPercentInput, totalDeductionInput].forEach(input => {
      input.addEventListener('input', debounce(() => this.calculateDeduction(), 800));
    });

    // Clear other input when one is being used
    taxPercentInput.addEventListener('input', () => {
      if (taxPercentInput.value) {
        totalDeductionInput.value = '';
      }
    });

    totalDeductionInput.addEventListener('input', () => {
      if (totalDeductionInput.value) {
        taxPercentInput.value = '';
      }
    });
  }

  // Basic calculator logic
  calculateBasic() {
    const basicInput = document.getElementById('basic');
    const allowanceInput = document.getElementById('allowance');
    const resultsDiv = document.getElementById('results');
    const shareButton = document.querySelector('[onclick="shareCalculator(\'basic\')"]');

    const basicSalary = parseFloat(basicInput.value) || 0;
    const allowance = parseFloat(allowanceInput.value) || 0;

    // Hide results if both inputs are empty
    if (basicInput.value === '' && allowanceInput.value === '') {
      resultsDiv.style.display = 'none';
      shareButton.classList.remove('visible');
      return;
    }

    if (basicSalary <= 0) {
      handleInvalidInput(resultsDiv);
      shareButton.classList.remove('visible');
      return;
    }

    const components = window.calculateSalaryComponents(basicSalary, allowance);
    updateCalculationResult(components, resultsDiv);

    resultsDiv.style.display = 'block';
    shareButton.classList.add('visible');
  }

  // Reverse calculator logic
  calculateReverse() {
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

    const calcNetForGross = (gross) => {
      const basicSalary = Math.max(gross - allowance, 0);
      const components = window.memoizedCalculateSalaryComponents
        ? window.memoizedCalculateSalaryComponents(basicSalary, allowance)
        : window.calculateSalaryComponents(basicSalary, allowance);
      return components.net;
    };

    const low = desiredNet;
    const high = desiredNet * 2;
    const tolerance = 1;

    // Check if binarySearch is available, otherwise provide a fallback implementation
    const grossEstimate = window.binarySearch 
      ? window.binarySearch(calcNetForGross, desiredNet, low, high, tolerance)
      : this.fallbackBinarySearch(calcNetForGross, desiredNet, low, high, tolerance);

    if (grossEstimate !== null) {
      const basicSalary = Math.max(grossEstimate - allowance, 0);
      const roundedBasic = Math.ceil(basicSalary / 10) * 10;

      const result = window.memoizedCalculateSalaryComponents
        ? window.memoizedCalculateSalaryComponents(roundedBasic, allowance)
        : window.calculateSalaryComponents(roundedBasic, allowance);

      updateCalculationResult(result, reverseResultsDiv);
      reverseResultsDiv.style.display = 'block';
      shareButton.classList.add('visible');
    } else {
      handleInvalidInput(reverseResultsDiv);
      shareButton.classList.remove('visible');
    }
  }

  // Deduction calculator logic
  calculateDeduction() {
    const taxPercentInput = document.getElementById('taxPercent');
    const totalDeductionInput = document.getElementById('totalDeduction');
    const deductionResultsDiv = document.getElementById('deductionResults');
    const shareButton = document.querySelector('[onclick="shareCalculator(\'deduction\')"]');

    // Hide results if both inputs are empty
    if (taxPercentInput.value === '' && totalDeductionInput.value === '') {
      deductionResultsDiv.style.display = 'none';
      shareButton.classList.remove('visible');
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
      shareButton.classList.remove('visible');
      return;
    }

    const calcPercentForGross = (gross) => {
      const components = window.memoizedCalculateSalaryComponents
        ? window.memoizedCalculateSalaryComponents(gross, 0)
        : window.calculateSalaryComponents(gross, 0);
      return isTaxOnly ? components.taxPercentage : components.deductionPercentage;
    };

    const low = 50000;  // Start with a reasonable minimum
    const high = 1000000;  // Start with a reasonable maximum
    const tolerance = 0.01;

    // Check if binarySearch is available, otherwise provide a fallback implementation
    const grossEstimate = window.binarySearch 
      ? window.binarySearch(calcPercentForGross, targetPercentage, low, high, tolerance)
      : this.fallbackBinarySearch(calcPercentForGross, targetPercentage, low, high, tolerance);

    if (grossEstimate !== null) {
      const roundedGross = Math.ceil(grossEstimate / 10) * 10;

      const result = window.memoizedCalculateSalaryComponents
        ? window.memoizedCalculateSalaryComponents(roundedGross, 0)
        : window.calculateSalaryComponents(roundedGross, 0);

      updateCalculationResult(result, deductionResultsDiv);
      deductionResultsDiv.style.display = 'block';
      shareButton.classList.add('visible');
    } else {
      handleInvalidInput(deductionResultsDiv);
      shareButton.classList.remove('visible');
    }
  }
}

// Initialize calculator on load
const initCalculators = () => {
  window.calculatorInstance = new Calculator();
};

// Export functions for backward compatibility
const initBasicCalculator = () => {};
const initReverseCalculator = () => {};
const initDeductionCalculator = () => {};
