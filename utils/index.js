const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('\n=== DEBUG multer destination START ===');
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size
    });
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
    console.log('=== DEBUG multer destination END ===\n');
  },
  filename: function (req, file, cb) {
    console.log('\n=== DEBUG multer filename START ===');
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size
    });
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = uniqueSuffix + '-' + cleanFileName;
    console.log('Generated filename:', fileName);
    cb(null, fileName);
    console.log('=== DEBUG multer filename END ===\n');
  }
});

const fileFilter = (req, file, cb) => {
  console.log('\n=== DEBUG multer fileFilter START ===');
  console.log('Raw file object:', file);
  console.log('File details:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    stream: !!file.stream
  });
  
  // Проверяем MIME тип
  if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
    console.log('File rejected: invalid mimetype');
    return cb(new Error('Only image and video files are allowed!'), false);
  }

  console.log('Image file accepted for field:', file.fieldname);
  console.log('=== DEBUG multer fileFilter END ===\n');
  cb(null, true);
};

const limits = {
  fileSize: 50 * 1024 * 1024, // 50 MB
  fieldSize: 50 * 1024 * 1024, // 50 MB
  fields: 20, // Максимальное количество полей формы
  files: 100, // Максимальное количество файлов
  parts: 120, // Максимальное количество частей (поля + файлы)
  headerPairs: 2000, // Увеличиваем количество заголовков
  preservePath: true // Сохраняем оригинальный путь файла
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
  preservePath: true
});

const wrappedUpload = (req, res, next) => {
  console.log('\n=== DEBUG wrappedUpload START ===');
  console.log('Request headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', {
        name: err.name,
        message: err.message,
        code: err.code,
        field: err.field,
        stack: err.stack
      });
      return res.status(400).json({ 
        error: true, 
        message: `Upload error: ${err.message}`,
        code: err.code,
        field: err.field
      });
    } else if (err) {
      console.error('Unknown error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      return res.status(500).json({ 
        error: true, 
        message: `Unknown error: ${err.message}` 
      });
    }
    
    console.log('Upload successful');
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    console.log('=== DEBUG wrappedUpload END ===\n');
    next();
  });
};

module.exports = {
  upload,
  wrappedUpload
}; 