import { Request, Response } from "express";
import User from "../models/user";

const getCurrentUser = async (req: Request, res: Response) => {
    // check if the user exists

    // return the user object to the calling client

    try {
        const currentUser = await User.findOne({ _id: req.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(currentUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

const createCurrentUser = async (req: Request, res: Response) => {
    // check if the user exists

    // create the user if it doesn't exist

    // return the user object to the calling client

    try {
        const { auth0Id } = req.body;
        const existingUser = await User.findOne({ auth0Id });

        if (existingUser) {
            return res.status(200).send();
        }

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser.toObject());
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating user" });
    }
};

const updateCurrentUser = async (req: Request, res: Response) => {
    // check if the user exists

    // update the user object

    // return the updated user object to the calling client

    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name;
        user.phone = phone;

        await user.save();

        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user" });
    }
}

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
};