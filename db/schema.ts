import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const photos = pgTable("photos", {
  id: uuid().primaryKey().defaultRandom(),
  guestName: text("guest_name"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
