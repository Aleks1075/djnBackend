import express from 'express';
import { param } from 'express-validator';
import EventController from '../controllers/EventController';

const router = express.Router();

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