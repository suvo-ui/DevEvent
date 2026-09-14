import { notFound } from "next/navigation";
import React from "react";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventBySLug } from "@/lib/actions/event.action";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

interface EventDetailItem {
  icon: string;
  alt: string;
  label: string;
}

interface EventApiResponse {
  event?: {
    description?: string;
    overview?: string;
    image?: string;
    date?: string;
    time?: string;
    location?: string;
    mode?: string;
    agenda?: string[];
    audience?: string;
    organizer?: string;
    tags?: string[];
  };
  message?: string;
  error?: string;
}

const EventDetailItem = ({ icon, alt, label }: EventDetailItem) => {
  return (
    <div className="flex-row-gap-2">
      <Image src={icon} alt={alt} height={17} width={17} />
      <p>{label}</p>
    </div>
  );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <div className="pill" key={tag}>
          {tag}
        </div>
      ))}
    </div>
  );
};

function normalizeStringArray(value: string[] | undefined): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item) {
      return [];
    }

    try {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (entry): entry is string => typeof entry === "string",
        );
      }
      return [String(parsed)];
    } catch {
      return [item];
    }
  });
}

const EventDetails = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }

    throw new Error("Failed to load event details.");
  }

  const data: EventApiResponse = await response.json();
  const event = data.event;

  if (!event?.description) {
    notFound();
  }

  const bookings = 10;

  const similarEvents = await getSimilarEventBySLug(slug);

  const agendaItems = normalizeStringArray(event?.agenda);
  const tagsList = normalizeStringArray(event?.tags);

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p className="mt-2">{event.description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={event.image ?? "/images/default-event.jpg"}
            alt="Event banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{event.overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Detail</h2>

            <EventDetailItem
              icon="/icons/calender.svg"
              alt="calender"
              label={event.date ?? "Date TBD"}
            />
            <EventDetailItem
              icon="/icons/clock.svg"
              alt="clock"
              label={event.time ?? "Time TBD"}
            />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="pin"
              label={event.location ?? "Location TBD"}
            />
            <EventDetailItem
              icon="/icons/mode.svg"
              alt="mode"
              label={event.mode ?? "Mode TBD"}
            />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={event.audience ?? "Audience TBD"}
            />
          </section>

          {agendaItems.length > 0 && <EventAgenda agendaItems={agendaItems} />}

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{event.organizer ?? "Organizer details unavailable."}</p>
          </section>

          {tagsList.length > 0 && <EventTags tags={tagsList} />}
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book your spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} who have already booked their spot
              </p>
            ) : (
              <p className="text-sm">Be the First one to book your spot</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent) => (
              <EventCard key={similarEvent.slug} {...similarEvent} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
