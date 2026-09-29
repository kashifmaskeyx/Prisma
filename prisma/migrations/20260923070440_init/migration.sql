-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Drink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COFFEE',
    "price" REAL NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 100
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
