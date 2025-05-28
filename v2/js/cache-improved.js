/**
 * Enhanced caching and utility functions
 */

// Import the tax calculation functions if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    const taxCalculator = require('./tax-calculator.js');
    // Use local variables in Node.js environment only
    const calculateMonthlyTax = taxCalculator.calculateMonthlyTax;
    const calculateTaxBreakdown = taxCalculator.calculateTaxBreakdown;
    const calculateSalaryComponents = taxCalculator.calculateSalaryComponents;
}

/**
 * Enhanced memoization function with LRU cache
 * @param {Function} fn - Function to memoize
 * @param {number} maxCacheSize - Maximum cache size
 * @returns {Function} - Memoized function
 */
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

/**
 * Binary search utility for finding values
 * @param {Function} targetFn - Function that returns a value to compare with targetValue
 * @param {number} targetValue - The value we're trying to match
 * @param {number} low - Lower bound for search
 * @param {number} high - Upper bound for search
 * @param {number} tolerance - Acceptable difference between result and target
 * @param {number} maxIterations - Maximum number of iterations
 * @returns {number|null} - The found value or null if not found
 */
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

// Create memoized versions of tax calculation functions
// In browser, these functions are available from tax-calculator.js
// In Node.js, they're defined in the conditional block above
const memoizedCalculateMonthlyTax = (typeof window !== 'undefined' && window.calculateMonthlyTax) 
    ? memoize(window.calculateMonthlyTax) 
    : (typeof calculateMonthlyTax !== 'undefined' ? memoize(calculateMonthlyTax) : null);

const memoizedCalculateTaxBreakdown = (typeof window !== 'undefined' && window.calculateTaxBreakdown) 
    ? memoize(window.calculateTaxBreakdown) 
    : (typeof calculateTaxBreakdown !== 'undefined' ? memoize(calculateTaxBreakdown) : null);

const memoizedCalculateSalaryComponents = (typeof window !== 'undefined' && window.calculateSalaryComponents) 
    ? memoize(window.calculateSalaryComponents) 
    : (typeof calculateSalaryComponents !== 'undefined' ? memoize(calculateSalaryComponents) : null);

/**
 * Create a memoized function with responsive cache clearing
 * @param {Function} fn - Function to memoize
 * @param {Function} shouldClearCache - Function that returns true if cache should be cleared
 * @param {number} maxCacheSize - Maximum cache size
 * @returns {Function} - Memoized function with responsive cache
 */
const createResponsiveMemoizedFn = (fn, shouldClearCache, maxCacheSize = 5) => {
    const cache = new Map();
    let lastState = null;

    return (...args) => {
        const currentState = shouldClearCache();

        // Clear cache if state changed
        if (lastState !== null && lastState !== currentState) {
            cache.clear();
        }
        lastState = currentState;

        // Create cache key from args and state
        const key = JSON.stringify([...args, {state: currentState}]);

        if (cache.has(key)) {
            return cache.get(key);
        }

        // Generate new result
        const result = fn(...args);

        // Manage cache size
        if (cache.size >= maxCacheSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(key, result);

        return result;
    };
};

// Export to window object in browser environment
if (typeof window !== 'undefined') {
    window.memoize = memoize;
    window.binarySearch = binarySearch;
    window.createResponsiveMemoizedFn = createResponsiveMemoizedFn;
    window.memoizedCalculateMonthlyTax = memoizedCalculateMonthlyTax;
    window.memoizedCalculateTaxBreakdown = memoizedCalculateTaxBreakdown;
    window.memoizedCalculateSalaryComponents = memoizedCalculateSalaryComponents;
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        memoize,
        binarySearch,
        createResponsiveMemoizedFn,
        memoizedCalculateMonthlyTax,
        memoizedCalculateTaxBreakdown,
        memoizedCalculateSalaryComponents,
    };
}
