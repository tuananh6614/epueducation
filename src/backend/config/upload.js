
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../../public/uploads');
const resourcesDir = path.join(__dirname, '../../../public/resources');

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Profile pictures storage
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// Resource file storage
const resourceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resourcesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resource-' + uniqueSuffix + ext);
  }
});

// Profile upload
const profileUpload = multer({ 
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)'));
    }
  }
});

// Resource upload
const resourceUpload = multer({
  storage: resourceStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các định dạng: PDF, Word, Excel, PowerPoint, ZIP, RAR'));
    }
  }
});

// Get file type from extension
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.pdf') return 'PDF';
  if (ext === '.doc' || ext === '.docx') return 'Word';
  if (ext === '.xls' || ext === '.xlsx') return 'Excel';
  if (ext === '.ppt' || ext === '.pptx') return 'PPT';
  if (ext === '.zip' || ext === '.rar') return 'Archive';
  
  return 'Other';
};

module.exports = { 
  profileUpload, 
  resourceUpload, 
  uploadDir, 
  resourcesDir,
  getFileType
};
