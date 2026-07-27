const bcrypt = require('bcryptjs');

/**
 * Generate email from name (first initial + last name)
 * Handles middle names by taking initials of all first name parts
 * Examples:
 * - John Doe → jdoe@simtechinstitute.edu
 * - Jane Smith → jsmith@simtechinstitute.edu
 * - John Michael Doe → jmdoe@simtechinstitute.edu
 * - Mary Ann Johnson → majohnson@simtechinstitute.edu
 */
const generateEmailFromName = (firstName, lastName, schoolDomain = 'simtechinstitute.edu') => {
  // Split first name into parts (handles middle names)
  const firstNameParts = firstName.trim().split(/\s+/);
  
  // Get initials from all first name parts
  const firstNameInitials = firstNameParts
    .map(part => part.charAt(0).toLowerCase())
    .join('');
  
  // Get last name (lowercase, remove spaces/special characters)
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Combine: first name initials + last name
  const emailPrefix = `${firstNameInitials}${cleanLastName}`;
  
  return `${emailPrefix}@${schoolDomain}`;
};

/**
 * Generate unique email from name (handles duplicates)
 */
const generateUniqueEmail = async (knex, firstName, lastName, schoolDomain = 'simtechinstitute.edu') => {
  let baseEmail = generateEmailFromName(firstName, lastName, schoolDomain);
  let email = baseEmail;
  let counter = 1;
  
  while (true) {
    const existingUser = await knex('users').where('email', email).first();
    if (!existingUser) {
      break;
    }
    
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    email = `${firstName.charAt(0).toLowerCase()}${cleanLastName}${counter}@${schoolDomain}`;
    counter++;
  }
  
  return email;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const hashedPassword = await bcrypt.hash('Student123!', 10);
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const studentRoleId = process.env.SEED_ROLE_STUDENT_ID || (await knex('roles').where('name', 'student').first('id')).id;
  
  // Get existing student user emails
  const existingStudentUsers = await knex('users').where('role_id', studentRoleId).select('email');
  const existingStudentEmails = existingStudentUsers.map(u => u.email);
  
  // Get grade IDs
  const grades = await knex('grades').select('id', 'code', 'name', 'division_id');
  
  // Sample student names
  const studentNames = [
    { first: 'John', last: 'Doe' },
    { first: 'Jane', last: 'Smith' },
    { first: 'Michael', last: 'Johnson' },
    { first: 'Emily', last: 'Williams' },
    { first: 'David', last: 'Brown' },
    { first: 'Sarah', last: 'Davis' },
    { first: 'James', last: 'Miller' },
    { first: 'Lisa', last: 'Wilson' },
    { first: 'Robert', last: 'Moore' },
    { first: 'Maria', last: 'Taylor' },
    { first: 'William', last: 'Anderson' },
    { first: 'Jennifer', last: 'Thomas' },
    { first: 'Christopher', last: 'Jackson' },
    { first: 'Amanda', last: 'White' },
    { first: 'Daniel', last: 'Harris' },
    { first: 'Jessica', last: 'Martin' },
    { first: 'Matthew', last: 'Thompson' },
    { first: 'Ashley', last: 'Garcia' },
    { first: 'Andrew', last: 'Martinez' },
    { first: 'Stephanie', last: 'Robinson' }
  ];
  
  // Create sample students distributed across grades
  let nameIndex = 0;
  let newStudentsCount = 0;
  
  for (const grade of grades) {
    // Create 2-3 students per grade
    const studentsPerGrade = grade.name.includes('Grade') ? 2 : 3;
    
    for (let i = 0; i < studentsPerGrade; i++) {
      const studentName = studentNames[nameIndex % studentNames.length];
      const email = await generateUniqueEmail(knex, studentName.first, studentName.last);
      
      // Skip if student user already exists
      if (existingStudentEmails.includes(email)) {
        nameIndex++;
        continue;
      }
      
      // Generate student ID based on division and year
      const divisionCode = grade.code.split('-')[0];
      const studentNumber = String(nameIndex + 1).padStart(4, '0');
      const generatedId = `${divisionCode}-2024-${studentNumber}`;
      
      // Create user account for student
      const userId = (await knex('users').insert({
        school_id: schoolId,
        email: email,
        password: hashedPassword,
        role_id: studentRoleId,
        first_name: studentName.first,
        last_name: studentName.last,
        phone: `+231880857${990 + nameIndex + 1}`,
        is_active: true
      }).returning('id'))[0].id;
      
      // Insert student record
      await knex('students').insert({
        school_id: schoolId,
        user_id: userId,
        student_id: generatedId,
        grade_id: grade.id,
        division_id: grade.division_id,
        date_of_birth: '2010-01-15',
        gender: nameIndex % 2 === 0 ? 'F' : 'M',
        address: 'Gbarnga City, Bong County',
        enrollment_date: '2024-09-01',
        status: 'active'
      });
      
      newStudentsCount++;
      nameIndex++;
    }
  }
  
  console.log(`Processed ${newStudentsCount} new sample students with name-based emails`);
};
