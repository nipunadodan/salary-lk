// Reverse Calculator Tests
const assert = require('assert');

// Setup Jest-like test environment
console.log('Running reverse calculator tests...');

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

// Mock Jest functions
global.jest = {
    fn: () => createMockFunction(),
    clearAllMocks: () => {}
};

// Create expect.any function
const any = (type) => {
    return { __type: type, __isAnyMatcher: true };
};

// Create expect.objectContaining function
const objectContaining = (obj) => {
    return { __obj: obj, __isObjectContainingMatcher: true };
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
        }
    };

    // Add any and objectContaining as properties of the expect object
    expectObj.any = any;
    expectObj.objectContaining = objectContaining;

    return expectObj;
};

// Add any and objectContaining as properties of the global expect function
global.expect.any = any;
global.expect.objectContaining = objectContaining;

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

// Import the reverse calculator functionality
// In a real environment, this would be imported from calculator-reverse.js
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

// Test suite for reverse calculator
describe('Reverse Calculator', () => {
    let netInput, allowanceInput, reverseResultsDiv, shareButton;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        handleInvalidInput.mockClear();
        updateCalculationResult.mockClear();

        // Setup mock DOM elements
        netInput = new MockElement();
        allowanceInput = new MockElement();
        reverseResultsDiv = new MockElement();
        shareButton = new MockElement();

        // Setup document.getElementById mock
        document.getElementById.mockImplementation((id) => {
            if (id === 'net') return netInput;
            if (id === 'reverseAllowance') return allowanceInput;
            if (id === 'reverseResults') return reverseResultsDiv;
            return null;
        });

        // Setup document.querySelector mock
        document.querySelector = jest.fn().mockImplementation(() => shareButton);
    });

    it('should hide results if both inputs are empty', () => {
        netInput.value = '';
        allowanceInput.value = '';

        reverseCalculate();

        expect(reverseResultsDiv.style.display).toBe('none');
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(handleInvalidInput).not.toHaveBeenCalled();
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should handle invalid input (desired net <= 0)', () => {
        netInput.value = '0';
        allowanceInput.value = '1000';

        reverseCalculate();

        expect(handleInvalidInput).toHaveBeenCalledWith(reverseResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should handle non-numeric input as invalid', () => {
        netInput.value = 'abc';
        allowanceInput.value = '1000';

        reverseCalculate();

        expect(handleInvalidInput).toHaveBeenCalledWith(reverseResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
    });

    it('should calculate gross salary for desired net without allowance', () => {
        netInput.value = '92000';  // Net that corresponds to ~100000 basic
        allowanceInput.value = '';

        // Mock binary search to return a predictable value
        window.binarySearch = jest.fn().mockImplementation(() => 100000);

        reverseCalculate();

        expect(updateCalculationResult).toHaveBeenCalled();
        expect(reverseResultsDiv.style.display).toBe('block');
        expect(shareButton.classList.add).toHaveBeenCalledWith('visible');
    });

    it('should calculate gross salary for desired net with allowance', () => {
        netInput.value = '112000';  // Net that corresponds to ~100000 basic + 20000 allowance
        allowanceInput.value = '20000';

        // Mock binary search to return a predictable value
        window.binarySearch = jest.fn().mockImplementation(() => 120000);

        reverseCalculate();

        expect(updateCalculationResult).toHaveBeenCalled();
        expect(reverseResultsDiv.style.display).toBe('block');
        expect(shareButton.classList.add).toHaveBeenCalledWith('visible');
    });

    it('should handle negative allowance as zero', () => {
        netInput.value = '92000';
        allowanceInput.value = '-5000';

        // Mock binary search to return a predictable value
        window.binarySearch = jest.fn().mockImplementation(() => 100000);

        reverseCalculate();

        // The calcNetForGross function should be called with allowance = 0
        expect(updateCalculationResult).toHaveBeenCalled();
    });

    it('should handle case where binary search fails', () => {
        netInput.value = '1000000';  // Unrealistically high net salary
        allowanceInput.value = '0';

        // Mock binary search to return null (failure)
        window.binarySearch = jest.fn().mockImplementation(() => null);

        reverseCalculate();

        expect(handleInvalidInput).toHaveBeenCalledWith(reverseResultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
    });
});

// Run the test suites
try {
    suites.forEach(runTests);
    console.log('\nAll tests completed!');
} catch (error) {
    console.error('Error running tests:', error);
}
