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

// Enhanced memoize function for responsive data
const memoizeResponsive = (fn, maxCacheSize = 5) => {
    const cache = new Map();
    let lastWidth = window.innerWidth;

    const wrapper = (...args) => {
        const isMobile = window.innerWidth <= 768;

        // Clear cache if viewport crossed mobile breakpoint
        if ((lastWidth <= 768) !== isMobile) {
            cache.clear();
            lastWidth = window.innerWidth;
        }

        // Include viewport state in cache key
        const key = JSON.stringify([...args, {isMobile}]);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args, isMobile);

        if (cache.size >= maxCacheSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(key, result);

        return result;
    };

    return wrapper;
};

// Memoized tax calculations
const memoizedCalculateMonthlyTax = memoize(calculateMonthlyTax);
const memoizedCalculateTaxBreakdown = memoize(calculateTaxBreakdown);
const memoizedCalculateSalaryComponents = memoize(calculateSalaryComponents);

// Memoized chart data generation with responsive handling
const memoizedGenerateChartData = memoizeResponsive(window.generateChartDataBase);

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
