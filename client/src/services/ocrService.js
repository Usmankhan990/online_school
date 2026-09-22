import Tesseract from 'tesseract.js';

export const PROVINCE_CITIES = {
  'Punjab': [
    'Abdul Hakeem', 'Ahmadpur Sial', 'Ahmedpur East', 'Alipur', 'Alipur Chatha', 'Arifwala',
    'Athara Hazari', 'Attock', 'Bahawalnagar', 'Bahawalpur', 'Basirpur', 'Bhakkar', 'Bhalwal',
    'Bhawana', 'Bhera', 'Burewala', 'Chakwal', 'Chichawatni', 'Chiniot', 'Chishtian',
    'Choa Saidan Shah', 'Chowk Sarwar Shaheed', 'Chunian', 'Daska', 'Depalpur', 'Dera Ghazi Khan',
    'Dina', 'Dipalpur', 'Domeli', 'Dunga Bunga', 'Dunyapur', 'Eminabad', 'Faisalabad',
    'Faqirwali', 'Fateh Jang', 'Fort Abbas', 'Gaggo Mandi', 'Garh Maharaja', 'Ghakhar Mandi',
    'Gojra', 'Gujranwala', 'Gujrat', 'Hadali', 'Hafizabad', 'Haroonabad', 'Hasan Abdal',
    'Hasilpur', 'Haveli Lakha', 'Hazro', 'Hujra Shah Muqeem', 'Isa Khel', 'Jahanian',
    'Jalalpur Bhattian', 'Jalalpur Jattan', 'Jampur', 'Jand', 'Jaranwala', 'Jatoi',
    'Jauharabad', 'Jhang', 'Jhelum', 'Kabirwala', 'Kahror Pacca', 'Kalabagh', 'Kallar Kahar',
    'Kallar Syedan', 'Kamalia', 'Kamoke', 'Kasur', 'Khanewal', 'Khanpur', 'Kharian',
    'Khewra', 'Khushab', 'Kot Addu', 'Kot Chutta', 'Kot Mithan', 'Kot Momin', 'Kot Radha Kishan',
    'Kot Samaba', 'Kundian', 'Lahore', 'Lalamusa', 'Layyah', 'Liaquatpur', 'Lodhran',
    'Mailsi', 'Malikwal', 'Mandi Bahauddin', 'Mandi Burewala', 'Mankera', 'Mehmood Kot',
    'Mian Channu', 'Mianwali', 'Minchinabad', 'Mitha Tiwana', 'Multan', 'Muridke',
    'Murree', 'Muzaffargarh', 'Nankana Sahib', 'Narowal', 'Naushahra (Soon Valley)',
    'Noorpur Thal', 'Nowshera Virkan', 'Okara', 'Pakpattan', 'Pasrur', 'Pattoki', 'Phalia',
    'Pind Dadan Khan', 'Pindi Bhattian', 'Pindi Gheb', 'Pir Mahal', 'Qila Didar Singh',
    'Quaidabad', 'Rabwah (Chenab Nagar)', 'Rahim Yar Khan', 'Rajanpur', 'Rawalpindi',
    'Renala Khurd', 'Rojhan', 'Sadiqabad', 'Safdarabad', 'Sahiwal', 'Sambrial', 'Samundri',
    'Sangla Hill', 'Sarai Alamgir', 'Sarai Sidhu', 'Sargodha', 'Shahkot', 'Shahpur',
    'Shakargarh', 'Sharqpur', 'Sheikhupura', 'Shorkot', 'Sialkot', 'Sillanwali', 'Sohawa',
    'Sukheke Mandi', 'Talagang', 'Taunsa Sharif', 'Taxila', 'Tibba Sultanpur', 'Toba Tek Singh',
    'Vehari', 'Wah Cantt', 'Warburton', 'Wazirabad', 'Yazman', 'Zafarwal', 'Zahir Pir'
  ].sort(),
  'Sindh': [
    'Badin', 'Bandhi', 'Berani', 'Bhiria City', 'Bhiria Road', 'Bulri Shah Karim', 'Chachro',
    'Chambar', 'Dadu', 'Daharki', 'Daro', 'Daulatpur', 'Digri', 'Diplo', 'Dokri', 'Gambat',
    'Garhi Khairo', 'Garhi Yasin', 'Gharo', 'Ghauspur', 'Ghotki', 'Hala', 'Hyderabad',
    'Islamkot', 'Jacobabad', 'Jam Nawaz Ali', 'Jamshoro', 'Jati', 'Jhol', 'Jhuddo', 'Jungshahi',
    'Kandiaro', 'Karachi', 'Kashmore', 'Kazi Ahmed', 'Keti Bandar', 'Khadro', 'Khairpur',
    'Khairpur Nathan Shah', 'Khanpur Mahar', 'Khipro', 'Kot Diji', 'Kot Ghulam Muhammad',
    'Kotri', 'Kunri', 'Lakhi Ghulam Shah', 'Larkana', 'Matiari', 'Matli', 'Mehar', 'Mehrabpur',
    'Miranpur (Khangarh)', 'Mirpur Bathoro', 'Mirpur Khas', 'Mirpur Mathelo', 'Mirpur Sakro',
    'Mithani', 'Mithi', 'Moro', 'Nagarparkar', 'Nasarpur', 'Nasirabad', 'Naudero',
    'Naushahro Feroze', 'Nawabshah (Shaheed Benazirabad)', 'Pacca Chang', 'Padidan', 'Pano Akil',
    'Pir Jo Goth', 'Pithoro', 'Radhan', 'Rajo Khanani', 'Ranipur', 'Rato Dero', 'Rohri',
    'Rustam', 'Sakrand', 'Samaro', 'Sanghar', 'Sann', 'Sarhari', 'Sehwan Sharif', 'Setharja',
    'Shahdadkot', 'Shahdadpur', 'Shahpur Chakar', 'Shahpur Jahania', 'Shikarpur', 'Sinjhoro',
    'Sita Road (Rehmani Nagar)', 'Sobhodero', 'Sujawal', 'Sukkur', 'Talhar', 'Tando Adam',
    'Tando Allahyar', 'Tando Bago', 'Tando Ghulam Ali', 'Tando Jam', 'Tando Jan Mohammad',
    'Tando Mohammad Khan', 'Tangwani', 'Thari Mirwah', 'Tharushah', 'Thatta', 'Thul',
    'Ubauro', 'Umerkot', 'Warah'
  ].sort(),
  'Khyber Pakhtunkhwa': [
    'Abbottabad', 'Akora Khattak', 'Alpuri (Shangla)', 'Amangarh', 'Baffa', 'Bannu',
    'Batkhela (Malakand)', 'Battagram', 'Birote', 'Chakdara', 'Charsadda', 'Cherat',
    'Chitral', 'Daggar (Buner)', 'Dargai', 'Darra Adam Khel', 'Dera Ismail Khan', 'Doaba',
    'Drosh', 'Gadoon Amazai', 'Ghazi', 'Hangu', 'Haripur', 'Havelian', 'Jamrud (Khyber)',
    'Jehangira', 'Kabir', 'Karak', 'Khal', 'Khanpur (KP)', 'Kohat', 'Kulachi', 'Lakki Marwat',
    'Landi Kotal', 'Mansehra', 'Mardan', 'Mingora (Swat)', 'Miramshah (North Waziristan)',
    'Nawa Killi', 'Nowshera', 'Oghi', 'Pabbi', 'Paharpur', 'Parachinar (Kurram)', 'Peshawar',
    'Risalpur', 'Rustam (Mardan)', 'Saidu Sharif', 'Serai Naurang', 'Shabqadar', 'Swabi',
    'Tangi', 'Tank', 'Thal', 'Timergara', 'Topi', 'Torghar', 'Upper Dir', 'Upper Kohistan',
    'Wana (South Waziristan)', 'Wari'
  ].sort(),
  'Balochistan': [
    'Awaran', 'Barkhan', 'Bela', 'Besima', 'Bhag', 'Buleda', 'Chagai (Dalbandin)',
    'Chaman', 'Dera Allah Yar', 'Dera Bugti', 'Dera Murad Jamali', 'Dhadar', 'Duki',
    'Gadani', 'Gandakha', 'Gwadar', 'Harnai', 'Hoshab', 'Hub', 'Hurd', 'Hurramzai',
    'Jaffarabad', 'Jhal Magsi', 'Jiwani', 'Kalat', 'Kharan', 'Khuzdar', 'Kohlu',
    'Lasbela', 'Lehri', 'Loralai', 'Mach', 'Mand', 'Mastung', 'Moola', 'Musakhel',
    'Muslim Bagh', 'Nal', 'Nasirabad', 'Nok Kundi', 'Nushki', 'Ormara', 'Panjgur',
    'Pasni', 'Pishin', 'Qila Abdullah', 'Qila Saifullah', 'Quetta', 'Saranan', 'Sherani',
    'Sibi', 'Sohbatpur', 'Sonmiani', 'Sui', 'Surab', 'Taftan', 'Turbat (Kech)', 'Usta Muhammad',
    'Uthal', 'Wadh', 'Washuk', 'Zehri', 'Ziarat'
  ].sort(),
  'Islamabad Capital Territory': [
    'Bani Gala', 'Bhara Kahu', 'Chak Shahzad', 'DHA Islamabad / Bahria',
    'Islamabad (Capital)', 'Islamabad Rural', 'Lehtrar Road / Alipur Farash',
    'Nilore', 'Rawat', 'Sihala', 'Tarlai', 'Tarnol'
  ].sort(),
  'Azad Jammu & Kashmir': [
    'Abbaspur', 'Athmuqam (Neelum Valley)', 'Bagh', 'Barnala', 'Bhimber', 'Chakswari',
    'Chikar', 'Dadyal', 'Dhirkot', 'Fatehpur Thakiala (Nakyal)', 'Garhi Dupatta',
    'Hajira', 'Hattian Bala', 'Haveli (Forward Kahuta)', 'Islamgarh', 'Kel', 'Khai Gala',
    'Kotli', 'Leepa Valley', 'Mirpur', 'Muzaffarabad', 'Palandri (Sudhanoti)', 'Rawalakot',
    'Samahni', 'Sehnsa', 'Sharda', 'Taobat', 'Trarkhel'
  ].sort(),
  'Gilgit-Baltistan': [
    'Aliabad', 'Astore (Eidghah)', 'Babusar', 'Bagrote', 'Bunji', 'Chilas (Diamer)',
    'Danyore', 'Darel', 'Gahkuch (Ghizer)', 'Gilgit', 'Gorikot', 'Gulmit', 'Gupis',
    'Hunza (Karimabad)', 'Ishkoman', 'Juglot', 'Khaplu (Ghanche)', 'Kharmang (Tolti)',
    'Nagar', 'Passu', 'Phander', 'Punial', 'Roundu (Dambudas)', 'Shigar', 'Skardu',
    'Sost', 'Tangir', 'Yasin'
  ].sort(),
};

export const ALL_PAKISTAN_CITIES = Array.from(
  new Set(Object.values(PROVINCE_CITIES).flat())
).sort((a, b) => a.localeCompare(b));

export const URDU_TO_ENG_DICTIONARY = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  'موجودہ پتہ': '', 'موجودہ پتہ:': '', 'موجودہ': '', 'مستقل پتہ': '', 'مستقل پتہ:': '', 'مستقل': '',
  'ڈاک خانہ ڈوگرانوالہ وڑائچ': 'P.O Dogranwala Warrich',
  'ڈاک خانہ': 'P.O', 'ڈاکخانہ': 'P.O', 'ڈاک': 'P.O', 'پوسٹ آفس': 'P.O', 'پوسٹ': 'P.O',
  'ڈوگرانوالہ وڑائچ': 'Dogranwala Warrich', 'ڈوگرانوالہ': 'Dogranwala', 'وڑائچ': 'Warrich', 'وڈائچ': 'Warrich', 'ورائچ': 'Warrich',
  'لشکری پور': 'Lashkripur', 'لشکریپور': 'Lashkripur',
  'تحصیل و ضلع': 'Tehsil & District', 'تحصیل وضلع': 'Tehsil & District', 'تحصیل': 'Tehsil', 'ضلع': 'District', 'شہر': 'City',
  'مکان نمبر': 'House #', 'مکان': 'House', 'گلی نمبر': 'Street #', 'گلی': 'Street',
  'محلہ': 'Mohallah', 'چک نمبر': 'Chak #', 'چک': 'Chak',
  'بلاک نمبر': 'Block #', 'بلاک': 'Block',
  'تھرڈ فلور': '3rd Floor', 'سیکنڈ فلور': '2nd Floor', 'فرسٹ فلور': '1st Floor', 'گراؤنڈ فلور': 'Ground Floor', 'فلور': 'Floor',
  'فلیٹ نمبر': 'Flat #', 'فلیٹ': 'Flat', 'پلاٹ نمبر': 'Plot #', 'پلاٹ': 'Plot',
  'سیکٹر': 'Sector', 'روڈ': 'Road', 'مارکیٹ': 'Market',
  'ٹاؤن': 'Town', 'کالونی': 'Colony', 'اسکیم': 'Scheme', 'اسٹریٹ': 'Street',
  'ہاوس': 'House', 'ولیج': 'Village', 'گاؤں': 'Village', 'موضع': 'Mauza',
  'وارڈ': 'Ward', 'یونین کونسل': 'Union Council', 'نزد': 'Near', 'قریب': 'Near', 'سامنے': 'Opposite',
  'جی-': 'G-', 'جی': 'G', 'ای-': 'E-', 'ای': 'E', 'بی-': 'B-', 'بی': 'B',
  'سی-': 'C-', 'سی': 'C', 'ڈی-': 'D-', 'ڈی': 'D', 'اے-': 'A-', 'اے': 'A',
  'ایف-': 'F-', 'ایف': 'F', 'ایچ-': 'H-', 'ایچ': 'H', 'آئی-': 'I-', 'آئی': 'I',
  'پنجاب': 'Punjab', 'سندھ': 'Sindh',
  'خیبر پختونخوا': 'KPK', 'خیبرپختونخوا': 'KPK', 'بلوچستان': 'Balochistan',
  'اسلام آباد': 'Islamabad', 'آزاد کشمیر': 'Azad Kashmir', 'گلگت بلتستان': 'Gilgit Baltistan',
  'لاہور': 'Lahore', 'کراچی': 'Karachi', 'راولپنڈی': 'Rawalpindi', 'فیصل آباد': 'Faisalabad',
  'ملتان': 'Multan', 'گوجرانوالہ': 'Gujranwala', 'سیالکوٹ': 'Sialkot', 'بہاولپور': 'Bahawalpur',
  'سرگودھا': 'Sargodha', 'گجرات': 'Gujrat', 'پشاور': 'Peshawar', 'کوئٹہ': 'Quetta',
  'مردان': 'Mardan', 'ایبٹ آباد': 'Abbottabad', 'سوات': 'Swat', 'سکھر': 'Sukkur',
  'حیدرآباد': 'Hyderabad', 'نواب شاہ': 'Nawabshah', 'لاڑکانہ': 'Larkana', 'میرپور': 'Mirpur',
  'مظفرآباد': 'Muzaffarabad', 'جہلم': 'Jhelum', 'چکوال': 'Chakwal', 'رحیم یار خان': 'Rahim Yar Khan',
  'قصور': 'Kasur', 'اوکاڑہ': 'Okara', 'ساہیوال': 'Sahiwal', 'جھنگ': 'Jhang',
  'ڈیرہ غازی خان': 'Dera Ghazi Khan', 'ڈیرہ اسماعیل خان': 'Dera Ismail Khan', 'خانیوال': 'Khanewal',
  'مظفر گڑھ': 'Muzaffargarh', 'وہاڑی': 'Vehari', 'بہاولنگر': 'Bahawalnagar', 'چنیوٹ': 'Chiniot',
  'حافظ آباد': 'Hafizabad', 'منڈی بہاؤالدین': 'Mandi Bahauddin', 'اٹک': 'Attock', 'میانوالی': 'Mianwali',
  'بھکر': 'Bhakkar', 'لیہ': 'Layyah', 'لودھراں': 'Lodhran', 'راجن پور': 'Rajanpur',
  'پاکپتن': 'Pakpattan', 'تونسہ': 'Taunsa', 'ٹوبہ ٹیک سنگھ': 'Toba Tek Singh', 'خوشاب': 'Khushab',
  'نارووال': 'Narowal', 'وزیر آباد': 'Wazirabad', 'مری': 'Murree', 'ٹیکسلا': 'Taxila',
  'صادق آباد': 'Sadiqabad', 'بورے والا': 'Burewala', 'کامونکی': 'Kamoke', 'دسکا': 'Daska',
  'گوجرہ': 'Gojra', 'حاصل پور': 'Hasilpur', 'چشتیاں': 'Chishtian', 'ہارون آباد': 'Haroonabad',
  'میلسی': 'Mailsi', 'کبیر والا': 'Kabirwala', 'خان پور': 'Khanpur', 'کوٹ ادو': 'Kot Addu',
  'گمشدہ کارڈ ملنے پر قریبی لیٹر بکس میں ڈال دیں': '', 'لیٹر بکس': '', 'گمشدہ': ''
};

export const URDU_CHAR_MAP = {
  'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ڈ': 'd', 'ذ': 'z',
  'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n', 'و': 'o',
  'ہ': 'h', 'ھ': 'h', 'ء': '', 'ی': 'i', 'ے': 'e'
};

export function translateUrduToEnglish(text) {
  if (!text) return '';
  let str = text;

  // Replace known multi-word & word Urdu phrases (longest match first)
  const sortedEntries = Object.entries(URDU_TO_ENG_DICTIONARY).sort((a, b) => b[0].length - a[0].length);
  for (const [urdu, eng] of sortedEntries) {
    if (eng) {
      str = str.split(urdu).join(' ' + eng + ' ');
    } else {
      str = str.split(urdu).join(' ');
    }
  }

  // Transliterate remaining Urdu characters
  let transliterated = '';
  for (const ch of str) {
    if (URDU_CHAR_MAP[ch] !== undefined) {
      transliterated += URDU_CHAR_MAP[ch];
    } else {
      transliterated += ch;
    }
  }

  return transliterated;
}

export function sanitizeAddress(addr) {
  if (!addr) return '';

  // 1. Remove CNIC numbers and numeric barcodes/IDs (e.g. 35200-1462505-9, 50006282949)
  let cleaned = addr
    .replace(/\b\d{5}[-\s]?\d{5,7}[-\s]?\d{1}?\b/g, ' ')
    .replace(/\b\d{7,}\b/g, ' ')
    .replace(/\b\d{2,3}[-\s]\d{2,3}[-\s]\d{4,}\b/g, ' ');

  // 2. Remove standard NADRA boilerplates
  cleaned = cleaned
    .replace(/Registrar\s*General(?:\s*of\s*Pakistan)?/gi, ' ')
    .replace(/National\s*Identity\s*Card/gi, ' ')
    .replace(/Government\s*of\s*Pakistan/gi, ' ')
    .replace(/Present\s*Address|Current\s*Address|Permanent\s*Address/gi, ' ')
    .replace(/موجودہ\s*پتہ|مستقل\s*پتہ|دستخط|رجسٹرار|گمشدہ\s*کارڈ/gi, ' ');

  // 3. Token-level noise & gibberish filter
  const tokens = cleaned.split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0) return '';

  const validKeywords = /^(p\.?o\.?|post|office|house|flat|floor|block|sector|street|st|rd|road|phase|lane|mohallah|chak|village|mauza|tehsil|district|distt|city|near|opp|islamabad|punjab|sindh|kpk|balochistan|lahore|karachi|rawalpindi|gujranwala|faisalabad|multan|peshawar|quetta|sialkot|gujrat|sargodha|mardan|hyderabad|sukkur|abbottabad|jhelum|chakwal|attock|okara|kasur|sahiwal|sheikhupura|taxila|murree|bahawalpur|rahim|yar|khan|warrich|dogranwala|lashkripur|\d+[a-z]?|[a-z]-\d+|\d+\/\d+|[0-9]+)$/i;

  const cleanTokens = [];
  let garbageCount = 0;
  let validCount = 0;

  for (const tok of tokens) {
    if (/[\u0600-\u06FF]/.test(tok)) {
      cleanTokens.push(tok);
      validCount++;
    } else if (validKeywords.test(tok) || tok.length >= 4) {
      cleanTokens.push(tok);
      validCount++;
    } else if (/^[a-zA-Z]{1,2}$/.test(tok)) {
      if (/^[A-Z]$/i.test(tok) && cleanTokens.length > 0 && /Block|Sector|Flat|Floor|House|Plot|Unit|Phase|P\.O/i.test(cleanTokens[cleanTokens.length - 1])) {
        cleanTokens.push(tok);
        validCount++;
      } else {
        garbageCount++;
      }
    } else {
      cleanTokens.push(tok);
    }
  }

  // Reject if too noisy or no valid content
  if (validCount < 2 && garbageCount > 1) {
    return '';
  }

  return cleanTokens.join(' ')
    .replace(/[^\w\s#,./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .trim()
    .replace(/(^|[,\s#])([a-z])/g, (m, p, c) => p + c.toUpperCase());
}

export function preprocessImageForOcr(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxDim = 1800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Contrast optimization for OCR
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const contrast = gray > 135 ? 255 : (gray < 85 ? 0 : (gray - 85) * (255 / 50));
            data[i] = contrast;
            data[i + 1] = contrast;
            data[i + 2] = contrast;
          }
          ctx.putImageData(imgData, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, 'image/png');
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export const getProvinceForCity = (cityName) => {
  if (!cityName) return null;
  const clean = cityName.trim().toLowerCase();
  for (const [prov, cities] of Object.entries(PROVINCE_CITIES)) {
    if (cities.some(c => c.toLowerCase() === clean)) return prov;
  }
  return null;
};

export const detectCityAndProvince = (text) => {
  if (!text) return { city: '', province: '' };
  for (const [prov, cities] of Object.entries(PROVINCE_CITIES)) {
    for (const city of cities) {
      const cityRegex = new RegExp(`\\b${city.replace(/[()]/g, '')}\\b`, 'i');
      if (cityRegex.test(text)) {
        return { city, province: prov };
      }
    }
  }
  return { city: '', province: '' };
};

export function parseCnicText(rawText, docType = 'general') {
  if (!rawText) return {};
  const clean = rawText.replace(/\r\n/g, '\n');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {};

  // 1. Extract CNIC Number (13 digits or 5-7-1 pattern)
  const cnicMatch = clean.match(/\b(\d{5})[-\s]?(\d{7})[-\s]?(\d{1})\b/);
  if (cnicMatch) {
    result.cnic = `${cnicMatch[1]}-${cnicMatch[2]}-${cnicMatch[3]}`;
  }

  // 2. Extract Date of Birth
  const dobKeywords = /(?:date\s*of\s*birth|dob|birth\s*date|birth|تاریخ\s*پیدائش)[\s:]*([0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{4})/i;
  const dobMatch = clean.match(dobKeywords);
  if (dobMatch) {
    const parts = dobMatch[1].split(/[./-]/);
    if (parts.length === 3) {
      let [d, m, y] = parts;
      if (d.length === 4) { [y, m, d] = [d, m, parts[2]]; }
      result.date_of_birth = `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  } else {
    const anyDate = clean.match(/\b([0-3]?[0-9])[./-]([0-1]?[0-9])[./-]((?:19|20)\d{2})\b/);
    if (anyDate) {
      const [, d, m, y] = anyDate;
      result.date_of_birth = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // 3. Extract Gender
  if (/\b(?:gender|sex)[\s:]*M\b|\bMale\b|\bمرد\b/i.test(clean)) {
    result.gender = 'Male';
  } else if (/\b(?:gender|sex)[\s:]*F\b|\bFemale\b|\bعورت\b/i.test(clean)) {
    result.gender = 'Female';
  }

  // 4. MRZ Machine Readable Zone parsing (for Smart CNICs)
  for (const line of lines) {
    if (line.includes('<<') && /^[A-Z0-9<]{15,}$/i.test(line.replace(/\s/g, ''))) {
      const parts = line.replace(/\s/g, '').split('<<');
      if (parts.length >= 2) {
        const surname = parts[0].replace(/</g, ' ').trim();
        const firstName = parts[1].replace(/</g, ' ').trim();
        const combined = `${firstName} ${surname}`.trim();
        if (combined.length > 2 && !/PAK|IDPAK/i.test(combined)) {
          const formatted = combined.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p, c) => p + c.toUpperCase());
          result.full_name = formatted;
        }
      }
    }
  }

  // 5. Extract Primary Cardholder Name (under "Name" / "نام" header)
  const nameBlockMatch = clean.match(/(?:^|\n)\s*(?:Name|Student\s*Name|نام)\s*[:/]?\s*([^\n]+(?:\n[^\n]+){0,2}?)(?=\n\s*(?:Father|Husband|Mother|Gender|Country|Date|Identity|والد|شوہر|والدہ|جنس)|$)/i);
  if (nameBlockMatch) {
    const rawBlock = nameBlockMatch[1];
    // Find English words in the name block first (e.g. "Muhammad Imran")
    const engMatches = rawBlock.match(/[A-Za-z]{2,}(?:\s+[A-Za-z]{2,})*/g);
    if (engMatches) {
      const validName = engMatches
        .filter(n => !/^(Name|Pakistan|Card|National|Identity|Government|Islamic|Republic|Father|Mother)$/i.test(n.trim()))
        .join(' ')
        .trim();
      if (validName.length >= 2) {
        result.full_name = validName.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p, c) => p + c.toUpperCase());
      }
    }
    // Fallback: If no English text found, check Urdu name and translate
    if (!result.full_name) {
      const urduMatches = rawBlock.match(/[\u0600-\u06FF\s]+/g);
      if (urduMatches) {
        const urduText = urduMatches.join(' ').replace(/نام|والد|شناختی/g, '').trim();
        const translated = translateUrduToEnglish(urduText).replace(/[^a-zA-Z\s]/g, '').trim();
        if (translated.length >= 2 && !/^(Name|Pakistan|Card|National)$/i.test(translated)) {
          result.full_name = translated.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p, c) => p + c.toUpperCase());
        }
      }
    }
  }

  // 6. Line-by-line fallback for Father Name, Mother Name, and Cardholder Name
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Father / Guardian Name
    if (/father(?:'s)?\s*name|والد\s*کا\s*نام|ولدیت|husband\s*name|شوہر\s*کا\s*نام/i.test(line)) {
      let val = line.replace(/.*(?:father(?:'s)?\s*name|والد\s*کا\s*نام|ولدیت|husband\s*name|شوہر\s*کا\s*نام)[\s:]*/i, '').trim();
      if (!val && lines[i + 1] && !/name|gender|identity|country|dob|date|address|تاریخ|جنس|شناختی/i.test(lines[i + 1])) {
        val = lines[i + 1];
      }
      val = translateUrduToEnglish(val).replace(/[^a-zA-Z\s]/g, '').trim();
      if (val.length > 2 && !/^(Father|Name|Pakistan|Card|National|Islamic|Republic)$/i.test(val)) {
        result.father_name = val.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p, c) => p + c.toUpperCase());
      }
    }

    // Mother Name
    if (/mother(?:'s)?\s*name|والدہ\s*کا\s*نام/i.test(line)) {
      let val = line.replace(/.*(?:mother(?:'s)?\s*name|والدہ\s*کا\s*نام)[\s:]*/i, '').trim();
      if (!val && lines[i + 1] && !/name|gender|identity|country|dob|date|address|تاریخ|جنس|شناختی/i.test(lines[i + 1])) {
        val = lines[i + 1];
      }
      val = translateUrduToEnglish(val).replace(/[^a-zA-Z\s]/g, '').trim();
      if (val.length > 2 && !/^(Mother|Name|Pakistan|Card|National)$/i.test(val)) {
        result.mother_name = val.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p, c) => p + c.toUpperCase());
      }
    }

    // Cardholder / Full Name fallback
    if (!result.full_name && /^(?:name|student\s*name|نام)\s*[:/]?\s*/i.test(line) && !/father|mother|husband|والد|والدہ|شوہر/i.test(line)) {
      let val = line.replace(/^(?:name|student\s*name|نام)\s*[:/]?\s*/i, '').trim();
      if (!val && lines[i + 1] && !/father|mother|gender|identity|country|dob|date|address|والد|والدہ|جنس|تاریخ/i.test(lines[i + 1])) {
        val = lines[i + 1];
      }
      val = translateUrduToEnglish(val).replace(/[^a-zA-Z\s]/g, '').trim();
      if (val.length > 2 && !/^(Name|Pakistan|Card|National|Identity|Government|Islamic|Republic)$/i.test(val)) {
        result.full_name = val.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p, c) => p + c.toUpperCase());
      }
    }
  }

  // 6. Extract Address & City from CNIC Back or document
  let presentRaw = '';
  let permRaw = '';

  const presentAddrMatch = clean.match(/(?:present\s*address|current\s*address|address|موجودہ\s*پتہ|موجودہ)[\s:]*([^\n\r]+(?:\n[^\n\r]+)?)/i);
  if (presentAddrMatch) {
    presentRaw = presentAddrMatch[1].replace(/(?:permanent\s*address|مستقل\s*پتہ|مستقل).*/i, '').trim();
  }

  const permAddrMatch = clean.match(/(?:permanent\s*address|مستقل\s*پتہ|مستقل)[\s:]*([^\n\r]+(?:\n[^\n\r]+)?)/i);
  if (permAddrMatch) {
    permRaw = permAddrMatch[1].trim();
  }

  // Fallback for CNIC Back: If regex did not catch cleanly, collect address lines
  if (docType.includes('Back') && !presentRaw) {
    const validLines = lines.filter(l => {
      const t = l.trim();
      if (/^\d{5}[-\s]?\d{5,7}[-\s]?\d{1}?$/.test(t)) return false;
      if (/^(National|Identity|Card|Pakistan|Government|NADRA|Director|General|Signature|Registrar)$/i.test(t)) return false;
      if (/^(دستخط|رجسٹرار|تاریخ\s*اجراء|تاریخ\s*تنسیخ|Date of Issue|Date of Expiry|گمشدہ)/i.test(t)) return false;
      return t.length > 2;
    });

    if (validLines.length > 0) {
      let currentArr = [];
      let permArr = [];
      let isPerm = false;

      for (const line of validLines) {
        if (/مستقل|permanent/i.test(line)) {
          isPerm = true;
          const cleaned = line.replace(/.*(?:مستقل\s*پتہ|permanent\s*address|مستقل|permanent)[\s:]*/i, '').trim();
          if (cleaned) permArr.push(cleaned);
        } else if (isPerm) {
          permArr.push(line);
        } else {
          const cleaned = line.replace(/.*(?:موجودہ\s*پتہ|present\s*address|current\s*address|address|موجودہ)[\s:]*/i, '').trim();
          if (cleaned) currentArr.push(cleaned);
          else currentArr.push(line);
        }
      }

      presentRaw = currentArr.join(', ').trim();
      if (permArr.length > 0) {
        permRaw = permArr.join(', ').trim();
      }
    }
  }

  if (presentRaw) {
    const translated = translateUrduToEnglish(presentRaw);
    const sanitized = sanitizeAddress(translated);
    if (sanitized) result.current_address = sanitized;

    const det = detectCityAndProvince(sanitized + ' ' + translated + ' ' + presentRaw);
    if (det.city) {
      result.current_city = det.city;
      result.current_province = det.province;
    }
  }

  if (permRaw) {
    const translated = translateUrduToEnglish(permRaw);
    const sanitized = sanitizeAddress(translated);
    if (sanitized) result.permanent_address = sanitized;

    const det = detectCityAndProvince(sanitized + ' ' + translated + ' ' + permRaw);
    if (det.city) {
      result.permanent_city = det.city;
      result.permanent_province = det.province;
    }
  }

  // Fallback global city detection if not already detected
  if (!result.current_city || !result.permanent_city) {
    const fullTextToSearch = clean + ' ' + (result.current_address || '') + ' ' + (result.permanent_address || '');
    const globalDet = detectCityAndProvince(fullTextToSearch);
    if (globalDet.city) {
      if (!result.current_city) {
        result.current_city = globalDet.city;
        result.current_province = globalDet.province;
      }
      if (!result.permanent_city) {
        result.permanent_city = globalDet.city;
        result.permanent_province = globalDet.province;
      }
    }
  }

  return result;
}

export async function scanCnicDocument(file, docType = 'general', onProgress = () => {}) {
  if (!file || !file.type.startsWith('image/')) {
    return {};
  }

  const optimizedImage = await preprocessImageForOcr(file);
  let text = '';

  try {
    const res = await Tesseract.recognize(optimizedImage, 'urd+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });
    text = res.data.text;
  } catch {
    const resEng = await Tesseract.recognize(optimizedImage, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });
    text = resEng.data.text;
  }

  return parseCnicText(text, docType);
}

export default {
  scanCnicDocument,
  parseCnicText,
  preprocessImageForOcr,
  PROVINCE_CITIES,
  ALL_PAKISTAN_CITIES,
  getProvinceForCity,
  detectCityAndProvince,
  translateUrduToEnglish,
  sanitizeAddress,
};
