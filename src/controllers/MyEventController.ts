import { Request, Response } from "express";
import Event from "../models/event";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Registration from "../models/registration";

// Get a single event created by the user
const getMyEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findOne({ _id: eventId, user: req.userId });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Error fetching event" });
  }
};

// Get events created by the user
const getMyEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ user: req.userId });

    res.json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createMyEvent = async (req: Request, res: Response) => {
  try {
    const imageUrl = req.file
      ? await uploadImage(req.file as Express.Multer.File)
      : "";

    const event = new Event(req.body);
    if (imageUrl) event.imageUrls = [imageUrl];
    event.user = new mongoose.Types.ObjectId(req.userId);
    event.lastUpdated = new Date();
    await event.save();

    res.status(201).send(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyEventRegistrations = async (req: Request, res: Response) => {
  try {
    const event = await Event.findOne({ user: req.userId });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({ event: event._id })
      .populate("event")
      .populate("user");

    res.json(registrations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findOne({ _id: eventId, user: req.userId });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.type = req.body.type;
    event.city = req.body.city;
    event.description = req.body.description;
    event.numberOfParticipants = req.body.numberOfParticipants;
    event.facilities = req.body.facilities;
    event.eventItems = req.body.eventItems;
    event.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      event.imageUrls = [imageUrl];
    }

    await event.save();
    res.status(200).send(event);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteMyEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.userId;

    // Find the event to be deleted
    const event = await Event.findOne({ _id: eventId, user: userId });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete associated images from Cloudinary (if any)
    if (event.imageUrls && event.imageUrls.length > 0) {
      for (const imageUrl of event.imageUrls) {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    }

    // Delete associated registrations
    await Registration.deleteMany({ event: eventId });

    // Delete the event
    await Event.deleteOne({ _id: eventId });

    res.status(200).json({
      message: "Event and associated registrations deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to delete event" });
  }
};

const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const event = await Event.findById(registration.event);

    if (event?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    registration.status = status;
    await registration.save();

    res.status(200).json(registration);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to update registration status" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  updateRegistrationStatus,
  getMyEventRegistrations,
  getMyEvent,
  getMyEvents,
  createMyEvent,
  updateMyEvent,
  deleteMyEvent,
};
