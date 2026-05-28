-- Migration: Barber → User + Establishment

-- Create Establishment table
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "categoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Establishment_slug_key" ON "Establishment"("slug");

-- Copy Barber → Establishment (same IDs, data is the business info)
INSERT INTO "Establishment" ("id", "shopName", "slug", "phone", "categoryId", "isActive", "createdAt")
SELECT "id", "shopName", "slug", "phone", "categoryId", "isActive", "createdAt" FROM "Barber";

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Owner',
    "establishmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Copy Barber → User (reuse IDs so existing sessions still work)
INSERT INTO "User" ("id", "name", "email", "password", "role", "establishmentId", "createdAt")
SELECT "id", "name", "email", "password", 'Owner', "id", "createdAt" FROM "Barber";

-- Add establishmentId to child tables
ALTER TABLE "Service" ADD COLUMN "establishmentId" TEXT;
ALTER TABLE "Availability" ADD COLUMN "establishmentId" TEXT;
ALTER TABLE "BlockedDate" ADD COLUMN "establishmentId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "establishmentId" TEXT;
ALTER TABLE "RecurringAppointment" ADD COLUMN "establishmentId" TEXT;

-- Migrate barberId → establishmentId
UPDATE "Service" SET "establishmentId" = "barberId";
UPDATE "Availability" SET "establishmentId" = "barberId";
UPDATE "BlockedDate" SET "establishmentId" = "barberId";
UPDATE "Appointment" SET "establishmentId" = "barberId";
UPDATE "RecurringAppointment" SET "establishmentId" = "barberId";

-- Add foreign keys
ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Service: drop Barber FK, drop barberId, add Establishment FK
ALTER TABLE "Service" DROP CONSTRAINT IF EXISTS "Service_barberId_fkey";
ALTER TABLE "Service" DROP COLUMN "barberId";
ALTER TABLE "Service" ALTER COLUMN "establishmentId" SET NOT NULL;
ALTER TABLE "Service" ADD CONSTRAINT "Service_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Availability
ALTER TABLE "Availability" DROP CONSTRAINT IF EXISTS "Availability_barberId_fkey";
DROP INDEX IF EXISTS "Availability_barberId_dayOfWeek_key";
ALTER TABLE "Availability" DROP COLUMN "barberId";
ALTER TABLE "Availability" ALTER COLUMN "establishmentId" SET NOT NULL;
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Availability_establishmentId_dayOfWeek_key" ON "Availability"("establishmentId", "dayOfWeek");

-- BlockedDate
ALTER TABLE "BlockedDate" DROP CONSTRAINT IF EXISTS "BlockedDate_barberId_fkey";
ALTER TABLE "BlockedDate" DROP COLUMN "barberId";
ALTER TABLE "BlockedDate" ALTER COLUMN "establishmentId" SET NOT NULL;
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Appointment
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_barberId_fkey";
ALTER TABLE "Appointment" DROP COLUMN "barberId";
ALTER TABLE "Appointment" ALTER COLUMN "establishmentId" SET NOT NULL;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RecurringAppointment
ALTER TABLE "RecurringAppointment" DROP CONSTRAINT IF EXISTS "RecurringAppointment_barberId_fkey";
ALTER TABLE "RecurringAppointment" DROP COLUMN "barberId";
ALTER TABLE "RecurringAppointment" ALTER COLUMN "establishmentId" SET NOT NULL;
ALTER TABLE "RecurringAppointment" ADD CONSTRAINT "RecurringAppointment_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop Barber table (FK from Category→Barber is in Barber table, auto-dropped)
DROP TABLE "Barber";
