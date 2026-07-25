/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  try {
    console.log('Seeding communication data...');

    // Get school and users
    const school = await knex('schools').first();
    const principal = await knex('users').where('email', 'like', 'principal.%').first();
    const teacher = await knex('users').where('email', 'like', 'teacher.%').first();
    const parent = await knex('users').where('email', 'like', 'parent%').first();
    const student = await knex('students').first();
    const studentUser = student ? await knex('users').where('id', student.user_id).first() : null;

    if (!school || !principal || !teacher || !parent || !studentUser) {
      console.log('Required users not found, skipping seed');
      console.log('School:', !!school, 'Principal:', !!principal, 'Teacher:', !!teacher, 'Parent:', !!parent, 'StudentUser:', !!studentUser);
      return;
    }

    // Seed Messages
    const messages = [
      {
        school_id: school.id,
        sender_id: principal.id,
        receiver_id: teacher.id,
        content: 'Welcome to the Integrated Management System. Please review the school policies and update your profile.',
        is_read: true,
        read_at: new Date()
      },
      {
        school_id: school.id,
        sender_id: teacher.id,
        receiver_id: studentUser.id,
        content: 'Please remember to submit your mathematics assignment by Friday.',
        is_read: true,
        read_at: new Date()
      },
      {
        school_id: school.id,
        sender_id: parent.id,
        receiver_id: teacher.id,
        content: 'Hello, I have a question about the science homework assigned yesterday.',
        is_read: false
      },
      {
        school_id: school.id,
        sender_id: principal.id,
        receiver_id: teacher.id,
        content: 'Please attend the staff meeting scheduled for next Monday at 9 AM.',
        is_read: true,
        read_at: new Date()
      },
      {
        school_id: school.id,
        sender_id: teacher.id,
        receiver_id: parent.id,
        content: 'Your child is showing great improvement in mathematics. Keep up the good work!',
        is_read: false
      }
    ];

    for (const message of messages) {
      await knex('messages').insert(message);
    }
    console.log('✓ Messages seeded');

    // Seed Announcements
    const announcements = [
      {
        school_id: school.id,
        created_by: principal.id,
        title: 'School Closure Notice',
        content: 'The school will be closed on Monday for a public holiday. Classes will resume on Tuesday.',
        target_audience: JSON.stringify({ roles: ['all'] }),
        publish_date: new Date(),
        is_active: true
      },
      {
        school_id: school.id,
        created_by: principal.id,
        title: 'Parent-Teacher Conference',
        content: 'Parent-teacher conferences will be held next week. Please sign up for a time slot.',
        target_audience: JSON.stringify({ roles: ['parent'] }),
        publish_date: new Date(),
        is_active: true
      },
      {
        school_id: school.id,
        created_by: principal.id,
        title: 'New Academic Year Registration',
        content: 'Registration for the upcoming academic year is now open. Please complete the registration process by the end of this month.',
        target_audience: JSON.stringify({ roles: ['all'] }),
        publish_date: new Date(),
        is_active: true
      },
      {
        school_id: school.id,
        created_by: principal.id,
        title: 'Sports Day',
        content: 'Annual sports day will be held on the 15th of this month. All students are encouraged to participate.',
        target_audience: JSON.stringify({ roles: ['student'] }),
        publish_date: new Date(),
        is_active: true
      }
    ];

    for (const announcement of announcements) {
      await knex('announcements').insert(announcement);
    }
    console.log('✓ Announcements seeded');

    // Seed Notifications
    const notifications = [
      {
        user_id: principal.id,
        title: 'New Message',
        message: 'You have received a new message.',
        type: 'message',
        reference_id: messages[0].id,
        reference_type: 'message',
        is_read: true
      },
      {
        user_id: teacher.id,
        title: 'New Announcement',
        message: 'A new announcement has been published: School Closure Notice',
        type: 'announcement',
        reference_id: announcements[0].id,
        reference_type: 'announcement',
        is_read: false
      },
      {
        user_id: parent.id,
        title: 'New Announcement',
        message: 'A new announcement has been published: Parent-Teacher Conference',
        type: 'announcement',
        reference_id: announcements[1].id,
        reference_type: 'announcement',
        is_read: false
      }
    ];

    for (const notification of notifications) {
      await knex('notifications').insert(notification);
    }
    console.log('✓ Notifications seeded');

    console.log('Communication data seeded successfully!');
  } catch (error) {
    console.error('Error seeding communication data:', error);
    throw error;
  }
};
