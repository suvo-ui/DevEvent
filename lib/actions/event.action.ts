"use server";

import { Event } from "@/database/event.model";
import { connectToDatabase } from "../mongodb";

export const getSimilarEventBySLug = async (slug: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();

    return similarEvents.map(
      ({ title, image, slug, location, date, time }) => ({
        title,
        image,
        slug,
        location,
        date,
        time,
      }),
    );
  } catch {
    return [];
  }
};
