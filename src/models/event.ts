import mongoose, { InferSchemaType } from "mongoose";

const eventItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export type EventItemType = InferSchemaType<typeof eventItemSchema>;

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  numberOfParticipants: { type: Number, required: true },
  facilities: [{ type: String, required: true }],
  eventItems: [eventItemSchema],
  imageUrls: [{ type: String, required: true }],
  lastUpdated: { type: Date, required: true },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
