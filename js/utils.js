// Utility functions
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const toggleTaxBreakdown = (element) => {
    const icon = element.querySelector('.material-icons');
    const breakdown = element.closest('.result-line').nextElementSibling;
    if (breakdown.style.display === 'none' || !breakdown.style.display) {
        breakdown.style.display = 'block';
        icon.textContent = 'expand_less';
    } else {
        breakdown.style.display = 'none';
        icon.textContent = 'expand_more';
    }
};

const updateTaxBreakdown = (annualGross, resultDiv) => {
    // Use the tax breakdown from calculateSalaryComponents (memoized if available)
    const components = window.memoizedCalculateSalaryComponents
        ? window.memoizedCalculateSalaryComponents(annualGross / 12, 0)
        : calculateSalaryComponents(annualGross / 12, 0);
    const taxBreakdown = components.taxBreakdown;

    // Update each tax bracket field
    TAX_BRACKETS.forEach((bracket, index) => {
        const taxForBracket = taxBreakdown[index];
        const field = resultDiv.querySelector(`[data-field="tax${bracket.rate}"]`);
        if (field) {
            field.textContent = taxForBracket > 0
                ? `LKR ${formatNumber(taxForBracket.toFixed(2))}`
                : '-';
        }
    });
};

// UI handling helper functions
const handleInvalidInput = (resultDiv) => {
    resultDiv.style.display = 'block';
    resultDiv.querySelectorAll('[data-field]').forEach(element => {
        element.textContent = '-';
    });
};

// UI update function
const updateCalculationResult = (components, resultDiv) => {
    const {basic, allowance, gross, tax, epf, net, taxPercentage, deductionPercentage} = components;

    // Show the results container
    resultDiv.style.display = 'block';

    // Helper function to update field values
    const updateField = (field, value, prefix = 'LKR ', decimals = 2) => {
        const element = resultDiv.querySelector(`[data-field="${field}"]`);
        if (element) {
            if (typeof value === 'number') {
                if (field === 'taxPercent') {
                    element.textContent = value.toFixed(1);
                } else if (field === 'deductions') {
                    element.textContent = value.toFixed(1) + '%';
                } else if (field.startsWith('annual')) {
                    element.textContent = prefix + formatNumber(Math.round(value));
                } else {
                    element.textContent = prefix + formatNumber(parseFloat(value.toFixed(decimals)));
                }
            } else {
                element.textContent = value;
            }
        }
    };

    // Update all fields
    updateField('basic', basic);
    updateField('allowance', allowance);
    updateField('gross', gross);
    updateField('net', net);
    updateField('tax', tax);
    updateField('epf', epf);
    updateField('taxPercent', taxPercentage);
    updateField('deductions', deductionPercentage);

    // Update annual values
    updateField('annualGross', gross * 12);
    updateField('annualNet', net * 12);

    // Update tax breakdown
    updateTaxBreakdown(gross * 12, resultDiv);
};
