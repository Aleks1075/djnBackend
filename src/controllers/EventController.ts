import { Request, Response } from "express";
import Event from "../models/event";

const getEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const searchEvent = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedFacilities = (req.query.selectedFacilities as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    // valby = Valby
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Event.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedFacilities) {
      // URL  = selectedFacilities=gratis wifi, parkering, toilet
      // ["gratis wifi", "parkering", "toilet"]
      const facilitiesArray = selectedFacilities
        .split(",")
        .map((facility) => new RegExp(facility, "i"));

      query["facilities"] = { $all: facilitiesArray };
    }

    if (searchQuery) {
      // type = Konkurrence, Træning - individuel, Træning - hold
      // facilities = gratis wifi, parkering, toilet
      // searchQuery = gratis wifi
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { type: searchRegex },
        { facilities: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const events = await Event.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Event.countDocuments(query);

    const response = {
      data: events,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize), //50 results, pageSize = 10 > pages 5
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getEvent,
  searchEvent,
};
