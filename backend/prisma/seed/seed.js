const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seed Script ---');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Ensure Cities exist
  const cityNames = ['Delhi', 'Ahmedabad', 'Bangalore'];
  const cityMap = {};
  for (const name of cityNames) {
    const city = await prisma.city.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    cityMap[name] = city;
    console.log(`[City] Ensured city exists: ${name}`);
  }

  // 2. Ensure Bangalore Demo Accounts exist
  const accounts = [
    { email: 'user@bangalore.com', name: 'Bangalore Demo User', role: 'USER' },
    { email: 'owner_store1bangalore@pawconnect.com', name: 'Bangalore Store Owner', role: 'STORE_OWNER' },
    { email: 'vet1@bangalore.com', name: 'Bangalore Vet', role: 'SERVICE_PROVIDER' },
    { email: 'training1@bangalore.com', name: 'Bangalore Trainer', role: 'SERVICE_PROVIDER' },
    { email: 'grooming1@bangalore.com', name: 'Bangalore Groomer', role: 'SERVICE_PROVIDER' },
    { email: 'boarding1@bangalore.com', name: 'Bangalore Boarding', role: 'SERVICE_PROVIDER' },
    { email: 'admin@pawconnect.com', name: 'System Admin', role: 'ADMIN' },
  ];

  for (const acc of accounts) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { password: passwordHash, isApproved: true },
      create: {
        email: acc.email,
        name: acc.name,
        password: passwordHash,
        role: acc.role,
        isApproved: true
      }
    });
    console.log(`[User] Ensured account exists: ${acc.email} (${acc.role})`);
  }

  // 3. Ensure Bangalore Stores exist (at least one for the demo)
  const storeOwner = await prisma.user.findUnique({ where: { email: 'owner_store1bangalore@pawconnect.com' } });
  if (storeOwner) {
    for (let i = 1; i <= 4; i++) {
        const storeName = `Bangalore Premium Pet Store ${i}`;
        await prisma.store.upsert({
            where: { id: `store-bangalore-${i}` },
            update: { name: storeName, cityId: cityMap['Bangalore'].id },
            create: {
                id: `store-bangalore-${i}`,
                name: storeName,
                address: `${100 + i} Indiranagar, Bangalore`,
                cityId: cityMap['Bangalore'].id,
                ownerId: storeOwner.id
            }
        });
    }
    console.log(`[Store] Ensured 4 Bangalore stores exist.`);
  }

  // 4. Pet Migration Logic (Delhi -> Ahmedabad)
  console.log('\n--- Running Pet Migration (Delhi -> Ahmedabad) ---');
  const storeNumbers = [1, 2, 3, 4];
  for (const n of storeNumbers) {
    const delhiStoreName = `Delhi Premium Pet Store ${n}`;
    const ahmedabadStoreName = `Ahmedabad Premium Pet Store ${n}`;

    const delhiStore = await prisma.store.findFirst({ where: { name: delhiStoreName } });
    const ahmedabadStore = await prisma.store.findFirst({ where: { name: ahmedabadStoreName } });

    if (!delhiStore || !ahmedabadStore) {
      console.warn(`[Skip] Could not find stores: ${delhiStoreName} or ${ahmedabadStoreName}`);
      continue;
    }

    const delhiPets = await prisma.pet.findMany({ where: { storeId: delhiStore.id } });
    console.log(`[Pet] Found ${delhiPets.length} pets in ${delhiStoreName}. Copying to ${ahmedabadStoreName}...`);

    for (const pet of delhiPets) {
      const existing = await prisma.pet.findFirst({
        where: { name: pet.name, breed: pet.breed, storeId: ahmedabadStore.id }
      });

      if (!existing) {
        const { id, createdAt, updatedAt, ...petData } = pet;
        await prisma.pet.create({
          data: {
            ...petData,
            cityId: cityMap['Ahmedabad'].id,
            storeId: ahmedabadStore.id,
            locationCity: 'Ahmedabad'
          }
        });
        console.log(`  [+] Copied: ${pet.name}`);
      }
    }
  }

  console.log('\n--- Seed Finished Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
