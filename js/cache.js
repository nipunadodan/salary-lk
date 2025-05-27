// Cache utility functions
// Import the tax calculation functions if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    const taxCalculator = require('./tax-calculator.js');
    var calculateMonthlyTax = taxCalculator.calculateMonthlyTax;
    var calculateTaxBreakdown = taxCalculator.calculateTaxBreakdown;
    var calculateSalaryComponents = taxCalculator.calculateSalaryComponents;
}

const memoize = (fn, maxCacheSize = 100) => {
    const cache = new Map();
    const keys = [];

    return (...args) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            // Move this key to the end of the keys array (most recently used)
            const keyIndex = keys.indexOf(key);
            if (keyIndex > -1) {
                keys.splice(keyIndex, 1);
            }
            keys.push(key);

            return cache.get(key);
        }

        const result = fn(...args);

        // If cache is full, remove the least recently used item
        if (keys.length >= maxCacheSize) {
            const oldestKey = keys.shift();
            cache.delete(oldestKey);
        }

        // Add new result to cache
        cache.set(key, result);
        keys.push(key);

        return result;
    };
};

// Memoized tax calculations
const memoizedCalculateMonthlyTax = calculateMonthlyTax ? memoize(calculateMonthlyTax) : null;
const memoizedCalculateTaxBreakdown = calculateTaxBreakdown ? memoize(calculateTaxBreakdown) : null;
const memoizedCalculateSalaryComponents = calculateSalaryComponents ? memoize(calculateSalaryComponents) : null;

// Export tax calculation memoized functions
if (typeof window !== 'undefined') {
    window.memoizedCalculateMonthlyTax = memoizedCalculateMonthlyTax;
    window.memoizedCalculateTaxBreakdown = memoizedCalculateTaxBreakdown;
    window.memoizedCalculateSalaryComponents = memoizedCalculateSalaryComponents;
}

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

if (typeof window !== 'undefined') {
    window.binarySearch = binarySearch;
}


// Make it work in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        memoize,
        binarySearch,
        memoizedCalculateMonthlyTax,
        memoizedCalculateTaxBreakdown,
        memoizedCalculateSalaryComponents
    };
}
