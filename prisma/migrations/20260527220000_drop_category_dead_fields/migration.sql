-- Drop dead columns from Category (data is hardcoded in lib/categories.ts)
ALTER TABLE "Category" DROP COLUMN "appName",
                       DROP COLUMN "theme";
