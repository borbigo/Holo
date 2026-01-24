// src/jobs/seedDatabase.js
require('dotenv').config();
const prisma = require('../config/database');
const pokemonTcgService = require('../services/pokemonTcgService');

async function seedSets() {
  console.log('📦 Checking sets in database...');
  
  try {
    // Check if sets already exist
    const existingCount = await prisma.set.count();
    
    if (existingCount > 0) {
      console.log(`✅ Found ${existingCount} sets already in database. Skipping set sync.\n`);
      return existingCount;
    }

    console.log('📦 Fetching sets from Pokemon TCG API...');
    const sets = await pokemonTcgService.getAllSets();
    console.log(`✅ Found ${sets.length} sets`);

    console.log('💾 Saving sets to database...');
    
    let savedCount = 0;
    for (const set of sets) {
      try {
        await prisma.set.upsert({
          where: { id: set.id },
          update: {
            name: set.name,
            series: set.series,
            printedTotal: set.printedTotal,
            total: set.total,
            releaseDate: new Date(set.releaseDate),
            imageUrl: set.images?.logo || null,
            logoUrl: set.images?.logo || null,
            symbolUrl: set.images?.symbol || null,
            updatedAt: new Date()
          },
          create: {
            id: set.id,
            name: set.name,
            series: set.series,
            printedTotal: set.printedTotal,
            total: set.total,
            releaseDate: new Date(set.releaseDate),
            imageUrl: set.images?.logo || null,
            logoUrl: set.images?.logo || null,
            symbolUrl: set.images?.symbol || null
          }
        });
        savedCount++;
        
        if (savedCount % 10 === 0) {
          console.log(`   Saved ${savedCount}/${sets.length} sets...`);
        }
      } catch (error) {
        console.error(`   ❌ Error saving set ${set.id}:`, error.message);
      }
    }

    console.log(`✅ Successfully saved ${savedCount} sets!\n`);
    return savedCount;
  } catch (error) {
    console.error('❌ Error fetching sets:', error.message);
    throw error;
  }
}

async function seedCardsForSet(setId, setName) {
  console.log(`🃏 Fetching cards for set: ${setName} (${setId})...`);
  
  try {
    const cards = await pokemonTcgService.getAllCardsFromSet(setId);
    console.log(`   Found ${cards.length} cards`);

    let savedCount = 0;
    for (const card of cards) {
      try {
        // Extract price data if available
        const tcgplayerPrices = card.tcgplayer?.prices || {};
        const marketPrice = 
          tcgplayerPrices.holofoil?.market ||
          tcgplayerPrices.reverseHolofoil?.market ||
          tcgplayerPrices.normal?.market ||
          tcgplayerPrices.unlimitedHolofoil?.market ||
          null;

        await prisma.card.upsert({
          where: { id: card.id },
          update: {
            name: card.name,
            setName: card.set.name,
            setId: card.set.id,
            number: card.number,
            rarity: card.rarity || null,
            types: card.types || [],
            supertype: card.supertype,
            subtypes: card.subtypes || [],
            hp: card.hp || null,
            imageUrl: card.images?.small || null,
            imageUrlHiRes: card.images?.large || null,
            artist: card.artist || null,
            releaseDate: card.set.releaseDate ? new Date(card.set.releaseDate) : null,
            updatedAt: new Date()
          },
          create: {
            id: card.id,
            name: card.name,
            setName: card.set.name,
            setId: card.set.id,
            number: card.number,
            rarity: card.rarity || null,
            types: card.types || [],
            supertype: card.supertype,
            subtypes: card.subtypes || [],
            hp: card.hp || null,
            imageUrl: card.images?.small || null,
            imageUrlHiRes: card.images?.large || null,
            artist: card.artist || null,
            releaseDate: card.set.releaseDate ? new Date(card.set.releaseDate) : null
          }
        });

        // Save initial price if available
        if (marketPrice) {
          await prisma.priceHistory.create({
            data: {
              cardId: card.id,
              marketPrice: marketPrice,
              lowPrice: tcgplayerPrices.holofoil?.low || tcgplayerPrices.normal?.low || null,
              midPrice: tcgplayerPrices.holofoil?.mid || tcgplayerPrices.normal?.mid || null,
              highPrice: tcgplayerPrices.holofoil?.high || tcgplayerPrices.normal?.high || null,
              source: 'pokemontcg-api',
              date: new Date()
            }
          });
        }

        savedCount++;
      } catch (error) {
        console.error(`   ❌ Error saving card ${card.id}:`, error.message);
      }
    }

    console.log(`   ✅ Saved ${savedCount}/${cards.length} cards from ${setName}\n`);
    return savedCount;
  } catch (error) {
    console.error(`   ❌ Error fetching cards for set ${setId}:`, error.message);
    return 0;
  }
}

async function seedRecentSets(numberOfSets = 5) {
  console.log(`\n🎮 Starting database seed with ${numberOfSets} most recent sets...\n`);
  
  try {
    // First, seed all sets
    await seedSets();

    // Get recent sets from DATABASE (not API)
    console.log('📋 Getting recent sets from database...');
    const recentSets = await prisma.set.findMany({
      orderBy: { releaseDate: 'desc' },
      take: numberOfSets
    });
    
    console.log(`📝 Will seed cards from these ${numberOfSets} recent sets:`);
    recentSets.forEach((set, idx) => {
      console.log(`   ${idx + 1}. ${set.name} (${set.id}) - Released: ${set.releaseDate.toISOString().split('T')[0]}`);
    });
    console.log('');

    // Seed cards for each recent set
    let totalCards = 0;
    for (const set of recentSets) {
      const cardsAdded = await seedCardsForSet(set.id, set.name);
      totalCards += cardsAdded;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 Database seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Sets in database: ${await prisma.set.count()}`);
    console.log(`   - Cards in database: ${await prisma.card.count()}`);
    console.log(`   - Price records: ${await prisma.priceHistory.count()}`);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

async function seedAllSets() {
  console.log('\n🎮 Starting FULL database seed (all sets)...\n');
  console.log('⚠️  Warning: This will take a while (20-30 minutes)\n');
  
  try {
    // Seed all sets first
    await seedSets();

    // Get all sets from database
    const sets = await prisma.set.findMany({
      orderBy: { releaseDate: 'desc' }
    });

    console.log(`📝 Seeding cards for ${sets.length} sets...\n`);

    let totalCards = 0;
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      console.log(`[${i + 1}/${sets.length}] Processing ${set.name}...`);
      
      const cardsAdded = await seedCardsForSet(set.id, set.name);
      totalCards += cardsAdded;
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 Full database seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total sets: ${sets.length}`);
    console.log(`   - Total cards: ${totalCards}`);
    console.log(`   - Price records: ${await prisma.priceHistory.count()}`);
    
  } catch (error) {
    console.error('\n❌ Full seeding failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Seed script starting...');
  const args = process.argv.slice(2);
  const mode = args[0] || 'recent';

  console.log(`Mode: ${mode}`);
  console.log(`Args:`, args);

  try {
    if (mode === 'all') {
      await seedAllSets();
    } else if (mode === 'sets-only') {
      await seedSets();
    } else {
      // Default: seed recent sets
      const numberOfSets = parseInt(args[1]) || 5;
      await seedRecentSets(numberOfSets);
    }
    console.log('✅ Seed script completed successfully');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
    console.log('Done.');
  }
}

// Run if called directly
if (require.main === module) {
  console.log('Script is being run directly');
  main().catch(err => {
    console.error('Unhandled error in main:', err);
    process.exit(1);
  });
}

module.exports = { seedSets, seedCardsForSet, seedRecentSets, seedAllSets };