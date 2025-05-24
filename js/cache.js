// Cache utility functions
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

// Memoized tax calculation
const memoizedCalculateMonthlyTax = memoize(calculateMonthlyTax);

// Memoized tax breakdown calculation
const memoizedCalculateTaxBreakdown = memoize(calculateTaxBreakdown);

// Memoized salary components calculation
const memoizedCalculateSalaryComponents = memoize(calculateSalaryComponents);

// Memoized chart data generation (smaller cache size since chart data is larger)
const memoizedGenerateChartData = memoize(generateChartData, 5);

// Export memoized functions to window object for use in other files
window.memoizedCalculateMonthlyTax = memoizedCalculateMonthlyTax;
window.memoizedCalculateTaxBreakdown = memoizedCalculateTaxBreakdown;
window.memoizedCalculateSalaryComponents = memoizedCalculateSalaryComponents;
window.memoizedGenerateChartData = memoizedGenerateChartData;

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

// Export binary search function to window object for use in other files
window.binarySearch = binarySearch;
