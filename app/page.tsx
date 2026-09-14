import Explorebtn from "@/components/Explorebtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
  "use cache";
  cacheLife("hours");
  const response = await fetch(`${BASE_URL}/api/events`);
  const data = await response.json();
  const events: IEvent[] = Array.isArray(data.events) ? data.events : [];
  return (
    <section id="home">
      <h1 className="text-center">
        The Hub for every Dev <br /> Event you can&apos;t miss
      </h1>
      <p className="subheading">
        Hackathon,Meetups and Conferences,All in One Place
      </p>
      <Explorebtn />
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        {events.length > 0 ? (
          <ul className="events">
            {events.map((evt) => (
              <li key={evt.title}>
                <EventCard {...evt} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No events available right now.</p>
        )}
      </div>
    </section>
  );
};

export default Page;
