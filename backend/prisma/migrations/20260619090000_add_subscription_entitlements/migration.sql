ALTER TABLE "Subscription"
ALTER COLUMN "status" SET DEFAULT 'inactive';

ALTER TABLE "Subscription"
ADD COLUMN "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Subscription"
SET "status" = 'inactive'
WHERE "plan" = 'free';
