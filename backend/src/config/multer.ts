import multer from "multer";
import path from "path";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

export const s3Config = new S3Client({
  region: process.env.S3_REGION || "ap-northeast-1",
  endpoint: process.env.S3_ENDPOINT || "https://vyxunfpwynglcmqdalto.storage.supabase.co/storage/v1/s3",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
  },
  forcePathStyle: true
});

const storage = multerS3({
  s3: s3Config,
  bucket: process.env.S3_BUCKET_NAME || "task-attachments",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
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
