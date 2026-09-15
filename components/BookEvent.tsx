"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import React, { useEffect, useState } from "react";
import posthog$1 from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(localStorage.getItem(`booked:${slug}`) === "true");
  }, [slug]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const { success } = await createBooking({ eventId, email, slug });

    if (success) {
      setSubmitted(true);
      localStorage.setItem(`booked:${slug}`, "true");
      posthog$1.capture("event_booked", { eventId, slug, email });
    } else {
      console.error("Booking Creation failed");
      posthog$1.captureException("Booking Creation failed");
    }
  }
  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email..."
            />
          </div>

          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
