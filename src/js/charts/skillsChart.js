export function createSkillsChart(data) {
    function processData(data) {
        const skillsCount = {};
        
        data.forEach(job => {
            if (!job.skills) return;
            
            const skills = job.skills.split(',').map(skill => skill.trim());
            skills.forEach(skill => {
                if (skill) {
                    skillsCount[skill] = (skillsCount[skill] || 0) + 1;
                }
            });
        });
        
        // Convert to array and sort by count
        return Object.entries(skillsCount)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Get top 10
    }

    // Process the data
    const topSkills = processData(data);
    
    // Clear any existing content
    d3.select('#skills-chart-container').html('');
    
    // Create SVG
    const svg = d3.select('#skills-chart-container')
        .append('svg')
        .attr('width', 800)
        .attr('height', 500);
    
    // Set margins
    const margin = {top: 40, right: 20, bottom: 100, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleBand()
        .domain(topSkills.map(d => d.skill))
        .range([0, width])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(topSkills, d => d.count) * 1.1])
        .range([height, 0]);
    
    // Create and add axes
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');
    
    chart.append('g')
        .call(d3.axisLeft(yScale));
    
    // Add bars
    chart.selectAll('.bar')
        .data(topSkills)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.skill))
        .attr('y', d => yScale(d.count))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d.count))
        .attr('fill', '#4e79a7');
    
    // Add title
    svg.append('text')
        .attr('x', width / 2 + margin.left)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Top 10 Most Common Skills');
    
    // Add labels on top of bars
    chart.selectAll('.label')
        .data(topSkills)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.skill) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.count) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.count);
}