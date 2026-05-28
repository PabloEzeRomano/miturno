-- Move Availability from Establishment to User, add userId to Appointment

ALTER TABLE "Availability" ADD COLUMN "userId" TEXT;
UPDATE "Availability" SET "userId" = (SELECT u.id FROM "User" u WHERE u."establishmentId" = "Availability"."establishmentId" AND u.role = 'Owner' LIMIT 1);
ALTER TABLE "Availability" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Availability" DROP CONSTRAINT IF EXISTS "Availability_establishmentId_fkey";
DROP INDEX IF EXISTS "Availability_establishmentId_dayOfWeek_key";
ALTER TABLE "Availability" DROP COLUMN "establishmentId";
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Availability_userId_dayOfWeek_key" ON "Availability"("userId", "dayOfWeek");

ALTER TABLE "Appointment" ADD COLUMN "userId" TEXT;
UPDATE "Appointment" SET "userId" = (SELECT u.id FROM "User" u WHERE u."establishmentId" = "Appointment"."establishmentId" AND u.role = 'Owner' LIMIT 1);
ALTER TABLE "Appointment" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
