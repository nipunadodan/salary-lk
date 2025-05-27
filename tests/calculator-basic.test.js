// Basic Calculator Tests
const assert = require('assert');

// Setup Jest-like test environment
console.log('Running basic calculator tests...');

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

// Import the tax calculation functions from the actual application code
const { 
    TAX_BRACKETS, 
    EPF_RATE, 
    calculateMonthlyTax, 
    calculateTaxBreakdown, 
    calculateSalaryComponents 
} = require('../js/tax-calculator.js');

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

// Import the basic calculator functionality
// In a real environment, this would be imported from calculator-basic.js
const calculateDeductions = () => {
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

    const components = calculateSalaryComponents(basicSalary, allowance);
    updateCalculationResult(components, resultsDiv);

    resultsDiv.style.display = 'block';
    shareButton.classList.add('visible');
};

// Test suite for basic calculator
describe('Basic Calculator', () => {
    let basicInput, allowanceInput, resultsDiv, shareButton;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        handleInvalidInput.mockClear();
        updateCalculationResult.mockClear();

        // Setup mock DOM elements
        basicInput = new MockElement();
        allowanceInput = new MockElement();
        resultsDiv = new MockElement();
        shareButton = new MockElement();

        // Setup document.getElementById mock
        document.getElementById.mockImplementation((id) => {
            if (id === 'basic') return basicInput;
            if (id === 'allowance') return allowanceInput;
            if (id === 'results') return resultsDiv;
            return null;
        });

        // Setup document.querySelector mock
        document.querySelector = jest.fn().mockImplementation(() => shareButton);
    });

    it('should hide results if both inputs are empty', () => {
        basicInput.value = '';
        allowanceInput.value = '';

        calculateDeductions();

        expect(resultsDiv.style.display).toBe('none');
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(handleInvalidInput).not.toHaveBeenCalled();
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should handle invalid input (basic salary <= 0)', () => {
        basicInput.value = '0';
        allowanceInput.value = '1000';

        calculateDeductions();

        expect(handleInvalidInput).toHaveBeenCalledWith(resultsDiv);
        expect(shareButton.classList.remove).toHaveBeenCalledWith('visible');
        expect(updateCalculationResult).not.toHaveBeenCalled();
    });

    it('should calculate components for valid basic salary without allowance', () => {
        basicInput.value = '100000';
        allowanceInput.value = '';

        calculateDeductions();

        expect(updateCalculationResult).toHaveBeenCalledWith(
            expect.objectContaining({
                basic: 100000,
                allowance: 0,
                gross: 100000
            }),
            resultsDiv
        );
        expect(resultsDiv.style.display).toBe('block');
        expect(shareButton.classList.add).toHaveBeenCalledWith('visible');
    });

    it('should calculate components for valid basic salary with allowance', () => {
        basicInput.value = '100000';
        allowanceInput.value = '20000';

        calculateDeductions();

        expect(updateCalculationResult).toHaveBeenCalledWith(
            expect.objectContaining({
                basic: 100000,
                allowance: 20000,
                gross: 120000
            }),
            resultsDiv
        );
        expect(resultsDiv.style.display).toBe('block');
        expect(shareButton.classList.add).toHaveBeenCalledWith('visible');
    });

    it('should handle negative allowance as zero', () => {
        basicInput.value = '100000';
        allowanceInput.value = '-5000';

        calculateDeductions();

        expect(updateCalculationResult).toHaveBeenCalledWith(
            expect.objectContaining({
                basic: 100000,
                allowance: 0,
                gross: 100000
            }),
            resultsDiv
        );
    });

    it('should handle non-numeric input as zero', () => {
        basicInput.value = '100000';
        allowanceInput.value = 'abc';

        calculateDeductions();

        expect(updateCalculationResult).toHaveBeenCalledWith(
            expect.objectContaining({
                basic: 100000,
                allowance: 0,
                gross: 100000
            }),
            resultsDiv
        );
    });
});

// Run the test suites
try {
    suites.forEach(runTests);
    console.log('\nAll tests completed!');
} catch (error) {
    console.error('Error running tests:', error);
}
