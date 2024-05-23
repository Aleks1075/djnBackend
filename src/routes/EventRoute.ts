import express from 'express';
import { param } from 'express-validator';
import EventController from '../controllers/EventController';

const router = express.Router();

router.get(
    "/:eventId",
    param("eventId")
.isString()
.trim()
.notEmpty()
.withMessage("EventId parameter must be a valid string"),
EventController.getEvent
);

// /api/event/search/valby
router.get("/search/:city", 
param("city")
.isString()
.trim()
.notEmpty()
.withMessage("City is required"),
EventController.searchEvent
);

export default router;