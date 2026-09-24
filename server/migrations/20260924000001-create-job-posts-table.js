'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.showAllTables();
      const tableName = tables.find(t => (typeof t === 'string' ? t : t.tableName) === 'job_posts');

      if (!tableName) {
        await queryInterface.createTable('job_posts', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          department: {
            type: Sequelize.STRING,
            defaultValue: 'General',
          },
          category: {
            type: Sequelize.STRING,
            defaultValue: 'stem',
          },
          type: {
            type: Sequelize.STRING,
            defaultValue: 'Part-Time / Full-Time',
          },
          location: {
            type: Sequelize.STRING,
            defaultValue: 'Remote (100% Online)',
          },
          qualification: {
            type: Sequelize.STRING,
            defaultValue: '',
          },
          experience: {
            type: Sequelize.STRING,
            defaultValue: '',
          },
          description: {
            type: Sequelize.TEXT,
            defaultValue: '',
          },
          skills: {
            type: Sequelize.TEXT,
            defaultValue: '[]',
          },
          featured: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        });

        // Seed initial jobs
        const initialJobs = [
          {
            title: 'Senior Mathematics Teacher (Grade 6-8)',
            department: 'STEM',
            category: 'stem',
            type: 'Part-Time / Full-Time',
            location: 'Remote (100% Online)',
            qualification: 'BS / M.Sc Mathematics / Education',
            experience: '2+ Years Teaching Experience',
            description: 'Deliver engaging live video lectures, solve textbook exercises, and conduct interactive quizzes for Punjab Board Class 6th to 8th Mathematics curriculum.',
            skills: JSON.stringify(['PCTB Curriculum', 'Live Online Teaching', 'Problem Solving', 'Exam Preparation']),
            featured: true,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            title: 'General Science & Biology Educator (Grade 5-8)',
            department: 'Science',
            category: 'science',
            type: 'Part-Time (Evening Shift)',
            location: 'Remote (100% Online)',
            qualification: 'BS / M.Sc Biology, Chemistry or Physics',
            experience: '1+ Years Experience',
            description: 'Teach General Science following PCTB 2026 SLO-based syllabus. Explain scientific concepts with visual animations and interactive class sessions.',
            skills: JSON.stringify(['Science Demonstrations', 'SLO-Based Teaching', 'Digital Presentation', 'Urdu / English Fluency']),
            featured: true,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            title: 'English Language & Grammar Specialist (Grade 1-8)',
            department: 'Languages',
            category: 'languages',
            type: 'Flexible Hours',
            location: 'Remote (100% Online)',
            qualification: 'MA / BS English (Linguistics / Literature)',
            experience: '1+ Years Online Teaching',
            description: 'Instruct students in English reading, creative writing, spoken articulation, and textbook grammar for primary and middle school grades.',
            skills: JSON.stringify(['Grammar & Composition', 'Pronunciation', 'Storytelling', 'Student Motivation']),
            featured: false,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            title: 'Urdu & Islamiyat / Nazra Quran Teacher (KG-8)',
            department: 'Humanities & Islamic Studies',
            category: 'humanities',
            type: 'Morning / Evening Slots',
            location: 'Remote (100% Online)',
            qualification: 'MA Urdu / Islamic Studies / Shahadat-ul-Almiyah',
            experience: '1+ Years Experience',
            description: 'Conduct classes for Urdu literature, translation of Holy Quran (PCTB Tarjuma-tul-Quran curriculum), and moral education.',
            skills: JSON.stringify(['Tajweed & Nazra', 'Urdu Literature', 'Character Building', 'Patient Interaction']),
            featured: false,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            title: 'Computer Science & Digital Literacy Instructor (Grade 4-8)',
            department: 'IT & Computing',
            category: 'tech',
            type: 'Part-Time',
            location: 'Remote (100% Online)',
            qualification: 'BSCS / BSIT / Software Engineering',
            experience: 'Fresh or 1+ Years',
            description: 'Introduce fundamental programming logic, Microsoft Office, Internet safety, and PCTB Computer Education syllabus to young learners.',
            skills: JSON.stringify(['Coding Basics', 'Scratch / Python Intro', 'Screen Sharing', 'Interactive Labs']),
            featured: false,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            title: 'Junior Section Class Teacher (KG to Grade 3)',
            department: 'Early Childhood Education',
            category: 'primary',
            type: 'Morning Shift',
            location: 'Remote (100% Online)',
            qualification: 'B.A / B.Sc / B.Ed / Montessori Certified',
            experience: '1+ Years with Young Children',
            description: 'Conduct friendly, colorful, and engaging foundational sessions for English, Math, General Knowledge, and Phonics for early learners.',
            skills: JSON.stringify(['Montessori Methods', 'Phonics', 'Kid Engagement', 'Visual Props']),
            featured: true,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        await queryInterface.bulkInsert('job_posts', initialJobs);
      }
    } catch (err) {
      console.error('Migration 20260924000001 up error:', err.message);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('job_posts');
    } catch (err) {
      console.error('Migration 20260924000001 down error:', err.message);
    }
  },
};
