// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();

    // Parse URL query parameters
    parseQueryParams();

    // Theme toggle button event listener
    const themeToggle = document.querySelector('.theme-toggle-button');
    themeToggle?.addEventListener('click', toggleTheme);

    // Initialize calculators
    initBasicCalculator();
    initReverseCalculator();
    initDeductionCalculator();

    // Initialize chart with memoized data generation if available
    const chartData = window.memoizedGenerateChartData 
        ? window.memoizedGenerateChartData()
        : generateChartData();

    const ctx = document.getElementById('salaryChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, createChartConfig(chartData));
    }
});
