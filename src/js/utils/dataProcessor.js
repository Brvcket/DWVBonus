export function parseCSV(data) {
    const rows = data.split('\n').slice(1); // Skip header
    return rows.map(row => {
        const columns = row.split(',');
        return {
            url: columns[0],
            experience: columns[1],
            work_format: columns[2],
            salary: columns[3],
            employment_type: columns[4],
            skills: columns[5] ? columns[5].split(',').map(skill => skill.trim()) : []
        };
    });
}

export function filterByExperience(data, experienceLevel) {
    return data.filter(job => job.experience === experienceLevel);
}

export function getTopSkills(data, topN = 10) {
    const skillCount = {};

    data.forEach(job => {
        job.skills.forEach(skill => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
    });

    return Object.entries(skillCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topN)
        .map(([skill]) => skill);
}

export function getSalaryRanges(data) {
    const salaryRanges = {};

    data.forEach(job => {
        if (job.salary && job.salary.includes('до')) {
            const maxSalary = parseInt(job.salary.split(' ')[1].replace(/\s/g, ''), 10);
            salaryRanges[maxSalary] = (salaryRanges[maxSalary] || 0) + 1;
        } else if (job.salary && job.salary.includes('от')) {
            const minSalary = parseInt(job.salary.split(' ')[1].replace(/\s/g, ''), 10);
            salaryRanges[minSalary] = (salaryRanges[minSalary] || 0) + 1;
        }
    });

    return salaryRanges;
}

export async function loadData() {
    try {
        const data = await d3.csv("data/hh_job_details.csv");
        return data;
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}