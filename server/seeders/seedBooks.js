const { Book, Class, Subject, sequelize } = require('../models');

const USTAD360 = 'https://www.ustad360.com';

const subjectCodeByName = {
  English: 'ENG',
  Urdu: 'URD',
  Mathematics: 'MATH',
  'General Science': 'SCI',
  'Social Studies': 'SST',
  Islamiat: 'ISL',
  'Computer Science': 'CS',
  'Waqfiyat e Aama / GK': 'GK',
  'Tajweedi Qaida': 'TQ',
  'Akhlaqiat (Ethics)': 'AKH',
  'Neela Qaida (SRM)': 'NQ',
  History: 'HIST',
  Geography: 'GEO',
  Arabic: 'ARB',
};

const books = [
  { grade: 0, code: 'ENG', title: 'Primer English PCTB 2026', url: `${USTAD360}/pre-1-primer-english-punjab-textbook-pdf/` },
  { grade: 0, code: 'URD', title: 'Primer Urdu PCTB 2026', url: `${USTAD360}/pre-1-primer-urdu-snc-punjab-textbook-pdf/` },
  { grade: 0, code: 'MATH', title: 'Primer Mathematics PCTB 2026', url: `${USTAD360}/pre-1-primer-mathematics-punjab-textbook-pdf/` },
  { grade: 0, code: 'NQ', title: 'Neela Qaida (SRM) PCTB 2026', url: `${USTAD360}/pre-1-neela-qaida-pctb-textbook-pdf/` },

  { grade: 1, code: 'ENG', title: 'English Class 1 PCTB 2026', url: `${USTAD360}/one-class-english-pctb-text-book-pdf/` },
  { grade: 1, code: 'URD', title: 'Urdu Class 1 PCTB 2026', url: `${USTAD360}/class-1-urdu-punjab-text-book-pdf/` },
  { grade: 1, code: 'MATH', title: 'Mathematics Class 1 PCTB 2026', url: `${USTAD360}/class-1-maths-snc-punjab-textbook-pdf/` },
  { grade: 1, code: 'ISL', title: 'Islamiat Class 1 PCTB 2026', url: `${USTAD360}/class-1-islamiat-snc-punjab-text-book-pdf/` },
  { grade: 1, code: 'TQ', title: 'Tajweedi Qaida Class 1 PCTB 2026', url: `${USTAD360}/class-1-tajweedi-qaida-punjab-textbook-pdf/` },
  { grade: 1, code: 'GK', title: 'Waqfiyat e Aama Class 1 PCTB 2026', url: `${USTAD360}/class-1-waqfiyat-e-aama-punjab-textbook-pdf/` },
  { grade: 1, code: 'AKH', title: 'Akhlaqiat Class 1 PCTB 2026', url: `${USTAD360}/class-1-akhlaqiat-snc-punjab-text-book-pdf/` },

  { grade: 2, code: 'ENG', title: 'English Class 2 PCTB 2026', url: `${USTAD360}/class-2-english-pctb-text-book-pdf/` },
  { grade: 2, code: 'URD', title: 'Urdu Class 2 PCTB 2026', url: `${USTAD360}/class-2-urdu-punjab-text-book-pdf/` },
  { grade: 2, code: 'MATH', title: 'Mathematics Class 2 PCTB 2026', url: `${USTAD360}/class-2-maths-snc-punjab-textbook-pdf/` },
  { grade: 2, code: 'ISL', title: 'Islamiat Class 2 PCTB 2026', url: `${USTAD360}/class-2-islamiat-snc-punjab-text-book-pdf/` },
  { grade: 2, code: 'GK', title: 'Waqfiyat e Aama Class 2 PCTB 2026', url: `${USTAD360}/class-2-waqfiyat-e-aama-punjab-textbook-pdf/` },
  { grade: 2, code: 'AKH', title: 'Akhlaqiat Class 2 PCTB 2026', url: `${USTAD360}/class-2-akhlaqiat-snc-punjab-text-book-pdf/` },

  { grade: 3, code: 'ENG', title: 'English Class 3 PCTB 2026', url: `${USTAD360}/class-3-english-pctb-text-book-pdf/` },
  { grade: 3, code: 'URD', title: 'Urdu Class 3 PCTB 2026', url: `${USTAD360}/class-3-urdu-punjab-text-book-pdf/` },
  { grade: 3, code: 'MATH', title: 'Mathematics Class 3 PCTB 2026', url: `${USTAD360}/class-3-maths-snc-punjab-textbook-pdf/` },
  { grade: 3, code: 'SCI', title: 'General Science Class 3 PCTB 2026', url: `${USTAD360}/class-3-general-science-punjab-textbook-pdf/` },
  { grade: 3, code: 'SST', title: 'Social Studies Class 3 PCTB 2026', url: `${USTAD360}/3rd-class-mashrati-uloom-sst-punjab-textbook-pdf/` },
  { grade: 3, code: 'ISL', title: 'Islamiat Class 3 PCTB 2026', url: `${USTAD360}/class-3-islamiat-snc-punjab-text-book-pdf/` },
  { grade: 3, code: 'AKH', title: 'Akhlaqiat Class 3 PCTB 2026', url: `${USTAD360}/class-3-akhlaqiat-snc-punjab-text-book-pdf/` },

  { grade: 4, code: 'ENG', title: 'English Class 4 PCTB 2026', url: `${USTAD360}/4th-class-english-pctb-text-book-snc/` },
  { grade: 4, code: 'URD', title: 'Urdu Class 4 PCTB 2026', url: `${USTAD360}/4th-class-urdu-punjab-text-book-snc-pdf/` },
  { grade: 4, code: 'MATH', title: 'Mathematics Class 4 PCTB 2026', url: `${USTAD360}/class-4-maths-pctb-punjab-text-book-snc/` },
  { grade: 4, code: 'SCI', title: 'General Science Class 4 PCTB 2026', url: `${USTAD360}/4th-class-general-science-punjab-textbook-pdf/` },
  { grade: 4, code: 'SST', title: 'Social Studies Class 4 PCTB 2026', url: `${USTAD360}/4th-class-mashrati-uloom-sst-punjab-textbook-pdf/` },
  { grade: 4, code: 'ISL', title: 'Islamiat Class 4 PCTB 2026', url: `${USTAD360}/class-4-islamiat-snc-punjab-text-book-pdf/` },
  { grade: 4, code: 'AKH', title: 'Akhlaqiat Class 4 PCTB 2026', url: `${USTAD360}/class-4-ethics-akhlaqiat-punjab-text-book-pdf/` },

  { grade: 5, code: 'ENG', title: 'English Class 5 PCTB 2026', url: `${USTAD360}/5th-class-english-pctb-text-book-snc/` },
  { grade: 5, code: 'URD', title: 'Urdu Class 5 PCTB 2026', url: `${USTAD360}/5th-class-urdu-punjab-text-book-snc-pdf/` },
  { grade: 5, code: 'MATH', title: 'Mathematics Class 5 PCTB 2026', url: `${USTAD360}/class-5-maths-pctb-punjab-text-book-snc/` },
  { grade: 5, code: 'SCI', title: 'General Science Class 5 PCTB 2026', url: `${USTAD360}/5th-class-general-science-punjab-textbook-pdf/` },
  { grade: 5, code: 'SST', title: 'Social Studies Class 5 PCTB 2026', url: `${USTAD360}/5th-class-mashrati-uloom-sst-punjab-textbook-pdf/` },
  { grade: 5, code: 'ISL', title: 'Islamiat Class 5 PCTB 2026', url: `${USTAD360}/class-5-islamiat-snc-punjab-text-book-pdf/` },
  { grade: 5, code: 'AKH', title: 'Akhlaqiat Class 5 PCTB 2026', url: `${USTAD360}/class-5-ethics-akhlaqiat-punjab-text-book-pdf/` },

  { grade: 6, code: 'ENG', title: 'English Class 6 PCTB 2026', url: `${USTAD360}/6th-class-english-pctb-text-book-snc/` },
  { grade: 6, code: 'URD', title: 'Urdu Class 6 PCTB 2026', url: `${USTAD360}/6th-class-urdu-punjab-text-book-snc-pdf/` },
  { grade: 6, code: 'MATH', title: 'Mathematics Class 6 PCTB 2026', url: `${USTAD360}/class-6-maths-pctb-punjab-text-book-snc/` },
  { grade: 6, code: 'SCI', title: 'General Science Class 6 PCTB 2026', url: `${USTAD360}/6th-class-general-science-punjab-textbook-pdf/` },
  { grade: 6, code: 'SST', title: 'Social Studies Class 6 PCTB 2026', url: `${USTAD360}/6th-class-mashrati-uloom-sst-punjab-textbook-pdf/` },
  { grade: 6, code: 'ISL', title: 'Islamiat Class 6 PCTB 2026', url: `${USTAD360}/class-6-islamiat-snc-punjab-text-book-pdf/` },
  { grade: 6, code: 'CS', title: 'Computer Science Class 6 PCTB 2026', url: `${USTAD360}/6th-class-computer-snc-punjab-textbook-pdf/` },
  { grade: 6, code: 'AKH', title: 'Akhlaqiat Class 6 PCTB 2026', url: `${USTAD360}/class-6-ethics-akhlaqiat-punjab-text-book-pdf/` },
  { grade: 6, code: 'ARB', title: 'Arabic Class 6 PCTB 2026', url: `${USTAD360}/6th-class-arabic-punjab-text-book-pdf/` },

  { grade: 7, code: 'ENG', title: 'English Class 7 PCTB 2026', url: `${USTAD360}/7th-class-english-textbook-snc-by-punjab-board/` },
  { grade: 7, code: 'URD', title: 'Urdu Class 7 PCTB 2026', url: `${USTAD360}/7th-class-urdu-snc-punjab-textbook-pdf/` },
  { grade: 7, code: 'MATH', title: 'Mathematics Class 7 PCTB 2026', url: `${USTAD360}/class-7-maths-snc-punjab-textbook-pdf/` },
  { grade: 7, code: 'SCI', title: 'General Science Class 7 PCTB 2026', url: `${USTAD360}/7th-class-general-science-punjab-textbook-snc-pdf/` },
  { grade: 7, code: 'SST', title: 'Social Studies Class 7 PCTB 2026', url: `${USTAD360}/7th-class-mashrati-uloom-sst-punjab-textbook-pdf/` },
  { grade: 7, code: 'ISL', title: 'Islamiat Class 7 PCTB 2026', url: `${USTAD360}/7th-class-islamiat-punjab-textbook-snc-pdf/` },
  { grade: 7, code: 'CS', title: 'Computer Science Class 7 PCTB 2026', url: `${USTAD360}/7th-class-computer-snc-punjab-textbook-pdf/` },
  { grade: 7, code: 'AKH', title: 'Akhlaqiat Class 7 PCTB 2026', url: `${USTAD360}/class-7-ethics-akhlaqiat-punjab-text-book-pdf/` },
  { grade: 7, code: 'ARB', title: 'Arabic Class 7 PCTB 2026', url: `${USTAD360}/7th-class-arabic-punjab-text-book-pdf/` },

  { grade: 8, code: 'ENG', title: 'English Class 8 PCTB 2026', url: `${USTAD360}/8th-class-english-textbook-snc-by-punjab-board/` },
  { grade: 8, code: 'URD', title: 'Urdu Class 8 PCTB 2026', url: `${USTAD360}/8th-class-urdu-snc-punjab-textbook-pdf/` },
  { grade: 8, code: 'MATH', title: 'Mathematics Class 8 PCTB 2026', url: `${USTAD360}/class-8-maths-snc-punjab-textbook-pdf/` },
  { grade: 8, code: 'SCI', title: 'General Science Class 8 PCTB 2026', url: `${USTAD360}/8th-class-general-science-punjab-textbook-snc-pdf/` },
  { grade: 8, code: 'ISL', title: 'Islamiat Class 8 PCTB 2026', url: `${USTAD360}/8th-class-islamiat-punjab-textbook-snc-pdf/` },
  { grade: 8, code: 'CS', title: 'Computer Science Class 8 PCTB 2026', url: `${USTAD360}/8th-class-computer-snc-punjab-textbook-pdf/` },
  { grade: 8, code: 'AKH', title: 'Akhlaqiat Class 8 PCTB 2026', url: `${USTAD360}/8th-class-ethics-ikhlaqiat-pctb-textbook-pdf/` },
  { grade: 8, code: 'ARB', title: 'Arabic Class 8 PCTB 2026', url: `${USTAD360}/8th-class-arabic-punjab-text-book-pdf/` },
  { grade: 8, code: 'HIST', title: 'History Class 8 PCTB 2026', url: `${USTAD360}/8th-class-history-textbook-pdf-by-punjab-board/` },
  { grade: 8, code: 'GEO', title: 'Geography Class 8 PCTB 2026', url: `${USTAD360}/8th-class-geography-snc-pctb-textbook-pdf/` },
];

async function seedBooks() {
  try {
    const classes = await Class.findAll();
    const subjects = await Subject.findAll();

    const classByGrade = new Map(classes.map((item) => [item.grade_level, item.id]));
    const subjectByCode = new Map(subjects.map((item) => [subjectCodeByName[item.name], item.id]));

    const rows = [];
    const skipped = [];

    for (const book of books) {
      const classId = classByGrade.get(book.grade);
      const subjectId = subjectByCode.get(book.code);

      if (!classId || !subjectId) {
        skipped.push(book.title);
        continue;
      }

      const existing = await Book.findOne({
        where: {
          class_id: classId,
          subject_id: subjectId,
          title: book.title,
        },
      });

      if (!existing) {
        rows.push({
          class_id: classId,
          subject_id: subjectId,
          title: book.title,
          description: 'Online Punjab Curriculum and Textbook Board textbook link.',
          publisher: 'PCTB Punjab',
          year: 2026,
          medium: 'Both',
          pdf_url: book.url,
          local_file: '',
          source_type: 'external',
          sort_order: 0,
          is_active: true,
        });
      }
    }

    if (rows.length > 0) {
      await Book.bulkCreate(rows);
    }

    console.log(`Online books inserted: ${rows.length}`);
    console.log(`Online books skipped because already present: ${books.length - rows.length - skipped.length}`);
    if (skipped.length > 0) {
      console.log(`Skipped missing class/subject mapping: ${skipped.join(', ')}`);
    }
  } catch (err) {
    console.error('Failed to seed online books:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedBooks();
