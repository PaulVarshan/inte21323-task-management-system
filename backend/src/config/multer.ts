import multer from "multer";
import path from "path";
import fs from "fs";

// Storage directory
const uploadDir = path.join(process.cwd(), "uploads");

// Create directory if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp + random + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedExtensions = /pdf|docx|png|jpg|jpeg/i;
  const ext = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  const allowedMimetypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];
  
  const mime = allowedMimetypes.includes(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error("Only .pdf, .docx, .png, .jpg, and .jpeg files are allowed!"));
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});
