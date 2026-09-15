import { Event } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Fetch an event by its URL slug.
 * Example: GET /api/events/concert-night
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const normalizedSlug = slug?.trim();

    // Validate the route parameter before hitting the database.
    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Event slug is required." },
        { status: 400 },
      );
    }

    if (!isValidSlug(normalizedSlug)) {
      return NextResponse.json(
        {
          message:
            "Invalid event slug. Use lowercase letters, numbers, and hyphens only.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug: normalizedSlug }).lean().exec();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${normalizedSlug}" was not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully.",
        event: { ...event, _id: event._id.toString() },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to fetch event details.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
