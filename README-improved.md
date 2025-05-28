# Sri Lanka Salary Calculator - Optimized Version

This is an optimized and more maintainable version of the Sri Lanka Salary Calculator application. The application calculates take-home salary after tax and EPF deductions in Sri Lanka, with support for basic, reverse, and tax percentage-based calculations.

## Improvements Made

The codebase has been refactored to be more maintainable, scalable, and optimized. Key improvements include:

### 1. Unified Calculator Module

- Consolidated three separate calculator files into a single `calculator.js` module
- Implemented an object-oriented approach with a `Calculator` class
- Eliminated code duplication across calculator types
- Maintained backward compatibility with existing code

### 2. Enhanced Caching System

- Improved memoization with better LRU (Least Recently Used) cache implementation
- Added responsive cache clearing based on state changes
- Consolidated binary search implementation
- Added comprehensive JSDoc documentation
- Created a more consistent API for both browser and Node.js environments

### 3. Improved Chart Handling

- Simplified chart initialization and update logic
- Added responsive handling for mobile/desktop views
- Better separation of concerns with dedicated functions
- Improved documentation with JSDoc comments

### 4. Streamlined Application Initialization

- Simplified main.js to focus on core initialization tasks
- Better organization of component initialization
- Clearer dependency chain

## File Structure

The optimized version includes the following key files:

- `calculator.js` - Unified calculator module replacing three separate files
- `cache-improved.js` - Enhanced caching and utility functions
- `chart-handler-improved.js` - Improved chart visualization
- `main-improved.js` - Streamlined application initialization
- `index-improved.html` - Updated HTML file referencing the new JavaScript files

## How to Use

To use the optimized version, open `index-improved.html` in your browser. The functionality remains the same as the original version, but with improved performance and maintainability.

## Testing

The application has been tested to ensure that all functionality from the original version is preserved. The test files in the `tests` directory can be used to verify the functionality of the core calculation logic.

## Future Improvements

Potential future improvements could include:

1. Further modularization using ES modules
2. Implementation of a state management system
3. Addition of more visualization options
4. Support for more complex tax scenarios