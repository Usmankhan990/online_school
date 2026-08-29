const { Book, Class, Subject, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ── Multer config for book PDFs ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'books');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `book-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.PDF', '.doc', '.docx', '.DOC', '.DOCX'];
    const ext = path.extname(file.originalname);
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and DOC/DOCX files are allowed'));
  },
});

// Export multer middleware
exports.upload = upload;

// Helper: safely delete a local file
function deleteLocalFile(filePath) {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (e) { console.error('File delete error:', e); }
  }
}

// Helper: compute source type
function getSourceType(localFile, externalUrl) {
  const hasLocal = localFile && localFile.trim() !== '';
  const hasExternal = externalUrl && externalUrl.trim() !== '';
  if (hasLocal && hasExternal) return 'both';
  if (hasLocal) return 'local';
  return 'external';
}

// ══════════════════════════════════════
// CRUD Operations
// ══════════════════════════════════════

// Get all books with filters
exports.getAll = async (req, res) => {
  try {
    const { class_id, subject_id, search, status, source_type: srcType, page, limit: lim } = req.query;
    const where = {};

    if (class_id) where.class_id = class_id;
    if (subject_id) where.subject_id = subject_id;
    if (status === 'active') where.is_active = true;
    if (status === 'inactive') where.is_active = false;

    if (srcType === 'local') where.local_file = { [Op.ne]: null, [Op.ne]: '' };
    else if (srcType === 'external') {
      where.local_file = { [Op.or]: [null, ''] };
      where.pdf_url = { [Op.ne]: null, [Op.ne]: '' };
    }

    const books = await Book.findAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'uploader', attributes: ['id', 'full_name'] },
      ],
      order: [['class_id', 'ASC'], ['sort_order', 'ASC'], ['title', 'ASC']],
    });

    let result = books;
    if (search) {
      const s = search.toLowerCase();
      result = books.filter(b =>
        b.title?.toLowerCase().includes(s) ||
        b.title_urdu?.includes(s) ||
        b.subject?.name?.toLowerCase().includes(s) ||
        b.class?.display_name?.toLowerCase().includes(s)
      );
    }

    res.json({ books: result, total: result.length });
  } catch (err) {
    console.error('Get books error:', err);
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
};

// Get single book
exports.getById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'uploader', attributes: ['id', 'full_name'] },
      ],
    });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    res.json({ book });
  } catch (err) {
    console.error('Get book error:', err);
    res.status(500).json({ error: 'Failed to fetch book.' });
  }
};

// Create book (with optional file upload)
exports.create = async (req, res) => {
  try {
    const { class_id, subject_id, title, title_urdu, description, pdf_url, cover_image, publisher, year, medium } = req.body;

    if (!class_id || !subject_id || !title) {
      return res.status(400).json({ error: 'Class, subject, and title are required.' });
    }

    let localFile = '';
    let originalFilename = '';
    let mimeType = '';
    let fileSize = 0;

    if (req.file) {
      localFile = `/uploads/books/${req.file.filename}`;
      originalFilename = req.file.originalname;
      mimeType = req.file.mimetype;
      fileSize = req.file.size;
    }

    const sourceType = getSourceType(localFile, pdf_url);

    const book = await Book.create({
      class_id: parseInt(class_id),
      subject_id: parseInt(subject_id),
      title,
      title_urdu: title_urdu || '',
      description: description || '',
      pdf_url: pdf_url || '',
      local_file: localFile,
      original_filename: originalFilename,
      mime_type: mimeType || 'application/pdf',
      file_size: fileSize,
      cover_image: cover_image || '',
      publisher: publisher || 'PCTB Punjab',
      year: year ? parseInt(year) : 2026,
      medium: medium || 'Both',
      source_type: sourceType,
      uploaded_by: req.user?.id || null,
    });

    const populated = await Book.findByPk(book.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
      ],
    });

    res.status(201).json({ message: 'Book added successfully!', book: populated });
  } catch (err) {
    console.error('Create book error:', err);
    res.status(500).json({ error: 'Failed to create book.' });
  }
};

// Update book (with optional file replace)
exports.update = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });

    const { title, title_urdu, description, pdf_url, cover_image, publisher, year, medium,
            class_id, subject_id, is_active, sort_order } = req.body;

    let localFile = book.local_file;
    let originalFilename = book.original_filename;
    let mimeType = book.mime_type;
    let fileSize = book.file_size;

    // If new file uploaded, replace old one
    if (req.file) {
      // Delete old file safely
      deleteLocalFile(book.local_file);

      localFile = `/uploads/books/${req.file.filename}`;
      originalFilename = req.file.originalname;
      mimeType = req.file.mimetype;
      fileSize = req.file.size;
    }

    const pdfUrl = pdf_url !== undefined ? pdf_url : book.pdf_url;
    const sourceType = getSourceType(localFile, pdfUrl);

    await book.update({
      title: title !== undefined ? title : book.title,
      title_urdu: title_urdu !== undefined ? title_urdu : book.title_urdu,
      description: description !== undefined ? description : book.description,
      pdf_url: pdfUrl,
      local_file: localFile,
      original_filename: originalFilename,
      mime_type: mimeType,
      file_size: fileSize,
      cover_image: cover_image !== undefined ? cover_image : book.cover_image,
      publisher: publisher !== undefined ? publisher : book.publisher,
      year: year !== undefined ? parseInt(year) : book.year,
      medium: medium !== undefined ? medium : book.medium,
      source_type: sourceType,
      class_id: class_id !== undefined ? parseInt(class_id) : book.class_id,
      subject_id: subject_id !== undefined ? parseInt(subject_id) : book.subject_id,
      is_active: is_active !== undefined ? is_active : book.is_active,
      sort_order: sort_order !== undefined ? sort_order : book.sort_order,
    });

    const populated = await Book.findByPk(book.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'uploader', attributes: ['id', 'full_name'] },
      ],
    });

    res.json({ message: 'Book updated!', book: populated });
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ error: 'Failed to update book.' });
  }
};

// Delete book + cleanup file
exports.remove = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });

    // Delete local file
    deleteLocalFile(book.local_file);

    await book.destroy();
    res.json({ message: 'Book deleted successfully.' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: 'Failed to delete book.' });
  }
};

// Upload / Replace PDF for existing book
exports.uploadPdf = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    if (!req.file) return res.status(400).json({ error: 'No file provided.' });

    // Delete old file
    deleteLocalFile(book.local_file);

    const localPath = `/uploads/books/${req.file.filename}`;
    const sourceType = getSourceType(localPath, book.pdf_url);

    await book.update({
      local_file: localPath,
      original_filename: req.file.originalname,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      source_type: sourceType,
      uploaded_by: req.user?.id || book.uploaded_by,
    });

    res.json({ message: 'PDF uploaded successfully!', book, local_file: localPath });
  } catch (err) {
    console.error('Upload PDF error:', err);
    res.status(500).json({ error: 'Failed to upload PDF.' });
  }
};

// Bulk upload books (JSON array with optional class/subject default)
exports.bulkCreate = async (req, res) => {
  try {
    const { books, default_class_id, default_subject_id } = req.body;
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of books.' });
    }

    const validated = books.map(b => ({
      class_id: b.class_id || default_class_id,
      subject_id: b.subject_id || default_subject_id,
      title: b.title,
      title_urdu: b.title_urdu || '',
      pdf_url: b.pdf_url || '',
      local_file: b.local_file || '',
      cover_image: b.cover_image || '',
      publisher: b.publisher || 'PCTB Punjab',
      year: b.year || 2026,
      description: b.description || '',
      source_type: getSourceType(b.local_file, b.pdf_url),
      uploaded_by: req.user?.id || null,
      is_active: true,
    }));

    const created = await Book.bulkCreate(validated);
    res.status(201).json({ message: `${created.length} books added!`, count: created.length });
  } catch (err) {
    console.error('Bulk create error:', err);
    res.status(500).json({ error: 'Failed to bulk add books.' });
  }
};

// Library endpoint: student-facing books with filters
exports.getLibraryBooks = async (req, res) => {
  try {
    const { class_id, subject_id, search } = req.query;
    const where = { is_active: true };

    if (class_id) where.class_id = class_id;
    if (subject_id) where.subject_id = subject_id;

    const books = await Book.findAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
      ],
      order: [['class_id', 'ASC'], ['subject_id', 'ASC'], ['sort_order', 'ASC'], ['title', 'ASC']],
    });

    let result = books;
    if (search) {
      const s = search.toLowerCase();
      result = books.filter(b =>
        b.title?.toLowerCase().includes(s) ||
        b.title_urdu?.includes(s) ||
        b.subject?.name?.toLowerCase().includes(s)
      );
    }

    res.json({ books: result });
  } catch (err) {
    console.error('Library books error:', err);
    res.status(500).json({ error: 'Failed to fetch library books.' });
  }
};
