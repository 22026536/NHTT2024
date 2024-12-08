// import { v2 as cloudinary } from "cloudinary";
import cloudinaryModule from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";

const cloudinary = cloudinaryModule.v2;
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
  });
  return res;
}

const storage = new multer.memoryStorage();
export const upload = multer({
  storage,
});
