import { loadData } from './utils/dataProcessor.js';
import { createExperienceChart } from './charts/experienceChart.js';
import { createSalaryChart } from './charts/salaryChart.js';
import { createSkillsChart } from './charts/skillsChart.js';

const init = async () => {
    const data = await loadData();

    createExperienceChart(data);
    createSalaryChart(data);
    createSkillsChart(data);
};

init();