/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  
  // Get existing subject codes
  const existingSubjects = await knex('subjects').where('school_id', schoolId).select('code');
  const existingCodes = existingSubjects.map(s => s.code);
  
  const subjects = [
    { name: 'English', code: 'ENG', description: 'English Language and Literature', credit_hours: 5 },
    { name: 'Mathematics', code: 'MATH', description: 'Mathematics', credit_hours: 5 },
    { name: 'Science', code: 'SCI', description: 'General Science', credit_hours: 4 },
    { name: 'Social Studies', code: 'SS', description: 'Social Studies', credit_hours: 4 },
    { name: 'Biology', code: 'BIO', description: 'Biology', credit_hours: 4 },
    { name: 'Chemistry', code: 'CHEM', description: 'Chemistry', credit_hours: 4 },
    { name: 'Physics', code: 'PHY', description: 'Physics', credit_hours: 4 },
    { name: 'ICT', code: 'ICT', description: 'Information and Communication Technology', credit_hours: 3 },
    { name: 'Physical Education', code: 'PE', description: 'Physical Education', credit_hours: 2 },
    { name: 'Business Education', code: 'BUSE', description: 'Business Education', credit_hours: 3 },
    { name: 'Agriculture', code: 'AGR', description: 'Agricultural Science', credit_hours: 3 },
    { name: 'History', code: 'HIST', description: 'History', credit_hours: 3 },
    { name: 'Geography', code: 'GEO', description: 'Geography', credit_hours: 3 },
    { name: 'Literature', code: 'LIT', description: 'Literature in English', credit_hours: 3 },
    { name: 'Economics', code: 'ECON', description: 'Economics', credit_hours: 3 }
  ];
  
  const subjectsToInsert = subjects.filter(subject => !existingCodes.includes(subject.code));
  
  // Insert only new subjects
  if (subjectsToInsert.length > 0) {
    for (const subject of subjectsToInsert) {
      await knex('subjects').insert({
        school_id: schoolId,
        ...subject
      });
    }
  }
  
  console.log(`Processed ${subjectsToInsert.length} new subjects`);
};
