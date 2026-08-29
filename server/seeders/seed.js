const { sequelize, User, StudentProfile, TeacherProfile, ParentProfile, Class, Subject, ClassSubject, Course, Book, Enrollment, Timetable, Notification } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced!\n');

    // ============= CLASSES =============
    const classData = [
      { name: 'KG', display_name: 'KG / Pre-1', grade_level: 0 },
      { name: '1', display_name: 'Class 1', grade_level: 1 },
      { name: '2', display_name: 'Class 2', grade_level: 2 },
      { name: '3', display_name: 'Class 3', grade_level: 3 },
      { name: '4', display_name: 'Class 4', grade_level: 4 },
      { name: '5', display_name: 'Class 5', grade_level: 5 },
      { name: '6', display_name: 'Class 6', grade_level: 6 },
      { name: '7', display_name: 'Class 7', grade_level: 7 },
      { name: '8', display_name: 'Class 8', grade_level: 8 },
    ];
    const classes = await Class.bulkCreate(classData);
    console.log('✅ 9 Classes created (KG-8)');

    // ============= SUBJECTS =============
    const subjectData = [
      { name: 'English', name_urdu: 'انگریزی', code: 'ENG' },
      { name: 'Urdu', name_urdu: 'اردو', code: 'URD' },
      { name: 'Mathematics', name_urdu: 'ریاضی', code: 'MATH' },
      { name: 'General Science', name_urdu: 'جنرل سائنس', code: 'SCI' },
      { name: 'Social Studies', name_urdu: 'معاشرتی علوم', code: 'SST' },
      { name: 'Islamiat', name_urdu: 'اسلامیات', code: 'ISL' },
      { name: 'Computer Science', name_urdu: 'کمپیوٹر سائنس', code: 'CS' },
      { name: 'Waqfiyat e Aama / GK', name_urdu: 'واقفیات عامہ', code: 'GK' },
      { name: 'Tajweedi Qaida', name_urdu: 'تجویدی قاعدہ', code: 'TQ' },
      { name: 'Akhlaqiat (Ethics)', name_urdu: 'اخلاقیات', code: 'AKH' },
      { name: 'Neela Qaida (SRM)', name_urdu: 'نیلا قاعدہ', code: 'NQ' },
      { name: 'History', name_urdu: 'تاریخ', code: 'HIST' },
      { name: 'Geography', name_urdu: 'جغرافیہ', code: 'GEO' },
      { name: 'Arabic', name_urdu: 'عربی', code: 'ARB' },
    ];
    const subjects = await Subject.bulkCreate(subjectData);
    console.log('✅ 14 Subjects created');

    // Subject code to id map
    const S = {};
    subjects.forEach(s => { S[s.code] = s.id; });

    // Class grade to id map
    const C = {};
    classes.forEach(c => { C[c.grade_level] = c.id; });

    // ============= CLASS-SUBJECT MAPPING =============
    const classSubjectMap = {
      0: ['ENG', 'URD', 'MATH', 'ISL', 'NQ'],          // KG
      1: ['ENG', 'URD', 'MATH', 'ISL', 'TQ', 'GK', 'AKH'],  // Class 1
      2: ['ENG', 'URD', 'MATH', 'ISL', 'GK', 'AKH'],         // Class 2
      3: ['ENG', 'URD', 'MATH', 'SCI', 'SST', 'ISL', 'AKH'], // Class 3
      4: ['ENG', 'URD', 'MATH', 'SCI', 'SST', 'ISL', 'AKH'], // Class 4
      5: ['ENG', 'URD', 'MATH', 'SCI', 'SST', 'ISL', 'AKH'], // Class 5
      6: ['ENG', 'URD', 'MATH', 'SCI', 'SST', 'ISL', 'CS', 'AKH', 'ARB'],  // Class 6
      7: ['ENG', 'URD', 'MATH', 'SCI', 'SST', 'ISL', 'CS', 'AKH', 'ARB'],  // Class 7
      8: ['ENG', 'URD', 'MATH', 'SCI', 'ISL', 'CS', 'AKH', 'ARB', 'HIST', 'GEO'],  // Class 8
    };

    for (const [grade, codes] of Object.entries(classSubjectMap)) {
      for (const code of codes) {
        await ClassSubject.create({ class_id: C[grade], subject_id: S[code] });
      }
    }
    console.log('✅ Class-Subject mappings created');

    // ============= PCTB 2026 BOOKS WITH REAL USTAD360 LINKS =============
    const u = 'https://www.ustad360.com';
    const bookSeeds = [
      // ─── KG / Pre-1 ───
      { class_id: C[0], subject_id: S['ENG'],  title: 'Primer English PCTB 2026',     title_urdu: 'پرائمر انگریزی',   pdf_url: `${u}/pre-1-primer-english-punjab-textbook-pdf/`, cover_image: '📘' },
      { class_id: C[0], subject_id: S['URD'],  title: 'Primer Urdu PCTB 2026',        title_urdu: 'پرائمر اردو',      pdf_url: `${u}/pre-1-primer-urdu-snc-punjab-textbook-pdf/`, cover_image: '📗' },
      { class_id: C[0], subject_id: S['MATH'], title: 'Primer Mathematics PCTB 2026',  title_urdu: 'پرائمر ریاضی',     pdf_url: `${u}/pre-1-primer-mathematics-punjab-textbook-pdf/`, cover_image: '📙' },
      { class_id: C[0], subject_id: S['NQ'],   title: 'Neela Qaida (SRM) PCTB 2026',  title_urdu: 'نیلا قاعدہ',       pdf_url: `${u}/pre-1-neela-qaida-pctb-textbook-pdf/`, cover_image: '📕' },

      // ─── Class 1 ───
      { class_id: C[1], subject_id: S['ENG'],  title: 'English Class 1 PCTB 2026',    title_urdu: 'انگریزی',  pdf_url: `${u}/one-class-english-pctb-text-book-pdf/`, cover_image: '📘' },
      { class_id: C[1], subject_id: S['URD'],  title: 'Urdu Class 1 PCTB 2026',       title_urdu: 'اردو',     pdf_url: `${u}/class-1-urdu-punjab-text-book-pdf/`, cover_image: '📗' },
      { class_id: C[1], subject_id: S['MATH'], title: 'Mathematics Class 1 PCTB 2026', title_urdu: 'ریاضی',    pdf_url: `${u}/class-1-maths-snc-punjab-textbook-pdf/`, cover_image: '📙' },
      { class_id: C[1], subject_id: S['ISL'],  title: 'Islamiat Class 1 PCTB 2026',   title_urdu: 'اسلامیات', pdf_url: `${u}/class-1-islamiat-snc-punjab-text-book-pdf/`, cover_image: '📕' },
      { class_id: C[1], subject_id: S['TQ'],   title: 'Tajweedi Qaida Class 1 PCTB',  title_urdu: 'تجویدی قاعدہ', pdf_url: `${u}/class-1-tajweedi-qaida-punjab-textbook-pdf/`, cover_image: '📓' },
      { class_id: C[1], subject_id: S['GK'],   title: 'Waqfiyat e Aama Class 1 PCTB', title_urdu: 'واقفیات عامہ', pdf_url: `${u}/class-1-waqfiyat-e-aama-punjab-textbook-pdf/`, cover_image: '📔' },
      { class_id: C[1], subject_id: S['AKH'],  title: 'Akhlaqiat Class 1 PCTB 2026',  title_urdu: 'اخلاقیات', pdf_url: `${u}/class-1-akhlaqiat-snc-punjab-text-book-pdf/`, cover_image: '📒' },

      // ─── Class 2 ───
      { class_id: C[2], subject_id: S['ENG'],  title: 'English Class 2 PCTB 2026',    title_urdu: 'انگریزی',  pdf_url: `${u}/class-2-english-pctb-text-book-pdf/`, cover_image: '📘' },
      { class_id: C[2], subject_id: S['URD'],  title: 'Urdu Class 2 PCTB 2026',       title_urdu: 'اردو',     pdf_url: `${u}/class-2-urdu-punjab-text-book-pdf/`, cover_image: '📗' },
      { class_id: C[2], subject_id: S['MATH'], title: 'Mathematics Class 2 PCTB 2026', title_urdu: 'ریاضی',    pdf_url: `${u}/class-2-maths-snc-punjab-textbook-pdf/`, cover_image: '📙' },
      { class_id: C[2], subject_id: S['ISL'],  title: 'Islamiat Class 2 PCTB 2026',   title_urdu: 'اسلامیات', pdf_url: `${u}/class-2-islamiat-snc-punjab-text-book-pdf/`, cover_image: '📕' },
      { class_id: C[2], subject_id: S['GK'],   title: 'Waqfiyat e Aama Class 2 PCTB', title_urdu: 'واقفیات عامہ', pdf_url: `${u}/class-2-waqfiyat-e-aama-punjab-textbook-pdf/`, cover_image: '📔' },
      { class_id: C[2], subject_id: S['AKH'],  title: 'Akhlaqiat Class 2 PCTB 2026',  title_urdu: 'اخلاقیات', pdf_url: `${u}/class-2-akhlaqiat-snc-punjab-text-book-pdf/`, cover_image: '📒' },

      // ─── Class 3 ───
      { class_id: C[3], subject_id: S['ENG'],  title: 'English Class 3 PCTB 2026',        title_urdu: 'انگریزی',       pdf_url: `${u}/class-3-english-pctb-text-book-pdf/`, cover_image: '📘' },
      { class_id: C[3], subject_id: S['URD'],  title: 'Urdu Class 3 PCTB 2026',           title_urdu: 'اردو',          pdf_url: `${u}/class-3-urdu-punjab-text-book-pdf/`, cover_image: '📗' },
      { class_id: C[3], subject_id: S['MATH'], title: 'Mathematics Class 3 PCTB 2026',     title_urdu: 'ریاضی',         pdf_url: `${u}/class-3-maths-snc-punjab-textbook-pdf/`, cover_image: '📙' },
      { class_id: C[3], subject_id: S['SCI'],  title: 'General Science Class 3 PCTB 2026', title_urdu: 'جنرل سائنس',    pdf_url: `${u}/class-3-general-science-punjab-textbook-pdf/`, cover_image: '🔬' },
      { class_id: C[3], subject_id: S['SST'],  title: 'Social Studies Class 3 PCTB 2026',  title_urdu: 'معاشرتی علوم',  pdf_url: `${u}/3rd-class-mashrati-uloom-sst-punjab-textbook-pdf/`, cover_image: '🌍' },
      { class_id: C[3], subject_id: S['ISL'],  title: 'Islamiat Class 3 PCTB 2026',       title_urdu: 'اسلامیات',       pdf_url: `${u}/class-3-islamiat-snc-punjab-text-book-pdf/`, cover_image: '📕' },
      { class_id: C[3], subject_id: S['AKH'],  title: 'Akhlaqiat Class 3 PCTB 2026',      title_urdu: 'اخلاقیات',       pdf_url: `${u}/class-3-akhlaqiat-snc-punjab-text-book-pdf/`, cover_image: '📒' },

      // ─── Class 4 ───
      { class_id: C[4], subject_id: S['ENG'],  title: 'English Class 4 PCTB 2026',        title_urdu: 'انگریزی',      pdf_url: `${u}/4th-class-english-pctb-text-book-snc/`, cover_image: '📘' },
      { class_id: C[4], subject_id: S['URD'],  title: 'Urdu Class 4 PCTB 2026',           title_urdu: 'اردو',         pdf_url: `${u}/4th-class-urdu-punjab-text-book-snc-pdf/`, cover_image: '📗' },
      { class_id: C[4], subject_id: S['MATH'], title: 'Mathematics Class 4 PCTB 2026',     title_urdu: 'ریاضی',        pdf_url: `${u}/class-4-maths-pctb-punjab-text-book-snc/`, cover_image: '📙' },
      { class_id: C[4], subject_id: S['SCI'],  title: 'General Science Class 4 PCTB 2026', title_urdu: 'جنرل سائنس',   pdf_url: `${u}/4th-class-general-science-punjab-textbook-pdf/`, cover_image: '🔬' },
      { class_id: C[4], subject_id: S['SST'],  title: 'Social Studies Class 4 PCTB 2026',  title_urdu: 'معاشرتی علوم', pdf_url: `${u}/4th-class-mashrati-uloom-sst-punjab-textbook-pdf/`, cover_image: '🌍' },
      { class_id: C[4], subject_id: S['ISL'],  title: 'Islamiat Class 4 PCTB 2026',       title_urdu: 'اسلامیات',      pdf_url: `${u}/class-4-islamiat-snc-punjab-text-book-pdf/`, cover_image: '📕' },
      { class_id: C[4], subject_id: S['AKH'],  title: 'Akhlaqiat Class 4 PCTB 2026',      title_urdu: 'اخلاقیات',      pdf_url: `${u}/class-4-ethics-akhlaqiat-punjab-text-book-pdf/`, cover_image: '📒' },

      // ─── Class 5 ───
      { class_id: C[5], subject_id: S['ENG'],  title: 'English Class 5 PCTB 2026',        title_urdu: 'انگریزی',      pdf_url: `${u}/5th-class-english-pctb-text-book-snc/`, cover_image: '📘' },
      { class_id: C[5], subject_id: S['URD'],  title: 'Urdu Class 5 PCTB 2026',           title_urdu: 'اردو',         pdf_url: `${u}/5th-class-urdu-punjab-text-book-snc-pdf/`, cover_image: '📗' },
      { class_id: C[5], subject_id: S['MATH'], title: 'Mathematics Class 5 PCTB 2026',     title_urdu: 'ریاضی',        pdf_url: `${u}/class-5-maths-pctb-punjab-text-book-snc/`, cover_image: '📙' },
      { class_id: C[5], subject_id: S['SCI'],  title: 'General Science Class 5 PCTB 2026', title_urdu: 'جنرل سائنس',   pdf_url: `${u}/5th-class-general-science-punjab-textbook-pdf/`, cover_image: '🔬' },
      { class_id: C[5], subject_id: S['SST'],  title: 'Social Studies Class 5 PCTB 2026',  title_urdu: 'معاشرتی علوم', pdf_url: `${u}/5th-class-mashrati-uloom-sst-punjab-textbook-pdf/`, cover_image: '🌍' },
      { class_id: C[5], subject_id: S['ISL'],  title: 'Islamiat Class 5 PCTB 2026',       title_urdu: 'اسلامیات',      pdf_url: `${u}/class-5-islamiat-snc-punjab-text-book-pdf/`, cover_image: '📕' },
      { class_id: C[5], subject_id: S['AKH'],  title: 'Akhlaqiat Class 5 PCTB 2026',      title_urdu: 'اخلاقیات',      pdf_url: `${u}/class-5-ethics-akhlaqiat-punjab-text-book-pdf/`, cover_image: '📒' },

      // ─── Class 6 ───
      { class_id: C[6], subject_id: S['ENG'],  title: 'English Class 6 PCTB 2026',        title_urdu: 'انگریزی',        pdf_url: `${u}/6th-class-english-pctb-text-book-snc/`, cover_image: '📘' },
      { class_id: C[6], subject_id: S['URD'],  title: 'Urdu Class 6 PCTB 2026',           title_urdu: 'اردو',           pdf_url: `${u}/6th-class-urdu-punjab-text-book-snc-pdf/`, cover_image: '📗' },
      { class_id: C[6], subject_id: S['MATH'], title: 'Mathematics Class 6 PCTB 2026',     title_urdu: 'ریاضی',          pdf_url: `${u}/class-6-maths-pctb-punjab-text-book-snc/`, cover_image: '📙' },
      { class_id: C[6], subject_id: S['SCI'],  title: 'General Science Class 6 PCTB 2026', title_urdu: 'جنرل سائنس',     pdf_url: `${u}/6th-class-general-science-punjab-textbook-pdf/`, cover_image: '🔬' },
      { class_id: C[6], subject_id: S['SST'],  title: 'Social Studies Class 6 PCTB 2026',  title_urdu: 'معاشرتی علوم',   pdf_url: `${u}/6th-class-mashrati-uloom-sst-punjab-textbook-pdf/`, cover_image: '🌍' },
      { class_id: C[6], subject_id: S['ISL'],  title: 'Islamiat Class 6 PCTB 2026',       title_urdu: 'اسلامیات',        pdf_url: `${u}/class-6-islamiat-snc-punjab-text-book-pdf/`, cover_image: '📕' },
      { class_id: C[6], subject_id: S['CS'],   title: 'Computer Science Class 6 PCTB 2026', title_urdu: 'کمپیوٹر سائنس', pdf_url: `${u}/6th-class-computer-snc-punjab-textbook-pdf/`, cover_image: '💻' },
      { class_id: C[6], subject_id: S['AKH'],  title: 'Akhlaqiat Class 6 PCTB 2026',      title_urdu: 'اخلاقیات',        pdf_url: `${u}/class-6-ethics-akhlaqiat-punjab-text-book-pdf/`, cover_image: '📒' },
      { class_id: C[6], subject_id: S['ARB'],  title: 'Arabic Class 6 PCTB 2026',         title_urdu: 'عربی',            pdf_url: `${u}/6th-class-arabic-punjab-text-book-pdf/`, cover_image: '📓' },

      // ─── Class 7 ───
      { class_id: C[7], subject_id: S['ENG'],  title: 'English Class 7 PCTB 2026',        title_urdu: 'انگریزی',        pdf_url: `${u}/7th-class-english-textbook-snc-by-punjab-board/`, cover_image: '📘' },
      { class_id: C[7], subject_id: S['URD'],  title: 'Urdu Class 7 PCTB 2026',           title_urdu: 'اردو',           pdf_url: `${u}/7th-class-urdu-snc-punjab-textbook-pdf/`, cover_image: '📗' },
      { class_id: C[7], subject_id: S['MATH'], title: 'Mathematics Class 7 PCTB 2026',     title_urdu: 'ریاضی',          pdf_url: `${u}/class-7-maths-snc-punjab-textbook-pdf/`, cover_image: '📙' },
      { class_id: C[7], subject_id: S['SCI'],  title: 'General Science Class 7 PCTB 2026', title_urdu: 'جنرل سائنس',     pdf_url: `${u}/7th-class-general-science-punjab-textbook-snc-pdf/`, cover_image: '🔬' },
      { class_id: C[7], subject_id: S['SST'],  title: 'Social Studies Class 7 PCTB 2026',  title_urdu: 'معاشرتی علوم',   pdf_url: `${u}/7th-class-mashrati-uloom-sst-punjab-textbook-pdf/`, cover_image: '🌍' },
      { class_id: C[7], subject_id: S['ISL'],  title: 'Islamiat Class 7 PCTB 2026',       title_urdu: 'اسلامیات',        pdf_url: `${u}/7th-class-islamiat-punjab-textbook-snc-pdf/`, cover_image: '📕' },
      { class_id: C[7], subject_id: S['CS'],   title: 'Computer Science Class 7 PCTB 2026', title_urdu: 'کمپیوٹر سائنس', pdf_url: `${u}/7th-class-computer-snc-punjab-textbook-pdf/`, cover_image: '💻' },
      { class_id: C[7], subject_id: S['AKH'],  title: 'Akhlaqiat Class 7 PCTB 2026',      title_urdu: 'اخلاقیات',        pdf_url: `${u}/class-7-ethics-akhlaqiat-punjab-text-book-pdf/`, cover_image: '📒' },
      { class_id: C[7], subject_id: S['ARB'],  title: 'Arabic Class 7 PCTB 2026',         title_urdu: 'عربی',            pdf_url: `${u}/7th-class-arabic-punjab-text-book-pdf/`, cover_image: '📓' },

      // ─── Class 8 ───
      { class_id: C[8], subject_id: S['ENG'],  title: 'English Class 8 PCTB 2026',         title_urdu: 'انگریزی',        pdf_url: `${u}/8th-class-english-textbook-snc-by-punjab-board/`, cover_image: '📘' },
      { class_id: C[8], subject_id: S['URD'],  title: 'Urdu Class 8 PCTB 2026',            title_urdu: 'اردو',           pdf_url: `${u}/8th-class-urdu-snc-punjab-textbook-pdf/`, cover_image: '📗' },
      { class_id: C[8], subject_id: S['MATH'], title: 'Mathematics Class 8 PCTB 2026',      title_urdu: 'ریاضی',          pdf_url: `${u}/class-8-maths-snc-punjab-textbook-pdf/`, cover_image: '📙' },
      { class_id: C[8], subject_id: S['SCI'],  title: 'General Science Class 8 PCTB 2026',  title_urdu: 'جنرل سائنس',     pdf_url: `${u}/8th-class-general-science-punjab-textbook-snc-pdf/`, cover_image: '🔬' },
      { class_id: C[8], subject_id: S['ISL'],  title: 'Islamiat Class 8 PCTB 2026',        title_urdu: 'اسلامیات',        pdf_url: `${u}/8th-class-islamiat-punjab-textbook-snc-pdf/`, cover_image: '📕' },
      { class_id: C[8], subject_id: S['CS'],   title: 'Computer Science Class 8 PCTB 2026', title_urdu: 'کمپیوٹر سائنس', pdf_url: `${u}/8th-class-computer-snc-punjab-textbook-pdf/`, cover_image: '💻' },
      { class_id: C[8], subject_id: S['AKH'],  title: 'Akhlaqiat Class 8 PCTB 2026',       title_urdu: 'اخلاقیات',        pdf_url: `${u}/8th-class-ethics-ikhlaqiat-pctb-textbook-pdf/`, cover_image: '📒' },
      { class_id: C[8], subject_id: S['ARB'],  title: 'Arabic Class 8 PCTB 2026',          title_urdu: 'عربی',            pdf_url: `${u}/8th-class-arabic-punjab-text-book-pdf/`, cover_image: '📓' },
      { class_id: C[8], subject_id: S['HIST'], title: 'History Class 8 PCTB 2026',         title_urdu: 'تاریخ',           pdf_url: `${u}/8th-class-history-textbook-pdf-by-punjab-board/`, cover_image: '📜' },
      { class_id: C[8], subject_id: S['GEO'],  title: 'Geography Class 8 PCTB 2026',       title_urdu: 'جغرافیہ',         pdf_url: `${u}/8th-class-geography-snc-pctb-textbook-pdf/`, cover_image: '🗺️' },
    ];

    // Set common fields
    bookSeeds.forEach(b => {
      b.publisher = 'PCTB Punjab';
      b.year = 2026;
      b.is_active = true;
    });

    await Book.bulkCreate(bookSeeds);
    console.log(`✅ ${bookSeeds.length} PCTB Books seeded with REAL Ustad360 links`);

    // ============= SUPER ADMIN =============
    const admin = await User.create({
      email: 'admin@usmanonlineschool.com',
      password: 'Admin@123',
      role: 'super_admin',
      full_name: 'Usman Admin',
      phone: '03001234567',
      status: 'active',
    });
    console.log('✅ Super Admin created');

    // ============= SAMPLE TEACHER =============
    const teacher = await User.create({
      email: 'teacher@usmanonlineschool.com',
      password: 'Teacher@123',
      role: 'teacher',
      full_name: 'Ahmed Ali (Teacher)',
      phone: '03009876543',
      status: 'active',
    });
    await TeacherProfile.create({
      user_id: teacher.id,
      qualification: 'B.Ed, M.Sc Mathematics',
      specialization: 'Mathematics & Science',
      experience_years: 5,
      bio: 'Experienced Punjab Board teacher with 5 years in Mathematics and Science.',
    });

    const mathCourse5 = await Course.create({
      teacher_id: teacher.id,
      class_id: C[5],
      subject_id: S['MATH'],
      title: 'Mathematics - Class 5 (2026)',
      description: 'Complete Mathematics course for Class 5 Punjab Board PCTB 2026',
    });
    const sciCourse5 = await Course.create({
      teacher_id: teacher.id,
      class_id: C[5],
      subject_id: S['SCI'],
      title: 'General Science - Class 5 (2026)',
      description: 'Complete Science course for Class 5 Punjab Board PCTB 2026',
    });
    console.log('✅ Teacher + 2 Courses created');

    // ============= SAMPLE STUDENT =============
    const student = await User.create({
      email: 'student@usmanonlineschool.com',
      password: 'Student@123',
      role: 'student',
      full_name: 'Ali Raza',
      phone: '03111234567',
      status: 'active',
    });
    await StudentProfile.create({
      user_id: student.id,
      father_name: 'Muhammad Raza',
      mother_name: 'Fatima Raza',
      father_cnic: '35202-1234567-1',
      contact_number_1: '03111234567',
      contact_number_2: '03211234567',
      class_id: C[5],
      medium: 'English',
      roll_number: 'UOS-2026-0001',
      date_of_birth: '2015-03-15',
      address: 'House 123, Street 5, Lahore',
    });
    await Enrollment.create({ student_id: student.id, course_id: mathCourse5.id });
    await Enrollment.create({ student_id: student.id, course_id: sciCourse5.id });
    console.log('✅ Student created + enrolled in 2 courses');

    // ============= SAMPLE PARENT =============
    const parent = await User.create({
      email: 'parent@usmanonlineschool.com',
      password: 'Parent@123',
      role: 'parent',
      full_name: 'Muhammad Raza (Parent)',
      phone: '03211234567',
      status: 'active',
    });
    await ParentProfile.create({
      user_id: parent.id,
      relation: 'Father',
      cnic: '35202-1234567-1',
      occupation: 'Business',
    });
    await StudentProfile.update({ parent_id: parent.id }, { where: { user_id: student.id } });
    console.log('✅ Parent created + linked to student');

    // Sample timetable
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '08:00', end: '08:45' }, { start: '08:45', end: '09:30' },
      { start: '09:45', end: '10:30' }, { start: '10:30', end: '11:15' },
      { start: '11:30', end: '12:15' }, { start: '12:15', end: '13:00' },
    ];
    const class5Subs = [S['ENG'], S['URD'], S['MATH'], S['SCI'], S['SST'], S['ISL']];
    for (const day of days) {
      for (let i = 0; i < timeSlots.length; i++) {
        await Timetable.create({
          class_id: C[5], subject_id: class5Subs[i % class5Subs.length],
          teacher_id: teacher.id, day_of_week: day,
          start_time: timeSlots[i].start, end_time: timeSlots[i].end,
        });
      }
    }
    console.log('✅ Sample Timetable created');

    await Notification.create({
      user_id: student.id,
      title: 'Welcome to Usman Online School! 🎓',
      message: 'Your account is active. Explore your courses, books, and timetable.',
      type: 'success',
    });

    console.log('\n🎉 ══════════════════════════════════════');
    console.log('   SEED COMPLETED SUCCESSFULLY!');
    console.log('══════════════════════════════════════════');
    console.log('📊 Stats:');
    console.log(`   • ${bookSeeds.length} PCTB 2026 Books (Real Links)`);
    console.log('   • 9 Classes (KG-8th)');
    console.log('   • 14 Subjects');
    console.log('   • 4 Users (Admin, Teacher, Student, Parent)');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@usmanonlineschool.com    / Admin@123');
    console.log('Teacher: teacher@usmanonlineschool.com  / Teacher@123');
    console.log('Student: student@usmanonlineschool.com  / Student@123');
    console.log('Parent:  parent@usmanonlineschool.com   / Parent@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
