document.addEventListener('DOMContentLoaded', function () {
    const indicatorCards = document.querySelectorAll('.fx-indicator');

    indicatorCards.forEach(function (card) {
        const country = card.dataset.country;
        const indicator = card.dataset.indicator;

        if (country && indicator) {
            loadIndicatorData(card, country, indicator);
        }
    });
});

function loadIndicatorData(card, country, indicator) {
    const loadingEl = card.querySelector('.fx-indicator-loading');
    const valueEl = card.querySelector('.fx-indicator-value');
    const errorEl = card.querySelector('.fx-indicator-error');

    // Show loading state
    loadingEl.style.display = 'block';
    valueEl.style.display = 'none';
    errorEl.style.display = 'none';

    // Make API request
    fetch(`${fxIndicator.restUrl}indicators?country=${country}&code=${indicator}`, {
        headers: {
            'X-WP-Nonce': fxIndicator.nonce
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const indicatorData = data[0];
                displayIndicatorValue(card, indicatorData);
            } else {
                throw new Error('No data available');
            }
        })
        .catch(error => {
            console.error('Error loading indicator data:', error);
            showError(card);
        });
}

function displayIndicatorValue(card, data) {
    const loadingEl = card.querySelector('.fx-indicator-loading');
    const valueEl = card.querySelector('.fx-indicator-value');
    const valueSpan = valueEl.querySelector('.value');
    const unitSpan = valueEl.querySelector('.unit');

    // Format the value
    const formattedValue = formatValue(data.value, data.unit);

    // Update display
    valueSpan.textContent = formattedValue;

    // Hide loading, show value
    loadingEl.style.display = 'none';
    valueEl.style.display = 'block';

    // Add fade-in animation
    valueEl.classList.add('fx-fade-in');
}

function showError(card) {
    const loadingEl = card.querySelector('.fx-indicator-loading');
    const errorEl = card.querySelector('.fx-indicator-error');

    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
}

function formatValue(value, unit) {
    if (!value || value === null) return 'N/A';

    const numValue = parseFloat(value);

    if (isNaN(numValue)) return 'N/A';

    switch (unit) {
        case 'USD':
            if (numValue >= 1000000000000) {
                return `$${(numValue / 1000000000000).toFixed(2)}T`;
            } else if (numValue >= 1000000000) {
                return `$${(numValue / 1000000000).toFixed(2)}B`;
            } else if (numValue >= 1000000) {
                return `$${(numValue / 1000000).toFixed(2)}M`;
            } else {
                return `$${numValue.toLocaleString()}`;
            }

        case 'people':
            if (numValue >= 1000000000) {
                return `${(numValue / 1000000000).toFixed(2)}B people`;
            } else if (numValue >= 1000000) {
                return `${(numValue / 1000000).toFixed(2)}M people`;
            } else {
                return `${numValue.toLocaleString()} people`;
            }

        case '%':
            return `${numValue.toFixed(2)}%`;

        default:
            return `${numValue.toLocaleString()} ${unit}`;
    }
}