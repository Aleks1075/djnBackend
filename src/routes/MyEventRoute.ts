import express from "express";
import multer from "multer";
import MyEventController from "../controllers/MyEventController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyEventRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.get(
  "/registration",
  jwtCheck,
  jwtParse,
  MyEventController.getMyEventRegistrations
);

router.patch(
  "/registration/:registrationId/status",
  jwtCheck,
  jwtParse,
  MyEventController.updateRegistrationStatus
);

// get events created by the user
router.get("/", jwtCheck, jwtParse, MyEventController.getMyEvents);

router.get("/:eventId", jwtCheck, jwtParse, MyEventController.getMyEvent);

router.delete("/:eventId", jwtCheck, jwtParse, MyEventController.deleteMyEvent);

// /api/my/event
router.post(
  "/",
  upload.single("imageFile"),
  validateMyEventRequest,
  jwtCheck,
  jwtParse,
  MyEventController.createMyEvent
);

router.put(
  "/:eventId",
  upload.single("imageFile"),
  validateMyEventRequest,
  jwtCheck,
  jwtParse,
  MyEventController.updateMyEvent
);

export default router;
