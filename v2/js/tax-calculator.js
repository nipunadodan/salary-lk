// Tax calculation configuration
const TAX_BRACKETS = [
    {upTo: 1800000, rate: 0},    // 0% up to 1.8M
    {upTo: 2800000, rate: 6},    // 6% up to 2.8M
    {upTo: 3300000, rate: 18},   // 18% up to 3.3M
    {upTo: 3800000, rate: 24},   // 24% up to 3.8M
    {upTo: 4300000, rate: 30},   // 30% up to 4.3M
    {upTo: null, rate: 36},      // 36% above 4.3M
];

// Export tax brackets for use in other files
if (typeof window !== 'undefined') {
    window.TAX_BRACKETS = TAX_BRACKETS;
}

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

    // Use memoized versions if available
    const tax = (typeof window !== 'undefined' && window.memoizedCalculateMonthlyTax) 
        ? window.memoizedCalculateMonthlyTax(annualGross)
        : calculateMonthlyTax(annualGross);

    const taxBreakdown = (typeof window !== 'undefined' && window.memoizedCalculateTaxBreakdown)
        ? window.memoizedCalculateTaxBreakdown(annualGross)
        : calculateTaxBreakdown(annualGross);
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

// Export functions to window object for browser environment
if (typeof window !== 'undefined') {
    window.calculateMonthlyTax = calculateMonthlyTax;
    window.calculateTaxBreakdown = calculateTaxBreakdown;
    window.calculateSalaryComponents = calculateSalaryComponents;
}

// Make it work in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        TAX_BRACKETS,
        EPF_RATE,
        calculateMonthlyTax, 
        calculateTaxBreakdown, 
        calculateSalaryComponents 
    };
}
