export function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    }).format(value);
}

export function generateScale(domain, range) {
    return d3.scaleLinear()
        .domain(domain)
        .range(range);
}

export function formatExperienceLevel(level) {
    const experienceLevels = {
        'не требуется': 'No Experience Required',
        '1–3 года': '1-3 Years',
        '3–6 лет': '3-6 Years',
        'более 6 лет': 'More than 6 Years',
    };
    return experienceLevels[level] || level;
}