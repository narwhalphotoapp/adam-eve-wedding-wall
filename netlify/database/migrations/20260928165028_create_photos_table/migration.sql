CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"guest_name" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
