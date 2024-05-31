import { Request, Response } from "express";
import Image from "../models/image";
import { v2 as cloudinary } from "cloudinary";

const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "gallery" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        if (!result || !result.secure_url) {
          console.error(
            "Cloudinary upload result is missing secure_url:",
            result
          );
          return reject(new Error("Failed to upload image to Cloudinary"));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const file = req.file;

    if (!file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = await uploadToCloudinary(file);
    const newImage = new Image({
      user: req.userId,
      name,
      imageUrl,
      description: description || null,
    });

    await newImage.save();

    res.status(201).json(newImage);
  } catch (error) {
    console.error("Failed to upload image:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const images = await Image.find().populate("user", "email");
    res.json(images);
  } catch (error) {
    console.error("Failed to fetch images:", error);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};
