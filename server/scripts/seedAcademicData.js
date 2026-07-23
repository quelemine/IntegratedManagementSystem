require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');
const seedData = require('../seeds/009_sample_academic_data');

async function runSeed() {
  try {
    console.log('Starting academic data seed...');
    await seedData.seed(db);
    console.log('Academic data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding academic data:', error);
    process.exit(1);
  }
}

runSeed();
