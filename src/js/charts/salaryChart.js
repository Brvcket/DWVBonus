export function createSalaryChart(data) {
    function processData(data) {
        const salariesByExperience = {
            'не требуется': [],
            '1–3 года': [],
            '3–6 лет': [],
            'более 6 лет': []
        };
        
        data.forEach(job => {
            if (!job.salary || !job.experience || job.salary.includes('не указан')) return;
            
            const exp = job.experience.trim();
            if (!salariesByExperience[exp]) return;
            
            let salaryValue;
            
            // Parse salary like "от 120 000 ₽ за месяц на руки"
            if (job.salary.includes('от') && !job.salary.includes('до')) {
                const match = job.salary.match(/от\s+([\d\s]+)/);
                if (match) {
                    salaryValue = parseInt(match[1].replace(/\s/g, ''));
                }
            } 
            // Parse salary like "до 150 000 ₽ за месяц до вычета налогов"
            else if (job.salary.includes('до') && !job.salary.includes('от')) {
                const match = job.salary.match(/до\s+([\d\s]+)/);
                if (match) {
                    salaryValue = parseInt(match[1].replace(/\s/g, ''));
                }
            }
            // Parse salary like "от 180 000 до 250 000 ₽ за месяц до вычета налогов"
            else if (job.salary.includes('от') && job.salary.includes('до')) {
                const matchMin = job.salary.match(/от\s+([\d\s]+)/);
                const matchMax = job.salary.match(/до\s+([\d\s]+)/);
                if (matchMin && matchMax) {
                    const min = parseInt(matchMin[1].replace(/\s/g, ''));
                    const max = parseInt(matchMax[1].replace(/\s/g, ''));
                    salaryValue = (min + max) / 2; // Use average
                }
            }
            // Handle dollar salaries by converting to rubles (approximate exchange rate)
            if (job.salary.includes('$')) {
                salaryValue = salaryValue * 90; // Approximate exchange rate
            }
            
            if (salaryValue && !isNaN(salaryValue)) {
                salariesByExperience[exp].push(salaryValue);
            }
        });
        
        // Calculate statistics for each experience level
        const result = {};
        
        for (const [exp, values] of Object.entries(salariesByExperience)) {
            if (values.length === 0) {
                result[exp] = { min: 0, max: 0, median: 0, count: 0 };
                continue;
            }
            
            values.sort((a, b) => a - b);
            const min = values[0];
            const max = values[values.length - 1];
            const median = values[Math.floor(values.length / 2)];
            
            result[exp] = {
                min,
                max,
                median,
                count: values.length,
                values: values // Include all values for detailed visualization
            };
        }
        
        return result;
    }

    // Process the data
    const salariesData = processData(data);

    // Clear any existing content
    d3.select('#salary-chart-container').html('');

    // Create chart
    const svg = d3.select('#salary-chart-container')
        .append('svg')
        .attr('width', 600)
        .attr('height', 400);

    // Set up dimensions
    const margin = {top: 40, right: 30, bottom: 40, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const chartG = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Map experience levels to better labels
    const experienceLabels = {
        'не требуется': 'No Experience',
        '1–3 года': '1-3 Years',
        '3–6 лет': '3-6 Years',
        'более 6 лет': '6+ Years'
    };

    // Filter out experience levels with no data
    const experienceLevels = Object.keys(salariesData)
        .filter(exp => salariesData[exp].count > 0)
        .map(exp => ({
            key: exp,
            label: experienceLabels[exp],
            data: salariesData[exp]
        }));

    // Create scales
    const xScale = d3.scaleBand()
        .domain(experienceLevels.map(d => d.label))
        .range([0, width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(experienceLevels, d => d.data.max) * 1.1])
        .range([height, 0]);

    // Add axes
    chartG.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chartG.append('g')
        .call(d3.axisLeft(yScale)
            .tickFormat(d => d >= 1000 ? `${d/1000}K ₽` : `${d} ₽`));

    // Add box plots
    experienceLevels.forEach(exp => {
        const g = chartG.append('g')
            .attr('class', 'boxplot')
            .attr('transform', `translate(${xScale(exp.label)}, 0)`);

        // Add box
        g.append('rect')
            .attr('x', xScale.bandwidth() * 0.25)
            .attr('y', yScale(exp.data.median))
            .attr('width', xScale.bandwidth() * 0.5)
            .attr('height', yScale(exp.data.min) - yScale(exp.data.median))
            .attr('fill', '#4e79a7')
            .attr('stroke', 'black');

        // Add median line
        g.append('line')
            .attr('x1', xScale.bandwidth() * 0.25)
            .attr('x2', xScale.bandwidth() * 0.75)
            .attr('y1', yScale(exp.data.median))
            .attr('y2', yScale(exp.data.median))
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Add min/max lines
        g.append('line')
            .attr('x1', xScale.bandwidth() * 0.5)
            .attr('x2', xScale.bandwidth() * 0.5)
            .attr('y1', yScale(exp.data.min))
            .attr('y2', yScale(exp.data.max))
            .attr('stroke', 'black');

        // Add whiskers
        g.append('line')
            .attr('x1', xScale.bandwidth() * 0.25)
            .attr('x2', xScale.bandwidth() * 0.75)
            .attr('y1', yScale(exp.data.min))
            .attr('y2', yScale(exp.data.min))
            .attr('stroke', 'black');

        g.append('line')
            .attr('x1', xScale.bandwidth() * 0.25)
            .attr('x2', xScale.bandwidth() * 0.75)
            .attr('y1', yScale(exp.data.max))
            .attr('y2', yScale(exp.data.max))
            .attr('stroke', 'black');
    });

    // Add title
    svg.append('text')
        .attr('x', width / 2 + margin.left)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Salary Distribution by Experience Level');
}