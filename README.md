# SalaryLKR - Salary Calculator Application - Technical Documentation

## Overview

The SalaryLKR - Salary Calculator is a web application designed to help users calculate and visualize salary
information, including
tax deductions, EPF contributions, and take-home pay. The application provides three main calculation modes:
deductions, EPF contributions, and take-home pay. The application provides three main calculation modes:

1. **Calculate Take-Home Salary**: Calculates net salary from gross salary input
2. **Find Required Gross Salary**: Reverse calculation to find the gross salary needed for a desired take-home amount
3. **Find Salary from Deductions**: Determines salary based on tax percentage or total deduction percentage

The application features a responsive design with light/dark theme support, interactive charts, and result sharing
capabilities.

## Architecture

The application follows a modular JavaScript architecture with the following key components:

- **HTML Structure**: Defines the UI layout and calculator forms
- **CSS Styling**: Provides responsive design with theme support
- **JavaScript Modules**: Separate files for specific functionality
- **Chart.js Integration**: For data visualization

### Design Patterns

- **Module Pattern**: Separates functionality into distinct files
- **Memoization**: Caches expensive calculations for performance optimization
- **Event-Driven Architecture**: Uses event listeners for user interactions
- **Responsive Design**: Adapts to different screen sizes

## Components

### 1. Tax Calculator

The core calculation engine that handles:

- Tax bracket calculations based on Sri Lankan tax rates
- EPF (Employee Provident Fund) deductions
- Detailed tax breakdown by bracket

**Key Files**: `tax-calculator.js`

### 2. Calculator Modules

Three separate calculator implementations:

- Basic Calculator: Calculates take-home salary from gross salary
- Reverse Calculator: Finds required gross salary for a desired take-home amount
- Deduction Calculator: Calculates salary based on tax or deduction percentage

**Key Files**: `calculator-basic.js`, `calculator-reverse.js`, `calculator-deduction.js`

### 3. Chart Visualization

Displays the relationship between:

- Gross salary (x-axis)
- Net salary (left y-axis)
- Deduction percentage (right y-axis)

**Key Files**: `chart-handler.js`

### 4. Caching System

Implements memoization to optimize performance:

- Caches expensive tax calculations
- Uses LRU (Least Recently Used) cache strategy
- Configurable cache sizes for different functions

**Key Files**: `cache.js`

### 5. Theme Handler

Manages application theming:

- Light/dark mode toggle
- Persists theme preference in localStorage
- Respects user's system preference

**Key Files**: `theme-handler.js`

### 6. Share Handler

Enables sharing calculator configurations:

- Generates shareable URLs with calculator state
- Parses URL parameters to restore calculator state
- Provides visual feedback on share action

**Key Files**: `share-handler.js`

### 7. Utility Functions

Common helper functions:

- Number formatting
- Debouncing
- UI updates
- Tax breakdown toggle

**Key Files**: `utils.js`

## Technical Implementation

### Tax Calculation

The application uses a progressive tax bracket system based on Sri Lankan tax rates:

```javascript
const TAX_BRACKETS = [
    {upTo: 1800000, rate: 0},    // 0% up to 1.8M
    {upTo: 2800000, rate: 6},    // 6% up to 2.8M
    {upTo: 3300000, rate: 18},   // 18% up to 3.3M
    {upTo: 3800000, rate: 24},   // 24% up to 3.8M
    {upTo: 4300000, rate: 30},   // 30% up to 4.3M
    {upTo: null, rate: 36},      // 36% above 4.3M
];
```

Tax is calculated by iterating through these brackets and applying the appropriate rate to each portion of income.

### Memoization

Performance optimization through caching:

```javascript
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
```

### Binary Search Algorithm

Used in reverse calculations to efficiently find the gross salary that results in a specific net salary:

```javascript
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
```

### Chart Implementation

Uses Chart.js to create a dual-axis chart showing the relationship between gross salary, net salary, and deduction
percentage:

```javascript
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
                // ...other properties
                yAxisID: 'y',
            },
                {
                    label: 'Deduction %',
                    data: data.map(d => d.deductionPercentage),
                    borderColor: colors.deductionColor,
                    // ...other properties
                    yAxisID: 'y1',
                }],
        },
        // ...configuration options
    };
};
```

### Responsive Design

The application adapts to different screen sizes using CSS media queries:

```css
@media (max-width: 768px) {
    .calculators-container {
        flex-direction: column;
    }

    .result-line {
        font-size: 0.8125rem;
    }

    .prominent-result {
        font-size: 1.125rem;
    }
}
```

## File Structure

```
sal/
├── css/
│   └── styles.css           # Main stylesheet
├── js/
│   ├── cache.js             # Memoization implementation
│   ├── calculator-basic.js  # Basic salary calculator
│   ├── calculator-deduction.js # Deduction-based calculator
│   ├── calculator-reverse.js # Reverse salary calculator
│   ├── chart-handler.js     # Chart visualization
│   ├── main.js              # Application initialization
│   ├── share-handler.js     # URL sharing functionality
│   ├── tax-calculator.js    # Tax calculation logic
│   ├── theme-handler.js     # Theme switching
│   └── utils.js             # Utility functions
└── index.html               # Main HTML structure
```

## Dependencies

- **Chart.js**: For data visualization (`https://cdn.jsdelivr.net/npm/chart.js`)
- **Google Fonts**:
    - Inter (400, 500, 700)
    - JetBrains Mono (400, 500, 700)
    - Material Icons

## Usage

### Basic Salary Calculation

1. Enter the basic salary amount
2. Optionally enter an allowance amount
3. View the breakdown of:
    - Tax deductions by bracket
    - EPF contribution (8%)
    - Take-home salary
    - Annual income figures

### Reverse Calculation

1. Enter the desired take-home salary
2. Optionally enter an allowance amount
3. View the required gross salary and breakdown

### Deduction-Based Calculation

1. Enter either a tax percentage or total deduction percentage
2. View the corresponding gross salary and breakdown

### Sharing Results

1. Configure any calculator with desired values
2. Click the share button
3. A URL with the current calculator state is copied to the clipboard
4. Share the URL to allow others to see the same calculation

### Theme Switching

Click the theme toggle button in the top-right corner to switch between light and dark modes.

## Performance Considerations

- **Memoization**: Expensive calculations are cached to improve performance
- **Debouncing**: Input handlers are debounced to prevent excessive calculations
- **Responsive Design**: Chart data points are reduced on mobile devices
- **LRU Cache**: Prevents memory leaks by limiting cache size

## Browser Compatibility

The application uses modern JavaScript features and is compatible with:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Mobile browsers are also supported with a responsive design that adapts to smaller screens.
