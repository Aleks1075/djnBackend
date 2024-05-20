import { Request, Response } from 'express';
import Event from '../models/event';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

const getMyEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findOne({ user: req.userId });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        console.log("error: ", error)
        res.status(500).json({ message: "Error fetching event" });
    }
};

const createMyEvent = async (req: Request, res: Response) => {
    try {
        const existingEvent = await Event.findOne({ user: req.userId });

        if (existingEvent) {
            return res.status(409).json({ message: "User event already exists" });
        }

        // const image = req.file as Express.Multer.File;
        // const base64Image = Buffer.from(image.buffer).toString("base64");
        // const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

        const imageUrl = await uploadImage(req.file as Express.Multer.File);

        const event = new Event(req.body);
        event.imageUrls = [imageUrl];
        event.user = new mongoose.Types.ObjectId(req.userId);
        event.lastUpdated = new Date();
        await event.save();

        res.status(201).send(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const updateMyEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findOne({ user: req.userId });

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

        if(req.file) {
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            event.imageUrls = [imageUrl];
        }

        await event.save();
        res.status(200).send(event);
    } catch (error) {
        console.log("error: ", error)
        res.status(500).json({ message: "Something went wrong" });
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
    getMyEvent,
    createMyEvent,
    updateMyEvent,
};