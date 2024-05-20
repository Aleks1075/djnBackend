import express from 'express';
import multer from 'multer';
import MyEventController from '../controllers/MyEventController';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateMyEventRequest } from '../middleware/validation';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
 });

 router.get("/", jwtCheck, jwtParse, MyEventController.getMyEvent);

 // /api/my/event
 router.post("/", upload.single("imageFile"), validateMyEventRequest, jwtCheck, jwtParse, MyEventController.createMyEvent);

 router.put("/", upload.single("imageFile"), validateMyEventRequest, jwtCheck, jwtParse, MyEventController.updateMyEvent);

export default router;