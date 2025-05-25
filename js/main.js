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

    // Initialize chart
    const ctx = document.getElementById('salaryChart')?.getContext('2d');
    if (ctx) {
        const chartData = window.memoizedGenerateChartData();
        new Chart(ctx, createChartConfig(chartData));
    }
});
