import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import myEventRoute from "./routes/MyEventRoute";
import eventRoute from "./routes/EventRoute";
import registrationRoute from "./routes/RegistrationRoute";
import RegistrationController from "./controllers/RegistrationController";
import imageRoute from "./routes/ImageRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors());

app.post(
  "/api/registration/checkout/webhook",
  express.raw({ type: "*/*" }),
  RegistrationController.stripeWebhookHandler
);

app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Server is running!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/event", myEventRoute);
app.use("/api/event", eventRoute);
app.use("/api/registration", registrationRoute);
app.use("/api/gallery", imageRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
