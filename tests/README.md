# Salary Calculator Tests

This directory contains test files for the SalaryLK salary calculator application. The tests cover the core tax calculation logic and all three calculators in the application.

## Test Files

- **tax-calculator.test.js**: Tests for the core tax calculation functions
- **calculator-basic.test.js**: Tests for the basic calculator (Calculate Take-Home Salary)
- **calculator-reverse.test.js**: Tests for the reverse calculator (Find Required Gross Salary)
- **calculator-deduction.test.js**: Tests for the deduction calculator (Find Salary from Deductions)

## Running the Tests

These tests are designed to be run in a Node.js environment. To run the tests:

1. Make sure you have Node.js installed
2. Navigate to the tests directory
3. Run each test file individually:

```bash
node tax-calculator.test.js
node calculator-basic.test.js
node calculator-reverse.test.js
node calculator-deduction.test.js
```

## Test Coverage

### Tax Calculator Tests

Tests for the core tax calculation functions:

- `calculateMonthlyTax`: Calculates monthly tax based on annual income
- `calculateTaxBreakdown`: Provides a detailed breakdown of tax by bracket
- `calculateSalaryComponents`: Calculates all salary components (gross, tax, EPF, net, etc.)

Tests cover:
- Negative and zero income
- Income in each tax bracket
- Different combinations of basic salary and allowance

### Basic Calculator Tests

Tests for the basic calculator functionality:

- Empty inputs
- Invalid inputs (basic salary <= 0)
- Valid basic salary without allowance
- Valid basic salary with allowance
- Negative allowance
- Non-numeric input

### Reverse Calculator Tests

Tests for the reverse calculator functionality:

- Empty inputs
- Invalid inputs (desired net <= 0)
- Non-numeric inputs
- Calculating gross salary for desired net without allowance
- Calculating gross salary for desired net with allowance
- Handling negative allowance
- Handling binary search failure

### Deduction Calculator Tests

Tests for the deduction calculator functionality:

- Empty inputs
- Invalid inputs (percentage <= 0 or >= 100)
- Non-numeric inputs
- Calculating gross salary for tax percentage
- Calculating gross salary for total deduction percentage
- Prioritizing tax percentage when both inputs have values
- Handling binary search failure
- Verifying different calculation functions based on the isTaxOnly flag

## Test Implementation Notes

The tests use a simple custom test runner that mimics Jest's functionality. Each test file:

1. Reimplements the core tax calculation functions for testing
2. Mocks DOM elements and utility functions to simulate the browser environment
3. Implements the calculator functionality from the corresponding JavaScript file
4. Defines test suites and test cases
5. Runs the tests and reports results