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

// Memoized tax calculations
const memoizedCalculateMonthlyTax = memoize(calculateMonthlyTax);
const memoizedCalculateTaxBreakdown = memoize(calculateTaxBreakdown);
const memoizedCalculateSalaryComponents = memoize(calculateSalaryComponents);

// Export tax calculation memoized functions
window.memoizedCalculateMonthlyTax = memoizedCalculateMonthlyTax;
window.memoizedCalculateTaxBreakdown = memoizedCalculateTaxBreakdown;
window.memoizedCalculateSalaryComponents = memoizedCalculateSalaryComponents;

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

window.binarySearch = binarySearch;

// Create memoized chart data function when chart-handler.js is loaded
window.memoizedGenerateChartData = (() => {
    const cache = new Map();
    let lastWidth = window.innerWidth;

    return (...args) => {
        if (!window.generateChartDataBase) return [];

        const isMobile = window.innerWidth <= 768;

        // Clear cache if viewport crossed mobile breakpoint
        if ((lastWidth <= 768) !== isMobile) {
            cache.clear();
            lastWidth = window.innerWidth;
        }

        // Create cache key from args and viewport state
        const key = JSON.stringify([...args, {isMobile}]);

        if (cache.has(key)) {
            return cache.get(key);
        }

        // Generate new data
        const result = window.generateChartDataBase(...args, isMobile);

        // Manage cache size (keep only 5 entries)
        if (cache.size >= 5) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(key, result);

        return result;
    };
})();

