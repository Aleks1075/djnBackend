import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import RegistrationController from "../controllers/RegistrationController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, RegistrationController.getMyRegistrations);

router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  RegistrationController.createCheckoutSession
);

router.post("/checkout/webhook", RegistrationController.stripeWebhookHandler);

export default router;
