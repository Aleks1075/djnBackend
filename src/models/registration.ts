import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveryDetails: {
        email: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
    },
    cartItems: [
        {
            eventItemId: { type: String, required: true },
            quantity: { type: Number, required: true },
            name: { type: String, required: true },
        },
    ],
    totalAmount: Number,
    status: {
        type: String,
        enum: ["afventer", "bekræftet", "annulleret"],
        default: "afventer",
    },
    createdAt: { type: Date, default: Date.now },
});

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;