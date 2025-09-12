import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensures the 'uploads' directory exists at the root of the /server project.
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Multer middleware configured for single image uploads under the field name 'picture'.
 */
export const upload = multer({ storage: storage });