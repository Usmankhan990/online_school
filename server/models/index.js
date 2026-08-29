const sequelize = require('../config/database');
const User = require('./User');
const StudentProfile = require('./StudentProfile');
const TeacherProfile = require('./TeacherProfile');
const ParentProfile = require('./ParentProfile');
const Class = require('./Class');
const Subject = require('./Subject');
const ClassSubject = require('./ClassSubject');
const Course = require('./Course');
const CourseMaterial = require('./CourseMaterial');
const Book = require('./Book');
const Enrollment = require('./Enrollment');
const Exam = require('./Exam');
const ExamQuestion = require('./ExamQuestion');
const ExamAttempt = require('./ExamAttempt');
const ExamAnswer = require('./ExamAnswer');
const ClassworkHomework = require('./ClassworkHomework');
const Submission = require('./Submission');
const Attendance = require('./Attendance');
const Fee = require('./Fee');
const Timetable = require('./Timetable');
const LiveClass = require('./LiveClass');
const Notification = require('./Notification');
const Document = require('./Document');
const Module = require('./Module');
const Lesson = require('./Lesson');
const Settings = require('./Settings');

// ============= ASSOCIATIONS =============

// User <-> Profiles
User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'studentProfile' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(TeacherProfile, { foreignKey: 'user_id', as: 'teacherProfile' });
TeacherProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(ParentProfile, { foreignKey: 'user_id', as: 'parentProfile' });
ParentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Parent <-> Student
User.hasMany(StudentProfile, { foreignKey: 'parent_id', as: 'children' });
StudentProfile.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// StudentProfile <-> Class
Class.hasMany(StudentProfile, { foreignKey: 'class_id', as: 'students' });
StudentProfile.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// Class <-> Subject (many-to-many)
Class.belongsToMany(Subject, { through: ClassSubject, foreignKey: 'class_id', as: 'subjects' });
Subject.belongsToMany(Class, { through: ClassSubject, foreignKey: 'subject_id', as: 'classes' });

// Course associations
User.hasMany(Course, { foreignKey: 'teacher_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
Class.hasMany(Course, { foreignKey: 'class_id', as: 'courses' });
Course.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Subject.hasMany(Course, { foreignKey: 'subject_id', as: 'courses' });
Course.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Course Materials
Course.hasMany(CourseMaterial, { foreignKey: 'course_id', as: 'materials' });
CourseMaterial.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Course Modules & Lessons
Course.hasMany(Module, { foreignKey: 'course_id', as: 'modules' });
Module.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Module.hasMany(Lesson, { foreignKey: 'module_id', as: 'lessons' });
Lesson.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

// Books
Class.hasMany(Book, { foreignKey: 'class_id', as: 'books' });
Book.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Subject.hasMany(Book, { foreignKey: 'subject_id', as: 'books' });
Book.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
User.hasMany(Book, { foreignKey: 'uploaded_by', as: 'uploadedBooks' });
Book.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Enrollments
User.hasMany(Enrollment, { foreignKey: 'student_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Exams
Course.hasMany(Exam, { foreignKey: 'course_id', as: 'exams' });
Exam.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
User.hasMany(Exam, { foreignKey: 'teacher_id', as: 'createdExams' });
Exam.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// Exam Questions
Exam.hasMany(ExamQuestion, { foreignKey: 'exam_id', as: 'questions' });
ExamQuestion.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

// Exam Attempts
Exam.hasMany(ExamAttempt, { foreignKey: 'exam_id', as: 'attempts' });
ExamAttempt.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
User.hasMany(ExamAttempt, { foreignKey: 'student_id', as: 'examAttempts' });
ExamAttempt.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Exam Answers
ExamAttempt.hasMany(ExamAnswer, { foreignKey: 'attempt_id', as: 'answers' });
ExamAnswer.belongsTo(ExamAttempt, { foreignKey: 'attempt_id', as: 'attempt' });
ExamQuestion.hasMany(ExamAnswer, { foreignKey: 'question_id', as: 'answers' });
ExamAnswer.belongsTo(ExamQuestion, { foreignKey: 'question_id', as: 'question' });

// Classwork/Homework
Course.hasMany(ClassworkHomework, { foreignKey: 'course_id', as: 'homework' });
ClassworkHomework.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
User.hasMany(ClassworkHomework, { foreignKey: 'teacher_id', as: 'postedHomework' });
ClassworkHomework.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// Submissions
ClassworkHomework.hasMany(Submission, { foreignKey: 'homework_id', as: 'submissions' });
Submission.belongsTo(ClassworkHomework, { foreignKey: 'homework_id', as: 'homework' });
User.hasMany(Submission, { foreignKey: 'student_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Attendance (Polymorphic-ish via user_id and user_role)
User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendanceRecords' });
Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Class.hasMany(Attendance, { foreignKey: 'class_id', as: 'attendanceRecords' });
Attendance.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// Fees
User.hasMany(Fee, { foreignKey: 'student_id', as: 'fees' });
Fee.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Class.hasMany(Fee, { foreignKey: 'class_id', as: 'fees' });
Fee.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// Timetable
Class.hasMany(Timetable, { foreignKey: 'class_id', as: 'timetable' });
Timetable.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Subject.hasMany(Timetable, { foreignKey: 'subject_id', as: 'timetable' });
Timetable.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Live Classes
Course.hasMany(LiveClass, { foreignKey: 'course_id', as: 'liveClasses' });
LiveClass.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
User.hasMany(LiveClass, { foreignKey: 'teacher_id', as: 'liveClasses' });
LiveClass.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Documents
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  StudentProfile,
  TeacherProfile,
  ParentProfile,
  Class,
  Subject,
  ClassSubject,
  Course,
  CourseMaterial,
  Book,
  Enrollment,
  Exam,
  ExamQuestion,
  ExamAttempt,
  ExamAnswer,
  ClassworkHomework,
  Submission,
  Attendance,
  Fee,
  Timetable,
  LiveClass,
  Notification,
  Document,
  Module,
  Lesson,
  Settings,
};
