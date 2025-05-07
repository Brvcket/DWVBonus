export function createExperienceChart(data) {
    function processData(data) {
        const experienceLevels = [...new Set(data.map(d => d.experience))];
        const skillCounts = {};

        experienceLevels.forEach(level => {
            skillCounts[level] = {};
            data.filter(d => d.experience === level).forEach(d => {
                if (!d.skills) return;
                d.skills.split(',').forEach(skill => {
                    const trimmedSkill = skill.trim();
                    if (trimmedSkill) {
                        skillCounts[level][trimmedSkill] = (skillCounts[level][trimmedSkill] || 0) + 1;
                    }
                });
            });
        });

        const topSkills = {};
        experienceLevels.forEach(level => {
            topSkills[level] = Object.entries(skillCounts[level])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
        });

        return {
            experienceLevels,
            topSkills
        };
    }

    // Process the data
    const processed = processData(data);
    const { experienceLevels, topSkills } = processed;

    // Clear any existing content
    d3.select('#experience-chart-container').html('');

    // Create SVG
    const svg = d3.select('#experience-chart-container')
        .append('svg')
        .attr('width', 600)
        .attr('height', 400);

    const xScale = d3.scaleBand()
        .domain(experienceLevels)
        .range([0, 600])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(topSkills).flat().map(d => d[1]))])
        .range([400, 0]);

    svg.selectAll('.bar')
        .data(experienceLevels)
        .enter()
        .append('g')
        .attr('class', 'bar')
        .attr('transform', d => `translate(${xScale(d)}, 0)`)
        .selectAll('rect')
        .data(d => topSkills[d])
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * (xScale.bandwidth() / 3))
        .attr('y', d => yScale(d[1]))
        .attr('width', xScale.bandwidth() / 3 - 5)
        .attr('height', d => 400 - yScale(d[1]))
        .attr('fill', (d, i) => ['#4e79a7', '#f28e2c', '#e15759'][i]);

    svg.append('g')
        .attr('transform', 'translate(0, 400)')
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .call(d3.axisLeft(yScale));
}