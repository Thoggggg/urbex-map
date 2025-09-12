-- CreateTable
CREATE TABLE "public"."Place" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "imageUrl" TEXT,
    "visitedDate" TEXT,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);
