import express from "express";
import { uploadImage, getImages } from "../controllers/ImageController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", jwtCheck, jwtParse, upload.single("image"), uploadImage);
router.get("/", jwtCheck, jwtParse, getImages);

export default router;
