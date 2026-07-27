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
    const firstNameParts = firstName.trim().split(/\s+/);
    const firstNameInitials = firstNameParts
      .map(part => part.charAt(0).toLowerCase())
      .join('');
    email = `${firstNameInitials}${cleanLastName}${counter}@${schoolDomain}`;
    counter++;
  }
  
  return email;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const schoolId = process.env.SEED_SCHOOL_ID || (await knex('schools').first('id')).id;
  const principalRoleId = process.env.SEED_ROLE_PRINCIPAL_ID || (await knex('roles').where('name', 'principal').first('id')).id;
  const teacherRoleId = process.env.SEED_ROLE_TEACHER_ID || (await knex('roles').where('name', 'teacher').first('id')).id;
  const parentRoleId = process.env.SEED_ROLE_PARENT_ID || (await knex('roles').where('name', 'parent').first('id')).id;
  const staffRoleId = process.env.SEED_ROLE_STAFF_ID || (await knex('roles').where('name', 'staff').first('id')).id;
  
  // Get existing user emails
  const existingUsers = await knex('users').where('school_id', schoolId).select('email');
  const existingEmails = existingUsers.map(u => u.email);
  
  const usersToInsert = [];
  
  // Principals
  const principals = [
    { first: 'Sarah', last: 'Johnson' },
    { first: 'James', last: 'Williams' }
  ];
  
  for (const principal of principals) {
    const email = await generateUniqueEmail(knex, principal.first, principal.last);
    if (!existingEmails.includes(email)) {
      usersToInsert.push({
        school_id: schoolId,
        email: email,
        password: hashedPassword,
        role_id: principalRoleId,
        first_name: principal.first,
        last_name: principal.last,
        phone: '+231880857970',
        is_active: true
      });
    }
  }
  
  // Teachers
  const teachers = [
    { first: 'Mary', last: 'Brown', subject: 'English' },
    { first: 'John', last: 'Davis', subject: 'Mathematics' },
    { first: 'Emily', last: 'Miller', subject: 'Science' },
    { first: 'Michael', last: 'Wilson', subject: 'Social Studies' },
    { first: 'Lisa', last: 'Taylor', subject: 'ICT' }
  ];
  
  for (let i = 0; i < teachers.length; i++) {
    const email = await generateUniqueEmail(knex, teachers[i].first, teachers[i].last);
    if (!existingEmails.includes(email)) {
      usersToInsert.push({
        school_id: schoolId,
        email: email,
        password: hashedPassword,
        role_id: teacherRoleId,
        first_name: teachers[i].first,
        last_name: teachers[i].last,
        phone: `+231880857${972 + i}`,
        is_active: true
      });
    }
  }
  
  // Parents with realistic names
  const parents = [
    { first: 'Robert', last: 'Anderson' },
    { first: 'David', last: 'Thomas' },
    { first: 'Jennifer', last: 'White' },
    { first: 'Richard', last: 'Harris' },
    { first: 'Patricia', last: 'Martin' },
    { first: 'Charles', last: 'Thompson' },
    { first: 'Linda', last: 'Garcia' },
    { first: 'Joseph', last: 'Martinez' },
    { first: 'Elizabeth', last: 'Robinson' },
    { first: 'Thomas', last: 'Clark' }
  ];
  
  for (let i = 0; i < parents.length; i++) {
    const email = await generateUniqueEmail(knex, parents[i].first, parents[i].last);
    if (!existingEmails.includes(email)) {
      usersToInsert.push({
        school_id: schoolId,
        email: email,
        password: hashedPassword,
        role_id: parentRoleId,
        first_name: parents[i].first,
        last_name: parents[i].last,
        phone: `+231880857${977 + i}`,
        is_active: true
      });
    }
  }
  
  // Staff
  const staff = [
    { first: 'Robert', last: 'Anderson' },
    { first: 'David', last: 'Thomas' },
    { first: 'Jennifer', last: 'White' }
  ];
  
  for (let i = 0; i < staff.length; i++) {
    const email = await generateUniqueEmail(knex, staff[i].first, staff[i].last);
    if (!existingEmails.includes(email)) {
      usersToInsert.push({
        school_id: schoolId,
        email: email,
        password: hashedPassword,
        role_id: staffRoleId,
        first_name: staff[i].first,
        last_name: staff[i].last,
        phone: `+231880857${987 + i}`,
        is_active: true
      });
    }
  }
  
  // Insert only new users
  if (usersToInsert.length > 0) {
    await knex('users').insert(usersToInsert);
  }
  
  console.log(`Processed ${usersToInsert.length} new sample users with name-based emails`);
};
