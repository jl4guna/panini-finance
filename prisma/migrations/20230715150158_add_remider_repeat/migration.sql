-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "date" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "repeat" TEXT NOT NULL DEFAULT 'never',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Reminder" ("allDay", "color", "createdAt", "date", "description", "id", "title", "updatedAt") SELECT "allDay", "color", "createdAt", "date", "description", "id", "title", "updatedAt" FROM "Reminder";
DROP TABLE "Reminder";
ALTER TABLE "new_Reminder" RENAME TO "Reminder";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
