// Tax Calculator Tests
const assert = require('assert');

// Setup Jest-like test environment
console.log('Running tax calculator tests...');

// Simple test runner
const suites = [];
global.describe = (name, fn) => {
    const suite = { name, tests: [] };
    global.it = (name, fn) => {
        suite.tests.push({ name, fn });
    };
    fn();
    suites.push(suite);
};

const runTests = (suite) => {
    console.log(`\n${suite.name}`);
    suite.tests.forEach(test => {
        try {
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

// Core calculation functions
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

// Calculate detailed tax breakdown by bracket
const calculateTaxBreakdown = (annualIncome) => {
    if (annualIncome <= 0) return Array(TAX_BRACKETS.length).fill(0);

    const breakdown = [];
    let previousLimit = 0;

    for (const {upTo, rate} of TAX_BRACKETS) {
        // For the last bracket (upTo is null), use the maximum of annualIncome and previousLimit
        // This ensures we don't get negative taxableInBracket values
        const limit = upTo === null ? Math.max(annualIncome, previousLimit) : upTo;
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

// Test suite for calculateMonthlyTax
describe('calculateMonthlyTax', () => {
    it('should return 0 for negative income', () => {
        assert.strictEqual(calculateMonthlyTax(-1000), 0);
    });

    it('should return 0 for zero income', () => {
        assert.strictEqual(calculateMonthlyTax(0), 0);
    });

    it('should return 0 for income below first tax bracket', () => {
        assert.strictEqual(calculateMonthlyTax(1800000), 0);
    });

    it('should calculate tax correctly for income in second bracket', () => {
        // 2000000 annual income
        // First 1800000 taxed at 0% = 0
        // Next 200000 taxed at 6% = 12000
        // Total annual tax = 12000
        // Monthly tax = 1000
        assert.strictEqual(calculateMonthlyTax(2000000), 1000);
    });

    it('should calculate tax correctly for income in third bracket', () => {
        // 3000000 annual income
        // First 1800000 taxed at 0% = 0
        // Next 1000000 taxed at 6% = 60000
        // Next 200000 taxed at 18% = 36000
        // Total annual tax = 96000
        // Monthly tax = 8000
        assert.strictEqual(calculateMonthlyTax(3000000), 8000);
    });

    it('should calculate tax correctly for income in fourth bracket', () => {
        // 3500000 annual income
        // First 1800000 taxed at 0% = 0
        // Next 1000000 taxed at 6% = 60000
        // Next 500000 taxed at 18% = 90000
        // Next 200000 taxed at 24% = 48000
        // Total annual tax = 198000
        // Monthly tax = 16500
        assert.strictEqual(calculateMonthlyTax(3500000), 16500);
    });

    it('should calculate tax correctly for income in fifth bracket', () => {
        // 4000000 annual income
        // First 1800000 taxed at 0% = 0
        // Next 1000000 taxed at 6% = 60000
        // Next 500000 taxed at 18% = 90000
        // Next 500000 taxed at 24% = 120000
        // Next 200000 taxed at 30% = 60000
        // Total annual tax = 330000
        // Monthly tax = 27500
        assert.strictEqual(calculateMonthlyTax(4000000), 27500);
    });

    it('should calculate tax correctly for income in highest bracket', () => {
        // 5000000 annual income
        // First 1800000 taxed at 0% = 0
        // Next 1000000 taxed at 6% = 60000
        // Next 500000 taxed at 18% = 90000
        // Next 500000 taxed at 24% = 120000
        // Next 500000 taxed at 30% = 150000
        // Next 700000 taxed at 36% = 252000
        // Total annual tax = 672000
        // Monthly tax = 56000
        assert.strictEqual(calculateMonthlyTax(5000000), 56000);
    });
});

// Test suite for calculateTaxBreakdown
describe('calculateTaxBreakdown', () => {
    it('should return all zeros for negative income', () => {
        const breakdown = calculateTaxBreakdown(-1000);
        assert.strictEqual(breakdown.length, TAX_BRACKETS.length);
        assert.deepStrictEqual(breakdown, Array(TAX_BRACKETS.length).fill(0));
    });

    it('should return all zeros for zero income', () => {
        const breakdown = calculateTaxBreakdown(0);
        assert.strictEqual(breakdown.length, TAX_BRACKETS.length);
        assert.deepStrictEqual(breakdown, Array(TAX_BRACKETS.length).fill(0));
    });

    it('should calculate breakdown correctly for income in multiple brackets', () => {
        // 3500000 annual income
        // First 1800000 taxed at 0% = 0
        // Next 1000000 taxed at 6% = 60000 / 12 = 5000 monthly
        // Next 500000 taxed at 18% = 90000 / 12 = 7500 monthly
        // Next 200000 taxed at 24% = 48000 / 12 = 4000 monthly
        // Rest are 0
        const breakdown = calculateTaxBreakdown(3500000);

        // Log the actual breakdown and tax brackets for debugging
        console.log("Actual breakdown:", breakdown);
        console.log("Tax brackets:", TAX_BRACKETS);

        // Let's examine the calculation for each bracket
        TAX_BRACKETS.forEach((bracket, index) => {
            const previousLimit = index > 0 ? TAX_BRACKETS[index - 1].upTo : 0;
            // Use the same logic as the fixed calculateTaxBreakdown function
            const limit = bracket.upTo === null ? Math.max(3500000, previousLimit) : bracket.upTo;
            const taxableInBracket = Math.min(Math.max(3500000 - previousLimit, 0), limit - previousLimit);
            const taxForBracket = taxableInBracket * (bracket.rate / 100) / 12;
            console.log(`Bracket ${index}: rate=${bracket.rate}%, previousLimit=${previousLimit}, limit=${limit}, taxableInBracket=${taxableInBracket}, taxForBracket=${taxForBracket}`);
        });

        // Update the expected values based on the actual calculation
        assert.strictEqual(breakdown.length, TAX_BRACKETS.length);
        assert.strictEqual(breakdown[0], 0);
        assert.strictEqual(breakdown[1], 5000);
        assert.strictEqual(breakdown[2], 7500);
        assert.strictEqual(breakdown[3], 4000);
        assert.strictEqual(breakdown[4], 0); // This is failing, expecting 0 but getting -24000
        assert.strictEqual(breakdown[5], 0);
    });
});

// Test suite for calculateSalaryComponents
describe('calculateSalaryComponents', () => {
    it('should handle negative basic salary', () => {
        const result = calculateSalaryComponents(-1000, 0);
        assert.strictEqual(result.basic, 0);
        assert.strictEqual(result.gross, 0);
        assert.strictEqual(result.tax, 0);
        assert.strictEqual(result.epf, 0);
        assert.strictEqual(result.net, 0);
    });

    it('should handle negative allowance', () => {
        const result = calculateSalaryComponents(1000, -500);
        assert.strictEqual(result.allowance, 0);
        assert.strictEqual(result.gross, 1000);
    });

    it('should calculate components correctly for zero salary', () => {
        const result = calculateSalaryComponents(0, 0);
        assert.strictEqual(result.basic, 0);
        assert.strictEqual(result.allowance, 0);
        assert.strictEqual(result.gross, 0);
        assert.strictEqual(result.tax, 0);
        assert.strictEqual(result.epf, 0);
        assert.strictEqual(result.net, 0);
        assert.strictEqual(result.taxPercentage, 0);
        assert.strictEqual(result.deductionPercentage, 0);
    });

    it('should calculate components correctly for salary below tax threshold', () => {
        // 100000 monthly = 1200000 annual (below 1800000 threshold)
        // EPF = 100000 * 0.08 = 8000
        // Tax = 0
        // Net = 100000 - 0 - 8000 = 92000
        const result = calculateSalaryComponents(100000, 0);
        assert.strictEqual(result.basic, 100000);
        assert.strictEqual(result.gross, 100000);
        assert.strictEqual(result.tax, 0);
        assert.strictEqual(result.epf, 8000);
        assert.strictEqual(result.net, 92000);
        assert.strictEqual(result.taxPercentage, 0);
        assert.strictEqual(result.deductionPercentage, 8);
    });

    it('should calculate components correctly with allowance', () => {
        // Basic = 100000, Allowance = 20000
        // Gross = 120000 monthly = 1440000 annual (below 1800000 threshold)
        // EPF = 100000 * 0.08 = 8000
        // Tax = 0
        // Net = 120000 - 0 - 8000 = 112000
        const result = calculateSalaryComponents(100000, 20000);
        assert.strictEqual(result.basic, 100000);
        assert.strictEqual(result.allowance, 20000);
        assert.strictEqual(result.gross, 120000);
        assert.strictEqual(result.tax, 0);
        assert.strictEqual(result.epf, 8000);
        assert.strictEqual(result.net, 112000);
    });

    it('should calculate components correctly for salary in taxable range', () => {
        // Basic = 200000, Allowance = 50000
        // Gross = 250000 monthly = 3000000 annual
        // EPF = 200000 * 0.08 = 16000
        // Tax = 8000 (calculated in previous test)
        // Net = 250000 - 8000 - 16000 = 226000
        const result = calculateSalaryComponents(200000, 50000);
        assert.strictEqual(result.basic, 200000);
        assert.strictEqual(result.allowance, 50000);
        assert.strictEqual(result.gross, 250000);
        assert.strictEqual(result.tax, 8000);
        assert.strictEqual(result.epf, 16000);
        assert.strictEqual(result.net, 226000);
        assert.strictEqual(result.taxPercentage, (8000 / 250000) * 100);
        assert.strictEqual(result.deductionPercentage, ((8000 + 16000) / 250000) * 100);
    });

    it('should calculate components correctly for high salary', () => {
        // Basic = 500000, Allowance = 0
        // Gross = 500000 monthly = 6000000 annual
        // EPF = 500000 * 0.08 = 40000

        const result = calculateSalaryComponents(500000, 0);

        // First 1800000 taxed at 0% = 0
        // Next 1000000 taxed at 6% = 60000
        // Next 500000 taxed at 18% = 90000
        // Next 500000 taxed at 24% = 120000
        // Next 500000 taxed at 30% = 150000
        // Next 1700000 taxed at 36% = 612000
        // Total annual tax = 1032000
        // Monthly tax = 86000

        // Log the actual tax calculation for debugging
        console.log("Actual tax:", result.tax);

        assert.strictEqual(result.basic, 500000);
        assert.strictEqual(result.gross, 500000);
        assert.strictEqual(result.tax, 86000); // Updated expected value to 86000
        assert.strictEqual(result.epf, 40000);
        assert.strictEqual(result.net, 374000); // Updated expected value to 374000 (500000 - 86000 - 40000)
    });
});

// Run the test suites
try {
    suites.forEach(runTests);
    console.log('\nAll tests completed!');
} catch (error) {
    console.error('Error running tests:', error);
}
