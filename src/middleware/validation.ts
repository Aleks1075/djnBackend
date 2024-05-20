import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateMyUserRequest = [
    body("name").isString().notEmpty().withMessage("Name must be a string"),
    body("phone").isString().notEmpty().withMessage("Phone must be a string"),
    handleValidationErrors,
];

export const validateMyEventRequest = [
    body("type").notEmpty().withMessage("Type must be a string"),
    body("city").notEmpty().withMessage("City must be a string"),
    body("description").notEmpty().withMessage("Description must be a string"),
    body("numberOfParticipants").isInt({ min: 1 }).withMessage("Number of participants must be a number greater than 0"),
    body("facilities").isArray().withMessage("Facilities must be an array").not().isEmpty().withMessage("Facilities array cannot be empty"),
    body("eventItems").isArray().withMessage("EventItems must be an array"),
    body("eventItems.*.name").notEmpty().withMessage("EventItem name is required"),
    body("eventItems.*.price").isFloat({ min: 0 }).withMessage("EventItem price is required and must be a positive number"),
    handleValidationErrors,
];