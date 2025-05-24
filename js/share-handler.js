// Share calculator functionality
const shareCalculator = (type) => {
    const url = new URL(window.location.href.split('?')[0]); // Get base URL without parameters
    const params = new URLSearchParams();

    switch (type) {
        case 'basic':
            const basic = document.getElementById('basic').value;
            const allowance = document.getElementById('allowance').value;
            if (basic) params.append('basic', basic);
            if (allowance) params.append('allowance', allowance);
            break;
        case 'net':
            const net = document.getElementById('net').value;
            const reverseAllowance = document.getElementById('reverseAllowance').value;
            if (net) params.append('net', net);
            if (reverseAllowance) params.append('reverseAllowance', reverseAllowance);
            break;
        case 'deduction':
            // Only include the active input
            const taxPercent = document.getElementById('taxPercent');
            const totalDeduction = document.getElementById('totalDeduction');
            if (taxPercent.value) {
                params.append('taxPercent', taxPercent.value);
            } else if (totalDeduction.value) {
                params.append('totalDeduction', totalDeduction.value);
            }
            break;
    }

    // Only create shareable URL if there are parameters
    if (params.toString()) {
        const shareableUrl = `${url.toString()}?${params.toString()}`;
        navigator.clipboard.writeText(shareableUrl).then(() => {
            const button = document.querySelector(`[onclick="shareCalculator('${type}')"]`);
            const icon = button.querySelector('.material-icons');
            const originalText = icon.textContent;

            // Show feedback
            icon.textContent = 'check';
            button.style.background = 'var(--primary-color)';
            button.style.borderColor = 'var(--primary-color)';
            icon.style.color = 'white';

            // Reset after 2 seconds
            setTimeout(() => {
                icon.textContent = originalText;
                button.style.background = '';
                button.style.borderColor = '';
                icon.style.color = '';
            }, 2000);
        });
    }
};

// Parse URL query parameters and fill calculator inputs
const parseQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const inputs = {
        basic: params.get('basic'),
        allowance: params.get('allowance'),
        net: params.get('net'),
        reverseAllowance: params.get('reverseAllowance'),
        taxPercent: params.get('taxPercent'),
        totalDeduction: params.get('totalDeduction'),
    };

    // Fill in calculator inputs and trigger calculations
    Object.entries(inputs).forEach(([id, value]) => {
        if (value !== null) {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;

                // Trigger the appropriate calculator
                if (['basic', 'allowance'].includes(id)) {
                    calculateDeductions();
                } else if (['net', 'reverseAllowance'].includes(id)) {
                    reverseCalculate();
                } else if (['taxPercent', 'totalDeduction'].includes(id)) {
                    calculateFromDeductions();
                }
            }
        }
    });
};