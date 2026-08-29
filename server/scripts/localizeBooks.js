const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Book, Class, Subject, sequelize } = require('../models');

const uploadDir = path.join(__dirname, '..', 'uploads', 'books');
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36';
const smadentClassSlug = {
  2: '2-class',
  3: '3-class',
  4: '4th-class',
  6: '6th-class',
  7: '7th-class',
};
const smadentSubjectSlug = {
  English: 'english',
  Urdu: 'urdu',
  Mathematics: 'math',
  'General Science': 'general-science',
  'Social Studies': 'social-studies',
  Islamiat: 'islamiyat',
  'Computer Science': 'computer-education',
  'Akhlaqiat (Ethics)': 'ikhlaqiat',
  Arabic: 'arabic',
  'Waqfiyat e Aama / GK': 'general-knowledge',
};

function ensureDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

function cleanFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function absoluteUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return '';
  }
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function findPdfLinks(html, pageUrl) {
  const decoded = decodeHtml(html);
  const links = new Set();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  const pdfRegex = /https?:\/\/[^"'\s<>]+\.pdf(?:\?[^"'\s<>]*)?/gi;
  const driveIdRegex = /(?:\/d\/|id=)([-_a-zA-Z0-9]{20,})/g;

  for (const match of decoded.matchAll(pdfRegex)) {
    links.add(match[0]);
  }

  for (const match of decoded.matchAll(hrefRegex)) {
    const href = decodeHtml(match[1]);
    if (
      href.toLowerCase().includes('.pdf') ||
      href.toLowerCase().includes('download') ||
      href.toLowerCase().includes('drive.google.com') ||
      href.toLowerCase().includes('docs.google.com')
    ) {
      const full = absoluteUrl(href, pageUrl);
      if (full) links.add(full);
    }
  }

  for (const match of decoded.matchAll(driveIdRegex)) {
    links.add(`https://drive.google.com/uc?export=download&id=${match[1]}`);
  }

  return [...links];
}

async function fetchWithBrowserHeaders(url) {
  return fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': userAgent,
      accept: 'text/html,application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://www.ustad360.com/',
    },
  });
}

async function resolvePdfUrl(book) {
  const sourceUrls = [];
  if (book.pdf_url) sourceUrls.push(book.pdf_url);

  const grade = book.class?.grade_level;
  const classSlug = smadentClassSlug[grade];
  const subjectSlug = smadentSubjectSlug[book.subject?.name];
  if (classSlug && subjectSlug) {
    sourceUrls.push(`https://www.smadent.com/${classSlug}/${subjectSlug}-textbook.html`);
  }

  for (const sourceUrl of sourceUrls) {
    const pdfUrl = await resolvePdfUrlFromPage(sourceUrl);
    if (pdfUrl) return pdfUrl;
  }

  return '';
}

async function resolvePdfUrlFromPage(sourceUrl) {
  const first = await fetchWithBrowserHeaders(sourceUrl);
  const contentType = first.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || sourceUrl.toLowerCase().endsWith('.pdf')) {
    return sourceUrl;
  }

  const html = await first.text();
  const candidates = findPdfLinks(html, sourceUrl);

  for (const candidate of candidates) {
    try {
      const probe = await fetchWithBrowserHeaders(candidate);
      const probeType = probe.headers.get('content-type') || '';
      if (probe.ok && (probeType.includes('application/pdf') || candidate.toLowerCase().includes('.pdf'))) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return candidates[0] || '';
}

async function downloadPdf(book, pdfUrl) {
  const response = await fetchWithBrowserHeaders(pdfUrl);
  if (!response.ok) {
    throw new Error(`download failed with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'application/pdf';
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1024) {
    throw new Error('downloaded file is too small');
  }

  const hash = crypto.createHash('sha1').update(`${book.id}:${pdfUrl}`).digest('hex').slice(0, 10);
  const filename = `book-${book.id}-${cleanFileName(book.title)}-${hash}.pdf`;
  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, buffer);

  return {
    localFile: `/uploads/books/${filename}`,
    filename,
    contentType,
    size: buffer.length,
  };
}

async function main() {
  ensureDir();

  const books = await Book.findAll({
    where: {
      is_active: true,
    },
    include: [
      { model: Class, as: 'class' },
      { model: Subject, as: 'subject' },
    ],
    order: [['id', 'ASC']],
  });

  let localized = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    if (book.local_file) {
      skipped++;
      continue;
    }

    if (!book.pdf_url) {
      skipped++;
      continue;
    }

    try {
      console.log(`Resolving ${book.id}: ${book.title}`);
      const pdfUrl = await resolvePdfUrl(book);
      if (!pdfUrl) {
        throw new Error('no PDF link found on source page');
      }

      console.log(`Downloading ${pdfUrl}`);
      const file = await downloadPdf(book, pdfUrl);
      await book.update({
        local_file: file.localFile,
        original_filename: file.filename,
        mime_type: file.contentType.includes('pdf') ? 'application/pdf' : file.contentType,
        file_size: file.size,
        source_type: 'both',
      });

      localized++;
      console.log(`Saved ${file.localFile}`);
    } catch (err) {
      failed++;
      console.error(`Failed ${book.id}: ${book.title} - ${err.message}`);
    }
  }

  console.log(`Done. localized=${localized}, skipped=${skipped}, failed=${failed}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
