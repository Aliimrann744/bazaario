-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" VARCHAR(200),
    "cityId" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBusiness" BOOLEAN NOT NULL DEFAULT false,
    "businessName" TEXT,
    "trustTier" TEXT NOT NULL DEFAULT 'NEW',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "level" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "slug" TEXT,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "listingKind" TEXT NOT NULL DEFAULT 'good',
    "priceTypesAllowed" JSONB NOT NULL DEFAULT '[]',
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "schemaRef" TEXT,
    "hasSchema" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isLeaf" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_items" (
    "id" SERIAL NOT NULL,
    "catalog" TEXT NOT NULL,
    "parentId" TEXT,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "reference_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceMinor" BIGINT NOT NULL DEFAULT 0,
    "priceType" TEXT NOT NULL DEFAULT 'fixed',
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "condition" TEXT,
    "locationId" TEXT,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "state" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejectionReason" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favouriteCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_media" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,

    CONSTRAINT "listing_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "query" JSONB NOT NULL DEFAULT '{}',
    "cadence" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "buyerReadAt" TIMESTAMP(3),
    "sellerReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_publicId_key" ON "users"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "locations_parentId_idx" ON "locations"("parentId");

-- CreateIndex
CREATE INDEX "locations_level_idx" ON "locations"("level");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "reference_items_catalog_idx" ON "reference_items"("catalog");

-- CreateIndex
CREATE UNIQUE INDEX "listings_publicId_key" ON "listings"("publicId");

-- CreateIndex
CREATE INDEX "listings_categoryId_idx" ON "listings"("categoryId");

-- CreateIndex
CREATE INDEX "listings_locationId_idx" ON "listings"("locationId");

-- CreateIndex
CREATE INDEX "listings_state_idx" ON "listings"("state");

-- CreateIndex
CREATE INDEX "listings_userId_idx" ON "listings"("userId");

-- CreateIndex
CREATE INDEX "listing_media_listingId_idx" ON "listing_media"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "favourites_userId_listingId_key" ON "favourites"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_listingId_buyerId_key" ON "conversations"("listingId", "buyerId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
