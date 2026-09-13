import mongoose, { type Model, Schema, Types } from "mongoose";

import { Event } from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type BookingModel = Model<IBooking>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking, BookingModel>(
  {
    // An ObjectId reference keeps booking documents small while preserving relations.
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailPattern.test(value),
        message: "Email must be a valid email address.",
      },
    },
  },
  { timestamps: true },
);

bookingSchema.pre("save", async function () {
  if (this.isNew || this.isModified("eventId")) {
    // Prevent bookings that point to an event that no longer exists.
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error("Cannot create a booking for an event that does not exist.");
    }
  }
});

// Reuse the model during Next.js hot reloads.
export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ??
  mongoose.model<IBooking, BookingModel>("Booking", bookingSchema);
