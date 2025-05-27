# SalaryLK Test Suite Technical Documentation

## Overview

This document provides a technical overview of the test suite for the SalaryLK salary calculator application. The test suite covers the core tax calculation logic, all three calculators in the application (Basic Calculator, Reverse Calculator, and Deduction Calculator), and the chart functionality that visualizes salary data.

## Test Files

The test suite consists of five main test files:

1. **tax-calculator.test.js**: Tests for the core tax calculation functions
2. **calculator-basic.test.js**: Tests for the basic calculator (Calculate Take-Home Salary)
3. **calculator-reverse.test.js**: Tests for the reverse calculator (Find Required Gross Salary)
4. **calculator-deduction.test.js**: Tests for the deduction calculator (Find Salary from Deductions)
5. **chart-handler.test.js**: Tests for the chart functionality

## Testing Methodology

### Custom Test Runner

All test files use a custom test runner that mimics Jest's functionality. The test runner includes:

- A `describe` function for defining test suites
- An `it` function for defining individual test cases
- A `beforeEach` function for setup code
- An `expect` function with matchers like `toBe`, `toHaveBeenCalled`, etc.
- Mock functions with `mockImplementation` method

### Mock Environment

Since the application is designed to run in a browser environment, the tests create a mock environment that includes:

- Mock DOM elements (inputs, result divs, buttons)
- Mock document object with getElementById and querySelector methods
- Mock utility functions (handleInvalidInput, updateCalculationResult)
- Mock window object with memoized functions

### Test Structure

Each test file follows a similar structure:

1. Setup the test environment
2. Import or reimplement the functions being tested
3. Define test suites and test cases
4. Run the tests and report results

## Detailed Test Cases

### 1. Tax Calculator Tests (tax-calculator.test.js)

Tests for the core tax calculation functions:

#### calculateMonthlyTax
- **Negative and zero income**: Should return 0
- **Income below first tax bracket**: Should return 0
- **Income in second bracket**: Should calculate tax correctly
- **Income in third bracket**: Should calculate tax correctly
- **Income in fourth bracket**: Should calculate tax correctly
- **Income in fifth bracket**: Should calculate tax correctly
- **Income in highest bracket**: Should calculate tax correctly

#### calculateTaxBreakdown
- **Negative and zero income**: Should return all zeros
- **Income in multiple brackets**: Should calculate breakdown correctly for each bracket

#### calculateSalaryComponents
- **Negative basic salary**: Should handle gracefully
- **Negative allowance**: Should treat as zero
- **Zero salary**: Should calculate components correctly
- **Salary below tax threshold**: Should calculate components correctly
- **Salary with allowance**: Should calculate components correctly
- **Salary in taxable range**: Should calculate components correctly
- **High salary**: Should calculate components correctly

### 2. Basic Calculator Tests (calculator-basic.test.js)

Tests for the basic calculator functionality:

- **Empty inputs**: Should hide results
- **Invalid inputs (basic salary <= 0)**: Should handle invalid input
- **Valid basic salary without allowance**: Should calculate components correctly
- **Valid basic salary with allowance**: Should calculate components correctly
- **Negative allowance**: Should handle as zero
- **Non-numeric input**: Should handle as zero

### 3. Reverse Calculator Tests (calculator-reverse.test.js)

Tests for the reverse calculator functionality:

- **Empty inputs**: Should hide results
- **Invalid inputs (desired net <= 0)**: Should handle invalid input
- **Non-numeric inputs**: Should handle as invalid
- **Calculating gross salary for desired net without allowance**: Should calculate correctly
- **Calculating gross salary for desired net with allowance**: Should calculate correctly
- **Handling negative allowance**: Should treat as zero
- **Handling binary search failure**: Should handle gracefully

The reverse calculator uses a binary search algorithm to find the gross salary that would result in the desired net salary.

### 4. Deduction Calculator Tests (calculator-deduction.test.js)

Tests for the deduction calculator functionality:

- **Empty inputs**: Should hide results
- **Invalid inputs (percentage <= 0 or >= 100)**: Should handle invalid input
- **Non-numeric inputs**: Should handle as invalid
- **Calculating gross salary for tax percentage**: Should calculate correctly
- **Calculating gross salary for total deduction percentage**: Should calculate correctly
- **Prioritizing tax percentage when both inputs have values**: Should use tax percentage
- **Handling binary search failure**: Should handle gracefully
- **Verifying different calculation functions based on the isTaxOnly flag**: Should use correct calculation function

The deduction calculator also uses a binary search algorithm to find the gross salary that would result in the desired tax percentage or total deduction percentage.

### 5. Chart Handler Tests (chart-handler.test.js)

Tests for the chart functionality:

#### getChartColors
- **Light theme colors**: Should return correct colors for light theme
- **Dark theme colors**: Should return correct colors for dark theme

#### generateChartDataBase
- **Default parameters**: Should generate chart data with default parameters
- **Mobile vs desktop step size**: Should use different step sizes for mobile and desktop
- **Data point calculation**: Should calculate correct values for each data point

#### memoizedGenerateChartData
- **Caching**: Should cache results for the same parameters
- **Cache clearing**: Should clear cache when viewport crosses mobile breakpoint

#### createChartConfig
- **Chart configuration**: Should create a valid chart configuration
- **Theme-based colors**: Should use correct colors based on theme

#### updateChartColors
- **Theme change handling**: Should update chart colors when theme changes
- **No chart handling**: Should do nothing if chart is not found

The chart handler uses memoization to improve performance when generating chart data, and it adapts the chart display based on the viewport size and theme.

## Dependencies

The test suite has the following dependencies:

- **Node.js**: Required to run the tests
- **assert module**: Used for assertions
- **tax-calculator.js**: Contains the core tax calculation functions
- **cache.js**: Contains the binary search utility function
- **chart-handler.js**: Contains the chart generation and configuration functions

## Running the Tests

To run the tests:

1. Make sure you have Node.js installed
2. Navigate to the tests directory
3. Run each test file individually:

```bash
node tax-calculator.test.js
node calculator-basic.test.js
node calculator-reverse.test.js
node calculator-deduction.test.js
node chart-handler.test.js
```

## Implementation Notes

### Binary Search

Both the reverse calculator and deduction calculator use a binary search algorithm to find the gross salary that corresponds to a desired net salary or deduction percentage. The binary search implementation:

1. Starts with a low and high estimate
2. Calculates the midpoint and evaluates the function at that point
3. Adjusts the low or high estimate based on the result
4. Repeats until the result is within the desired tolerance or the maximum number of iterations is reached

### Error Handling

All calculators include error handling for:
- Empty inputs
- Invalid inputs (negative, zero, or too high values)
- Non-numeric inputs
- Binary search failures

### Memoization

The tests use memoized versions of the calculation functions when available to improve performance. The chart handler specifically implements memoization for chart data generation to avoid recalculating data points when the same parameters are used multiple times. It also intelligently clears the cache when the viewport size crosses the mobile breakpoint to ensure optimal display on different devices.
