import mongoose, { InferSchemaType } from "mongoose";

const imageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type ImageType = InferSchemaType<typeof imageSchema>;

const Image = mongoose.model("Image", imageSchema);

export default Image;
