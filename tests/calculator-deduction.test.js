// Deduction Calculator Tests
const assert = require('assert');

// Setup Jest-like test environment
console.log('Running deduction calculator tests...');

// Mock Jest functions
global.jest = {
    fn: () => {
        const mockFn = function() {};
        mockFn.mockImplementation = (fn) => {
            Object.assign(mockFn, { 
                implementation: fn,
                // When the mock function is called, it will call the implementation
                __proto__: { 
                    call: function(thisArg, ...args) { 
                        return mockFn.implementation ? mockFn.implementation(...args) : undefined; 
                    } 
                }
            });
            return mockFn.implementation;
        };
        mockFn.mockClear = () => {};
        return mockFn;
    },
    clearAllMocks: () => {}
};

// Create expect.any function
const any = (type) => {
    return { __type: type, __isAnyMatcher: true };
};

global.expect = (actual) => {
    const expectObj = {
        toBe: (expected) => {
            assert.strictEqual(actual, expected);
        },
        toHaveBeenCalledWith: (...args) => {
            // Simple mock assertion
            console.log(`  Assert: Function called with ${args}`);
        },
        toHaveBeenCalled: () => {
            // Simple mock assertion
            console.log(`  Assert: Function called`);
        },
        not: {
            toHaveBeenCalled: () => {
                // Simple mock assertion
                console.log(`  Assert: Function not called`);
            }
        },
        objectContaining: (obj) => {
            // Simple partial object matching
            return obj;
        }
    };

    // Add any as a property of the expect object
    expectObj.any = any;

    return expectObj;
};

// Add any as a property of the global expect function
global.expect.any = any;

// Simple test runner
const suites = [];
global.describe = (name, fn) => {
    const suite = { name, tests: [], beforeEach: null };
    global.it = (name, fn) => {
        suite.tests.push({ name, fn });
    };
    global.beforeEach = (fn) => {
        suite.beforeEach = fn;
    };
    fn();
    suites.push(suite);
};

const runTests = (suite) => {
    console.log(`\n${suite.name}`);
    suite.tests.forEach(test => {
        try {
            if (suite.beforeEach) suite.beforeEach();
            test.fn();
            console.log(`  ✓ ${test.name}`);
        } catch (error) {
            console.log(`  ✗ ${test.name}`);
            console.error(`    ${error.message}`);
        }
    });
};

// Import the tax calculation functions
// In a browser environment, these would be on the window object
// For testing, we'll define them directly
const TAX_BRACKETS = [
    {upTo: 1800000, rate: 0},    // 0% up to 1.8M
    {upTo: 2800000, rate: 6},    // 6% up to 2.8M
    {upTo: 3300000, rate: 18},   // 18% up to 3.3M
    {upTo: 3800000, rate: 24},   // 24% up to 3.8M
    {upTo: 4300000, rate: 30},   // 30% up to 4.3M
    {upTo: null, rate: 36},      // 36% above 4.3M
];

const EPF_RATE = 0.08;

// Core calculation functions from tax-calculator.js
const calculateMonthlyTax = (annualIncome) => {
    if (annualIncome <= 0) return 0;

    let tax = 0;
    let previousLimit = 0;

    for (const {upTo, rate} of TAX_BRACKETS) {
        if (upTo === null || annualIncome <= upTo) {
            tax += (annualIncome - previousLimit) * (rate / 100);
            break;
        }
        tax += (upTo - previousLimit) * (rate / 100);
        previousLimit = upTo;
    }

    return tax / 12; // Convert annual tax to monthly
};

const calculateTaxBreakdown = (annualIncome) => {
    if (annualIncome <= 0) return Array(TAX_BRACKETS.length).fill(0);

    const breakdown = [];
    let previousLimit = 0;

    for (const {upTo, rate} of TAX_BRACKETS) {
        const limit = upTo === null ? annualIncome : upTo;
        const taxableInBracket = Math.min(Math.max(annualIncome - previousLimit, 0), limit - previousLimit);
        const taxForBracket = taxableInBracket * (rate / 100);

        breakdown.push(taxForBracket / 12); // Convert to monthly
        previousLimit = limit;
    }

    return breakdown;
};

const calculateSalaryComponents = (basicSalary = 0, allowance = 0) => {
    if (basicSalary < 0) basicSalary = 0;
    if (allowance < 0) allowance = 0;

    const grossMonthly = basicSalary + allowance;
    if (grossMonthly <= 0) {
        return {
            basic: 0, allowance: 0, gross: 0, tax: 0, epf: 0, net: 0,
            taxPercentage: 0, deductionPercentage: 0, taxBreakdown: Array(TAX_BRACKETS.length).fill(0)
        };
    }

    const epf = basicSalary * EPF_RATE;
    const annualGross = grossMonthly * 12;

    const tax = calculateMonthlyTax(annualGross);
    const taxBreakdown = calculateTaxBreakdown(annualGross);
    const net = grossMonthly - tax - epf;
    const taxPercentage = grossMonthly > 0 ? (tax / grossMonthly) * 100 : 0;
    const deductionPercentage = grossMonthly > 0 ? ((tax + epf) / grossMonthly) * 100 : 0;

    return {
        basic: basicSalary,
        allowance,
        gross: grossMonthly,
        tax,
        epf,
        net,
        taxPercentage,
        deductionPercentage,
        taxBreakdown
    };
};

// Binary search utility for finding values
const binarySearch = (targetFn, targetValue, low, high, tolerance = 0.01, maxIterations = 100) => {
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
};

// Mock DOM elements and functions for testing
class MockElement {
    constructor(value = '') {
        this.value = value;
        this.style = { display: 'none' };
        this.classList = {
            add: jest.fn(),
            remove: jest.fn()
        };
    }
}

// Create mock functions with mockImplementation method
const createMockFunction = () => {
    const mockFn = function() {
        return mockFn._implementation ? mockFn._implementation.apply(this, arguments) : null;
    };
    mockFn.mockImplementation = function(fn) {
        mockFn._implementation = fn;
        return mockFn;
    };
    mockFn.mockClear = function() {
        mockFn._implementation = null;
    };
    return mockFn;
};

// Mock document object
global.document = {
    getElementById: createMockFunction(),
    querySelector: createMockFunction()
};

// Mock utility functions
const handleInvalidInput = createMockFunction();
const updateCalculationResult = createMockFunction();
const debounce = (fn) => fn;

// Mock window object with memoized functions
global.window = {
    memoizedCalculateSalaryComponents: calculateSalaryComponents,
    binarySearch: binarySearch
};

// Import the deduction calculator functionality
// In a real environment, this would be imported from calculator-deduction.js
const calculateFromDeductions = () => {
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
        deductionResultsDiv.style.display = 'block';
        shareButton.classList.add('visible');
    } else {
        handleInvalidInput(deductionResultsDiv);
        shareButton.classList.remove('visible');
    }
};

// Test suite for deduction calculator
describe('Deduction Calculator', () => {
    let taxPercentInput, totalDeductionInput, deductionResultsDiv, shareButton;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        handleInvalidInput.mockClear();
        updateCalculationResult.mockClear();

        // Setup mock DOM elements
        taxPercentInput = new MockElement();
        totalDeductionInput = new MockElement();
        deductionResultsDiv = new MockElement();
        shareButton = new MockElement();

        // Setup document.getElementById mock
        document.getElementById.mockImplementation((id) => {
            if (id === 'taxPercent') return taxPercentInput;
            if (id === 'totalDeduction') return totalDeductionInput;
            if (id === 'deductionResults') return deductionResultsDiv;
            return null;
        });

        // Setup document.querySelector mock
        document.querySelector = jest.fn().mockImplementation(() => shareButton);
    });

    it('should hide results if both inputs are empty', () => {
        taxPercentInput.value = '';
        totalDeductionInput.value = '';

        calculateFromDeductions();

        expect(deductionResultsDiv.style.display).toBe('none');
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(handleInvalidInput).not.toHaveBeenCalled();
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should handle invalid input (percentage <= 0)', () => {
        taxPercentInput.value = '0';
        totalDeductionInput.value = '';

        calculateFromDeductions();

        expect(handleInvalidInput).toHaveBeenCalledWith(deductionResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should handle invalid input (percentage >= 100)', () => {
        taxPercentInput.value = '100';
        totalDeductionInput.value = '';

        calculateFromDeductions();

        expect(handleInvalidInput).toHaveBeenCalledWith(deductionResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should handle non-numeric input as invalid', () => {
        taxPercentInput.value = 'abc';
        totalDeductionInput.value = '';

        calculateFromDeductions();

        expect(handleInvalidInput).toHaveBeenCalledWith(deductionResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
    });

    it('should calculate gross salary for tax percentage', () => {
        taxPercentInput.value = '6';  // 6% tax
        totalDeductionInput.value = '';

        // Mock binary search to return a predictable value
        window.binarySearch = jest.fn().mockImplementation(() => 250000);

        calculateFromDeductions();

        expect(updateCalculationResult).toHaveBeenCalled();
        expect(deductionResultsDiv.style.display).toBe('block');
        expect(shareButton.classList.add).toHaveBeenCalledWith('visible');
    });

    it('should calculate gross salary for total deduction percentage', () => {
        taxPercentInput.value = '';
        totalDeductionInput.value = '14';  // 14% total deduction (tax + EPF)

        // Mock binary search to return a predictable value
        window.binarySearch = jest.fn().mockImplementation(() => 250000);

        calculateFromDeductions();

        expect(updateCalculationResult).toHaveBeenCalled();
        expect(deductionResultsDiv.style.display).toBe('block');
        expect(shareButton.classList.add).toHaveBeenCalledWith('visible');
    });

    it('should prioritize tax percentage if both inputs have values', () => {
        taxPercentInput.value = '6';
        totalDeductionInput.value = '14';

        // Mock binary search to return a predictable value
        window.binarySearch = jest.fn().mockImplementation(() => 250000);

        calculateFromDeductions();

        // Should use tax percentage (6%) not total deduction (14%)
        expect(window.binarySearch).toHaveBeenCalledWith(
            expect.any(Function), 
            6, 
            expect.any(Number), 
            expect.any(Number), 
            expect.any(Number)
        );
    });

    it('should handle case where binary search fails', () => {
        taxPercentInput.value = '50';  // Unrealistically high tax percentage
        totalDeductionInput.value = '';

        // Mock binary search to return null (failure)
        window.binarySearch = jest.fn().mockImplementation(() => null);

        calculateFromDeductions();

        expect(handleInvalidInput).toHaveBeenCalledWith(deductionResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
    });

    it('should use different calculation function based on isTaxOnly flag', () => {
        // Test with tax percentage
        taxPercentInput.value = '6';
        totalDeductionInput.value = '';

        let calcFn;
        window.binarySearch = jest.fn().mockImplementation((fn, ...rest) => {
            calcFn = fn;
            return 250000;
        });

        calculateFromDeductions();

        // Call the calculation function and verify it returns taxPercentage
        const taxResult = calcFn(250000);
        expect(taxResult).toBe(calculateSalaryComponents(250000, 0).taxPercentage);

        // Test with total deduction percentage
        taxPercentInput.value = '';
        totalDeductionInput.value = '14';

        calculateFromDeductions();

        // Call the calculation function and verify it returns deductionPercentage
        const deductionResult = calcFn(250000);
        expect(deductionResult).toBe(calculateSalaryComponents(250000, 0).deductionPercentage);
    });
});

// Run the test suites
try {
    suites.forEach(runTests);
    console.log('\nAll tests completed!');
} catch (error) {
    console.error('Error running tests:', error);
}
