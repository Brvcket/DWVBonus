export function createExperienceChart(data) {
    function processData(data) {
        const experienceCounts = {};
        
        data.forEach(job => {
            if (!job.experience) return;
            
            const exp = job.experience.trim();
            experienceCounts[exp] = (experienceCounts[exp] || 0) + 1;
        });
        
        return Object.entries(experienceCounts)
            .map(([experience, count]) => ({ experience, count }))
            .sort((a, b) => b.count - a.count);
    }

    const experienceData = processData(data);
    
    const experienceLabels = {
        'не требуется': 'No Experience',
        '1–3 года': '1-3 Years',
        '3–6 лет': '3-6 Years',
        'более 6 лет': '6+ Years'
    };
    
    d3.select('#experience-chart-container').html('');

    const width = 750;
    const height = 500;
    const radius = Math.min(width, height) / 3.2;
    
    const svg = d3.select('#experience-chart-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    const colors = d3.scaleOrdinal()
        .domain(experienceData.map(d => d.experience))
        .range(['#4e79a7', '#f28e2c', '#e15759', '#76b7b2']);
    
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8);
    
    const outerArc = d3.arc()
        .innerRadius(radius * 1.3)
        .outerRadius(radius * 1.3);
    
    const segments = svg.selectAll('.arc')
        .data(pie(experienceData))
        .enter()
        .append('g')
        .attr('class', 'arc');
    
    segments.append('path')
        .attr('d', arc)
        .attr('fill', d => colors(d.data.experience))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.8)
        .append('title')
        .text(d => {
            const englishLabel = experienceLabels[d.data.experience] || d.data.experience;
            return `${englishLabel}: ${d.data.count} jobs (${(d.data.count / data.length * 100).toFixed(1)}%)`;
        });
    
    segments.append('text')
        .attr('transform', d => {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            
            let x = pos[0] * 1.3;
            let y = pos[1] * 1.3;
            
            if (d.data.experience === 'не требуется') {
                y += 35; // Move "No Experience" label up to prevent overlap
            }
            
            return `translate(${x}, ${y})`;
        })
        .attr('dy', '.35em')
        .style('text-anchor', d => {
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return (midangle < Math.PI ? 'start' : 'end');
        })
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(d => {
            const englishLabel = experienceLabels[d.data.experience] || d.data.experience;
            return `${englishLabel} (${d.data.count})`;
        });
    
    segments.append('polyline')
        .attr('points', d => {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            
            let x = pos[0] * 1.3;
            let y = pos[1] * 1.3;
            
            if (d.data.experience === 'не требуется') {
                y += 35; // Adjust line for "No Experience" to match text
            }
            
            const x2 = midAngle < Math.PI ? x + 15 : x - 15;
            
            return [arc.centroid(d), outerArc.centroid(d), [x2, y]];
        })
        .style('fill', 'none')
        .style('stroke', 'gray')
        .style('stroke-width', 1);
    
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height/2 + 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Distribution of Jobs by Experience Level');
}