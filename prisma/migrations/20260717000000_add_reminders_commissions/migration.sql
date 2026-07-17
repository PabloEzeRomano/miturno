-- Add commissionPct to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionPct" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add new Appointment fields
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRescheduleSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "reviewSent" BOOLEAN NOT NULL DEFAULT false;

-- Create ReminderSettings
CREATE TABLE IF NOT EXISTS "ReminderSettings" (
  "id"                          TEXT NOT NULL,
  "establishmentId"             TEXT NOT NULL,
  "waApiKey"                    TEXT,
  "waPhoneNumberId"             TEXT,
  "googleReviewUrl"             TEXT,
  "cancelRescheduleEnabled"     BOOLEAN NOT NULL DEFAULT false,
  "cancelRescheduleHoursBefore" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "reminderEnabled"             BOOLEAN NOT NULL DEFAULT false,
  "reminderHoursBefore"         DOUBLE PRECISION NOT NULL DEFAULT 1,
  "reviewEnabled"               BOOLEAN NOT NULL DEFAULT false,
  "reviewHoursAfter"            DOUBLE PRECISION NOT NULL DEFAULT 1.5,
  CONSTRAINT "ReminderSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReminderSettings_establishmentId_key"
  ON "ReminderSettings"("establishmentId");

ALTER TABLE "ReminderSettings"
  ADD CONSTRAINT "ReminderSettings_establishmentId_fkey"
  FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
