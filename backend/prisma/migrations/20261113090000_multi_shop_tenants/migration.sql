CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Kigali',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");

INSERT INTO "Shop" ("name", "slug", "currency", "timezone", "updatedAt")
VALUES ('Existing IMS workspace', 'legacy-workspace', 'RWF', 'Africa/Kigali', CURRENT_TIMESTAMP);

ALTER TABLE "User" ADD COLUMN "shopId" INTEGER;
ALTER TABLE "Category" ADD COLUMN "shopId" INTEGER;
ALTER TABLE "Supplier" ADD COLUMN "shopId" INTEGER;
ALTER TABLE "Product" ADD COLUMN "shopId" INTEGER;
ALTER TABLE "StockMovement" ADD COLUMN "shopId" INTEGER;

UPDATE "User" SET "shopId" = (SELECT "id" FROM "Shop" WHERE "slug" = 'legacy-workspace');
UPDATE "Category" SET "shopId" = (SELECT "id" FROM "Shop" WHERE "slug" = 'legacy-workspace');
UPDATE "Supplier" SET "shopId" = (SELECT "id" FROM "Shop" WHERE "slug" = 'legacy-workspace');
UPDATE "Product" SET "shopId" = (SELECT "id" FROM "Shop" WHERE "slug" = 'legacy-workspace');
UPDATE "StockMovement" SET "shopId" = (SELECT "id" FROM "Shop" WHERE "slug" = 'legacy-workspace');

ALTER TABLE "User" ALTER COLUMN "shopId" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "shopId" SET NOT NULL;
ALTER TABLE "Supplier" ALTER COLUMN "shopId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "shopId" SET NOT NULL;
ALTER TABLE "StockMovement" ALTER COLUMN "shopId" SET NOT NULL;

DROP INDEX IF EXISTS "Category_name_key";
DROP INDEX IF EXISTS "Supplier_name_key";
DROP INDEX IF EXISTS "Product_SKU_key";
DROP INDEX IF EXISTS "StockMovement_productId_key";

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_supplierId_fkey";
ALTER TABLE "StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_productId_fkey";
ALTER TABLE "StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_userId_fkey";

CREATE UNIQUE INDEX "User_id_shopId_key" ON "User"("id", "shopId");
CREATE UNIQUE INDEX "Category_id_shopId_key" ON "Category"("id", "shopId");
CREATE UNIQUE INDEX "Category_shopId_name_key" ON "Category"("shopId", "name");
CREATE UNIQUE INDEX "Supplier_id_shopId_key" ON "Supplier"("id", "shopId");
CREATE UNIQUE INDEX "Supplier_shopId_name_key" ON "Supplier"("shopId", "name");
CREATE UNIQUE INDEX "Product_id_shopId_key" ON "Product"("id", "shopId");
CREATE UNIQUE INDEX "Product_shopId_SKU_key" ON "Product"("shopId", "SKU");
CREATE INDEX "User_shopId_role_idx" ON "User"("shopId", "role");
CREATE INDEX "Category_shopId_idx" ON "Category"("shopId");
CREATE INDEX "Supplier_shopId_idx" ON "Supplier"("shopId");
CREATE INDEX "Product_shopId_status_idx" ON "Product"("shopId", "status");
CREATE INDEX "Product_shopId_categoryId_idx" ON "Product"("shopId", "categoryId");
CREATE INDEX "Product_shopId_supplierId_idx" ON "Product"("shopId", "supplierId");
CREATE INDEX "StockMovement_shopId_productId_idx" ON "StockMovement"("shopId", "productId");
CREATE INDEX "StockMovement_shopId_createdAt_idx" ON "StockMovement"("shopId", "createdAt");
CREATE INDEX "StockMovement_shopId_userId_idx" ON "StockMovement"("shopId", "userId");

ALTER TABLE "User" ADD CONSTRAINT "User_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_shopId_fkey" FOREIGN KEY ("categoryId", "shopId") REFERENCES "Category"("id", "shopId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_shopId_fkey" FOREIGN KEY ("supplierId", "shopId") REFERENCES "Supplier"("id", "shopId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_shopId_fkey" FOREIGN KEY ("productId", "shopId") REFERENCES "Product"("id", "shopId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_shopId_fkey" FOREIGN KEY ("userId", "shopId") REFERENCES "User"("id", "shopId") ON DELETE RESTRICT ON UPDATE CASCADE;
