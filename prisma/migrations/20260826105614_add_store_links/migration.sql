-- CreateTable
CREATE TABLE "StoreLink" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreLink_provider_idx" ON "StoreLink"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "StoreLink_gameId_provider_key" ON "StoreLink"("gameId", "provider");

-- AddForeignKey
ALTER TABLE "StoreLink" ADD CONSTRAINT "StoreLink_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
