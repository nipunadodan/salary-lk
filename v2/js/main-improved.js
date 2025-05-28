/**
 * Main application entry point
 * This file initializes all components of the salary calculator application
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();

  // Parse URL query parameters
  parseQueryParams();

  // Theme toggle button event listener
  const themeToggle = document.querySelector('.theme-toggle-button');
  themeToggle?.addEventListener('click', toggleTheme);

  // Initialize tab switching
  initTabSwitching();

  // Initialize calculator
  initCalculators();

  // Initialize chart
  initChart();
});

/**
 * Initialize tab switching functionality
 */
const initTabSwitching = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
};
