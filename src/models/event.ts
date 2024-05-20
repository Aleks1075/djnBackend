import mongoose from 'mongoose';

const eventItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
});

const eventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    numberOfParticipants: { type: Number, required: true },
    facilities: [{type: String, required: true}],
    eventItems: [eventItemSchema],
    imageUrls: [{type: String, required: true}],
    lastUpdated: { type: Date, required: true },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;