export function createExperienceChart(data) {
    // Function to count jobs by experience level
    function processData(data) {
        const experienceCounts = {};
        
        // Count jobs for each experience level
        data.forEach(job => {
            if (!job.experience) return;
            
            const exp = job.experience.trim();
            experienceCounts[exp] = (experienceCounts[exp] || 0) + 1;
        });
        
        // Convert to array for D3's pie layout
        return Object.entries(experienceCounts)
            .map(([experience, count]) => ({ experience, count }))
            .sort((a, b) => b.count - a.count); // Sort by count (optional)
    }

    // Process the data
    const experienceData = processData(data);
    
    // Map experience levels to English labels
    const experienceLabels = {
        'не требуется': 'No Experience',
        '1–3 года': '1-3 Years',
        '3–6 лет': '3-6 Years',
        'более 6 лет': '6+ Years'
    };
    
    // Clear any existing content
    d3.select('#experience-chart-container').html('');

    // Set up dimensions
    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select('#experience-chart-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Define color scale - use a categorical color scheme
    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Create pie layout
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null); // Keep the original order
    
    // Create arc generator
    const arc = d3.arc()
        .innerRadius(0) // For a pie chart (no hole in the middle)
        .outerRadius(radius * 0.8);
    
    // Create outer arc for label positioning
    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
    
    // Create pie chart segments
    const segments = svg.selectAll('.arc')
        .data(pie(experienceData))
        .enter()
        .append('g')
        .attr('class', 'arc');
    
    // Add path elements for each segment
    segments.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colors(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.8)
        .append('title') // Add tooltips
        .text(d => {
            const englishLabel = experienceLabels[d.data.experience] || d.data.experience;
            return `${englishLabel}: ${d.data.count} jobs (${(d.data.count / data.length * 100).toFixed(1)}%)`;
        });
    
    // Add labels with English translations
    segments.append('text')
        .attr('transform', d => {
            const pos = outerArc.centroid(d);
            // Move labels outward from the center
            const x = pos[0] * 1.1;
            const y = pos[1] * 1.1;
            return `translate(${x}, ${y})`;
        })
        .attr('dy', '.35em')
        .style('text-anchor', d => {
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return (midangle < Math.PI ? 'start' : 'end');
        })
        .text(d => {
            const englishLabel = experienceLabels[d.data.experience] || d.data.experience;
            return `${englishLabel} (${d.data.count})`;
        });
    
    // Add lines connecting segments to labels
    segments.append('polyline')
        .attr('points', d => {
            const pos = outerArc.centroid(d);
            // Move lines outward from center
            const x = pos[0] * 1.1;
            const y = pos[1] * 1.1;
            
            // Position line based on which side of the pie
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            const x2 = midangle < Math.PI ? x + 10 : x - 10;
            
            return [arc.centroid(d), outerArc.centroid(d), [x2, y]];
        })
        .style('fill', 'none')
        .style('stroke', 'gray')
        .style('stroke-width', 1);
    
    // Add title
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height/2 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Distribution of Jobs by Experience Level');
}