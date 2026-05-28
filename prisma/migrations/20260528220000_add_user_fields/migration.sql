-- Add phone, status, inviteToken to User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN "inviteToken" TEXT;
CREATE UNIQUE INDEX "User_inviteToken_key" ON "User"("inviteToken");
