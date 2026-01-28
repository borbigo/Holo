-- CreateTable
CREATE TABLE "one_piece_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "totalCards" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_piece_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_piece_starter_decks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "totalCards" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_piece_starter_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_piece_cards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "setId" TEXT,
    "color" TEXT,
    "category" TEXT,
    "cost" INTEGER,
    "attribute" TEXT,
    "power" INTEGER,
    "counter" INTEGER,
    "rarity" TEXT,
    "effect" TEXT,
    "trigger" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_piece_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_piece_price_history" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marketPrice" DOUBLE PRECISION,
    "lowPrice" DOUBLE PRECISION,
    "midPrice" DOUBLE PRECISION,
    "highPrice" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'tcgplayer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "one_piece_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "one_piece_sets_releaseDate_idx" ON "one_piece_sets"("releaseDate");

-- CreateIndex
CREATE INDEX "one_piece_starter_decks_releaseDate_idx" ON "one_piece_starter_decks"("releaseDate");

-- CreateIndex
CREATE INDEX "one_piece_cards_name_idx" ON "one_piece_cards"("name");

-- CreateIndex
CREATE INDEX "one_piece_cards_setId_idx" ON "one_piece_cards"("setId");

-- CreateIndex
CREATE INDEX "one_piece_cards_color_idx" ON "one_piece_cards"("color");

-- CreateIndex
CREATE INDEX "one_piece_cards_category_idx" ON "one_piece_cards"("category");

-- CreateIndex
CREATE INDEX "one_piece_cards_rarity_idx" ON "one_piece_cards"("rarity");

-- CreateIndex
CREATE INDEX "one_piece_cards_cardType_idx" ON "one_piece_cards"("cardType");

-- CreateIndex
CREATE INDEX "one_piece_price_history_cardId_date_idx" ON "one_piece_price_history"("cardId", "date");

-- CreateIndex
CREATE INDEX "one_piece_price_history_date_idx" ON "one_piece_price_history"("date");

-- AddForeignKey
ALTER TABLE "one_piece_cards" ADD CONSTRAINT "one_piece_card_set_fkey" FOREIGN KEY ("setId") REFERENCES "one_piece_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_piece_cards" ADD CONSTRAINT "one_piece_card_starter_deck_fkey" FOREIGN KEY ("setId") REFERENCES "one_piece_starter_decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_piece_price_history" ADD CONSTRAINT "one_piece_price_history_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "one_piece_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
