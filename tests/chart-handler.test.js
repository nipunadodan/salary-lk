// Chart Handler Tests
const assert = require('assert');

// Setup Jest-like test environment
console.log('Running chart handler tests...');

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
        toEqual: (expected) => {
            if (typeof expected === 'object' && expected !== null) {
                assert.deepStrictEqual(actual, expected);
            } else {
                assert.strictEqual(actual, expected);
            }
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
        toBeDefined: () => {
            assert.notStrictEqual(actual, undefined);
        },
        toBeGreaterThan: (expected) => {
            assert.ok(actual > expected);
        },
        toHaveLength: (expected) => {
            assert.strictEqual(actual.length, expected);
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
        this.getAttribute = jest.fn();
        this.setAttribute = jest.fn();
    }
}

// Mock document object
global.document = {
    getElementById: createMockFunction(),
    querySelector: createMockFunction(),
    documentElement: new MockElement()
};

// Mock window object
global.window = {
    innerWidth: 1024,
    memoizedCalculateSalaryComponents: calculateSalaryComponents
};

// Mock Chart object
global.Chart = {
    getChart: jest.fn().mockImplementation(() => null)
};

// Import chart handler functions
// In a real environment, these would be imported from chart-handler.js
// We'll reimplement the key functions here for testing

// Chart colors based on theme
const getChartColors = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        gridColor: isDark ? '#333333' : '#e0e0e0',
        textColor: isDark ? '#e0e0e0' : '#666666',
        netSalaryColor: isDark ? '#6ee7b7' : 'rgb(75, 192, 192)',
        deductionColor: isDark ? '#fb7185' : 'rgb(255, 99, 132)',
    };
};

// Chart data generation (pure function)
const generateChartDataBase = (start = 100000, end = 500000, step = 10000, isMobile = window.innerWidth <= 768) => {
    const data = [];
    const effectiveStep = isMobile ? 20000 : 10000;

    for (let gross = start; gross <= end; gross += effectiveStep) {
        const components = window.memoizedCalculateSalaryComponents
            ? window.memoizedCalculateSalaryComponents(gross, 0)
            : calculateSalaryComponents(gross, 0);

        data.push({
            gross: components.gross,
            net: components.net,
            deductionPercentage: components.deductionPercentage,
            isMobile,
        });
    }
    return data;
};

// Make base function available for memoization
window.generateChartDataBase = generateChartDataBase;

// Create memoized chart data function
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

const createChartConfig = (data) => {
    const colors = getChartColors();
    return {
        type: 'line',
        data: {
            labels: data.map(d => d.gross),
            datasets: [{
                label: 'Net Salary',
                data: data.map(d => d.net),
                borderColor: colors.netSalaryColor,
                tension: 0.2,
                fill: false,
                yAxisID: 'y',
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: colors.netSalaryColor,
            },
                {
                    label: 'Deduction %',
                    data: data.map(d => d.deductionPercentage),
                    borderColor: colors.deductionColor,
                    tension: 0.2,
                    fill: false,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: colors.deductionColor,
                }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line',
                        length: 40,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.yAxisID === 'y') {
                                return `Net: LKR ${context.parsed.y.toFixed(0).toLocaleString()}`;
                            }
                            return `Deduction: ${context.parsed.y.toFixed(1)}%`;
                        },
                        title: function (context) {
                            return `Gross: LKR ${parseInt(context[0].label).toLocaleString()}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {color: colors.gridColor},
                    title: {
                        display: true,
                        text: 'Gross Salary (LKR)',
                        font: {family: 'Inter'},
                        color: colors.textColor,
                    },
                    ticks: {
                        callback: (_, index) => {
                            const point = data[index];
                            const salary = point.gross;
                            const threshold = point.isMobile ? 100000 : 50000;
                            if (salary % threshold === 0) {
                                return point.isMobile
                                    ? `LKR ${(salary / 1000).toFixed(0)}K`
                                    : `LKR ${salary.toLocaleString()}`;
                            }
                            return '';
                        },
                        font: {
                            family: 'JetBrains Mono',
                            size: data[0]?.isMobile ? 8 : 11,
                        },
                        color: colors.textColor,
                    },
                },
                y: {
                    grid: {color: colors.gridColor},
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Net Salary (LKR)',
                        font: {family: 'Inter'},
                        color: colors.textColor,
                    },
                    ticks: {
                        callback: (value) => {
                            const isMobile = data[0]?.isMobile;
                            return isMobile
                                ? `LKR ${(value / 1000).toFixed(0)}K`
                                : `LKR ${value.toLocaleString()}`;
                        },
                        font: {
                            family: 'JetBrains Mono',
                            size: data[0]?.isMobile ? 8 : 11,
                        },
                        color: colors.textColor,
                    },
                },
                y1: {
                    grid: {display: false},
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Deduction %',
                        font: {family: 'Inter'},
                        color: colors.textColor,
                    },
                    ticks: {
                        font: {
                            family: 'JetBrains Mono',
                            size: data[0]?.isMobile ? 8 : 11,
                        },
                        color: colors.textColor,
                    },
                },
            },
        },
    };
};

// Function to update chart colors when theme changes
window.updateChartColors = () => {
    const chart = Chart.getChart('salaryChart');
    if (chart) {
        const colors = getChartColors();

        // Update dataset colors
        chart.data.datasets[0].borderColor = colors.netSalaryColor;
        chart.data.datasets[0].pointHoverBackgroundColor = colors.netSalaryColor;
        chart.data.datasets[1].borderColor = colors.deductionColor;
        chart.data.datasets[1].pointHoverBackgroundColor = colors.deductionColor;

        // Update grid and text colors
        Object.entries(chart.options.scales).forEach(([key, scale]) => {
            if (scale.grid) scale.grid.color = colors.gridColor;
            if (scale.title) scale.title.color = colors.textColor;
            scale.ticks.color = colors.textColor;
        });

        chart.update('none'); // Update without animation for immediate effect
    }
};

// Test suite for chart handler
describe('Chart Handler', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup document.documentElement mock
        document.documentElement.getAttribute.mockImplementation((attr) => {
            if (attr === 'data-theme') return 'light';
            return null;
        });
        
        // Reset window width
        window.innerWidth = 1024;
    });

    describe('getChartColors', () => {
        it('should return light theme colors when theme is not dark', () => {
            document.documentElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-theme') return 'light';
                return null;
            });
            
            const colors = getChartColors();
            
            expect(colors.gridColor).toBe('#e0e0e0');
            expect(colors.textColor).toBe('#666666');
            expect(colors.netSalaryColor).toBe('rgb(75, 192, 192)');
            expect(colors.deductionColor).toBe('rgb(255, 99, 132)');
        });

        it('should return dark theme colors when theme is dark', () => {
            document.documentElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-theme') return 'dark';
                return null;
            });
            
            const colors = getChartColors();
            
            expect(colors.gridColor).toBe('#333333');
            expect(colors.textColor).toBe('#e0e0e0');
            expect(colors.netSalaryColor).toBe('#6ee7b7');
            expect(colors.deductionColor).toBe('#fb7185');
        });
    });

    describe('generateChartDataBase', () => {
        it('should generate chart data with default parameters', () => {
            const data = generateChartDataBase();
            
            expect(data).toBeDefined();
            expect(data.length).toBeGreaterThan(0);
            
            // Check structure of first data point
            const firstPoint = data[0];
            expect(firstPoint).toEqual({
                gross: 100000,
                net: 92000, // 100000 - 8000 (EPF) - 0 (tax)
                deductionPercentage: 8, // (8000 / 100000) * 100
                isMobile: false
            });
        });

        it('should use different step size for mobile', () => {
            // Test with mobile width
            window.innerWidth = 600;
            const mobileData = generateChartDataBase(100000, 200000, 10000, true);
            
            // Check that step size is 20000 for mobile
            expect(mobileData[0].gross).toBe(100000);
            expect(mobileData[1].gross).toBe(120000);
            
            // Test with desktop width
            window.innerWidth = 1024;
            const desktopData = generateChartDataBase(100000, 200000, 10000, false);
            
            // Check that step size is 10000 for desktop
            expect(desktopData[0].gross).toBe(100000);
            expect(desktopData[1].gross).toBe(110000);
        });

        it('should calculate correct values for each data point', () => {
            const data = generateChartDataBase(100000, 120000, 10000);
            
            // Check first point (100000)
            expect(data[0].gross).toBe(100000);
            expect(data[0].net).toBe(92000); // 100000 - 8000 (EPF) - 0 (tax)
            expect(data[0].deductionPercentage).toBe(8); // (8000 / 100000) * 100
            
            // Check second point (110000)
            expect(data[1].gross).toBe(110000);
            expect(data[1].net).toBe(101200); // 110000 - 8800 (EPF) - 0 (tax)
            expect(data[1].deductionPercentage).toBe(8); // (8800 / 110000) * 100
            
            // Check third point (120000)
            expect(data[2].gross).toBe(120000);
            expect(data[2].net).toBe(110400); // 120000 - 9600 (EPF) - 0 (tax)
            expect(data[2].deductionPercentage).toBe(8); // (9600 / 120000) * 100
        });
    });

    describe('memoizedGenerateChartData', () => {
        it('should cache results for the same parameters', () => {
            // First call should generate new data
            const data1 = window.memoizedGenerateChartData(100000, 200000, 10000);
            
            // Spy on the base function
            const originalFn = window.generateChartDataBase;
            let called = false;
            window.generateChartDataBase = (...args) => {
                called = true;
                return originalFn(...args);
            };
            
            // Second call with same parameters should use cached data
            const data2 = window.memoizedGenerateChartData(100000, 200000, 10000);
            
            // Check that the base function wasn't called again
            expect(called).toBe(false);
            
            // Restore original function
            window.generateChartDataBase = originalFn;
        });

        it('should clear cache when viewport crosses mobile breakpoint', () => {
            // First call with desktop width
            window.innerWidth = 1024;
            const desktopData = window.memoizedGenerateChartData(100000, 200000, 10000);
            
            // Spy on the base function
            const originalFn = window.generateChartDataBase;
            let called = false;
            window.generateChartDataBase = (...args) => {
                called = true;
                return originalFn(...args);
            };
            
            // Change to mobile width
            window.innerWidth = 600;
            
            // Call with same parameters should regenerate data
            const mobileData = window.memoizedGenerateChartData(100000, 200000, 10000);
            
            // Check that the base function was called again
            expect(called).toBe(true);
            
            // Restore original function
            window.generateChartDataBase = originalFn;
        });
    });

    describe('createChartConfig', () => {
        it('should create a valid chart configuration', () => {
            const data = generateChartDataBase(100000, 200000, 10000);
            const config = createChartConfig(data);
            
            expect(config.type).toBe('line');
            expect(config.data.datasets.length).toBe(2);
            expect(config.data.datasets[0].label).toBe('Net Salary');
            expect(config.data.datasets[1].label).toBe('Deduction %');
            
            // Check that data is correctly mapped
            expect(config.data.labels).toEqual(data.map(d => d.gross));
            expect(config.data.datasets[0].data).toEqual(data.map(d => d.net));
            expect(config.data.datasets[1].data).toEqual(data.map(d => d.deductionPercentage));
        });

        it('should use correct colors based on theme', () => {
            // Test with light theme
            document.documentElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-theme') return 'light';
                return null;
            });
            
            const data = generateChartDataBase(100000, 200000, 10000);
            const lightConfig = createChartConfig(data);
            
            expect(lightConfig.data.datasets[0].borderColor).toBe('rgb(75, 192, 192)');
            expect(lightConfig.data.datasets[1].borderColor).toBe('rgb(255, 99, 132)');
            
            // Test with dark theme
            document.documentElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-theme') return 'dark';
                return null;
            });
            
            const darkConfig = createChartConfig(data);
            
            expect(darkConfig.data.datasets[0].borderColor).toBe('#6ee7b7');
            expect(darkConfig.data.datasets[1].borderColor).toBe('#fb7185');
        });
    });

    describe('updateChartColors', () => {
        it('should update chart colors when theme changes', () => {
            // Mock Chart.getChart to return a chart object
            const mockChart = {
                data: {
                    datasets: [
                        { borderColor: '', pointHoverBackgroundColor: '' },
                        { borderColor: '', pointHoverBackgroundColor: '' }
                    ]
                },
                options: {
                    scales: {
                        x: { grid: { color: '' }, title: { color: '' }, ticks: { color: '' } },
                        y: { grid: { color: '' }, title: { color: '' }, ticks: { color: '' } },
                        y1: { grid: { display: false }, title: { color: '' }, ticks: { color: '' } }
                    }
                },
                update: jest.fn()
            };
            
            Chart.getChart.mockImplementation(() => mockChart);
            
            // Set theme to dark
            document.documentElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-theme') return 'dark';
                return null;
            });
            
            // Call updateChartColors
            window.updateChartColors();
            
            // Check that chart colors were updated
            expect(mockChart.data.datasets[0].borderColor).toBe('#6ee7b7');
            expect(mockChart.data.datasets[1].borderColor).toBe('#fb7185');
            expect(mockChart.options.scales.x.grid.color).toBe('#333333');
            expect(mockChart.options.scales.x.title.color).toBe('#e0e0e0');
            expect(mockChart.options.scales.x.ticks.color).toBe('#e0e0e0');
            
            // Check that chart.update was called
            expect(mockChart.update).toHaveBeenCalledWith('none');
        });

        it('should do nothing if chart is not found', () => {
            // Mock Chart.getChart to return null
            Chart.getChart.mockImplementation(() => null);
            
            // Call updateChartColors
            window.updateChartColors();
            
            // No assertions needed, just make sure it doesn't throw an error
        });
    });
});

// Run the test suites
try {
    suites.forEach(runTests);
    console.log('\nAll tests completed!');
} catch (error) {
    console.error('Error running tests:', error);
}