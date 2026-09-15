"use server";

import { connectToDatabase } from "../mongodb";
import { Booking } from "@/database/booking.model";

interface BookingActionsInterface {
  eventId: string;
  slug: string;
  email: string;
}

export const createBooking = async ({
  eventId,
  slug,
  email,
}: BookingActionsInterface) => {
  try {
    await connectToDatabase();
    await Booking.create({
      eventId,
      slug,
      email,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Create booking failed");
    return { success: false };
  }
};
