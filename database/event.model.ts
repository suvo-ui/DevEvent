import mongoose, { type Model, Schema } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type EventModel = Model<IEvent>;

const isNonEmptyString = (value: string): boolean => value.trim().length > 0;

const hasNonEmptyStrings = (values: string[]): boolean =>
  values.length > 0 && values.every(isNonEmptyString);

function createSlug(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new Error("Event title must contain URL-safe characters.");
  }

  return slug;
}

function normalizeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Event date must be a valid date.");
  }

  return date.toISOString();
}

function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);

  if (!match) {
    throw new Error("Event time must use HH:mm or h:mm AM/PM format.");
  }

  const [, hoursInput, minutesInput, meridiem] = match;
  let hours = Number(hoursInput);
  const minutes = Number(minutesInput);

  if (minutes > 59 || hours > (meridiem ? 12 : 23) || hours === 0 && meridiem) {
    throw new Error("Event time must be a valid time.");
  }

  if (meridiem) {
    hours = hours % 12 + (meridiem.toLowerCase() === "pm" ? 12 : 0);
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

const requiredText = { type: String, required: true, trim: true, validate: isNonEmptyString };
const requiredTextList = {
  type: [{ type: String, required: true, trim: true }],
  required: true,
  validate: hasNonEmptyStrings,
};

const eventSchema = new Schema<IEvent, EventModel>(
  {
    title: requiredText,
    slug: { type: String, trim: true },
    description: requiredText,
    overview: requiredText,
    image: requiredText,
    venue: requiredText,
    location: requiredText,
    date: requiredText,
    time: requiredText,
    mode: requiredText,
    audience: requiredText,
    agenda: requiredTextList,
    organizer: requiredText,
    tags: requiredTextList,
  },
  { timestamps: true },
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function () {
  // Keep human-entered dates and times in one predictable storage format.
  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);

  // Regenerate the URL slug only when its source field changes.
  if (this.isModified("title")) {
    this.slug = createSlug(this.title);
  }
});

// Reuse the model during Next.js hot reloads.
export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ??
  mongoose.model<IEvent, EventModel>("Event", eventSchema);
