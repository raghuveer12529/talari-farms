import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@talarifarms.com' },
    update: {},
    create: {
      email: 'admin@talarifarms.com',
      name: 'Farm Owner',
      password,
      role: 'ADMIN',
    },
  });

  // Create Partners
  const partners = [
    { email: 'partnerA@talarifarms.com', name: 'Partner A' },
    { email: 'partnerB@talarifarms.com', name: 'Partner B' },
    { email: 'partnerC@talarifarms.com', name: 'Partner C' },
  ];

  for (const p of partners) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        password,
        role: 'PARTNER',
      },
    });
  }
  // Clear existing products to ensure a clean state for mandatory products
  await prisma.product.deleteMany({});

  // Create mandatory products
  const products = [
    {
      name: 'Tomatoes',
      description: 'Sun-ripened organic tomatoes, bursting with flavor. Ideal for salads and sauces.',
      price: 60,
      quantity: 100,
      category: 'Vegetables',
      image: '/tomatoes.png',
    },
    {
      name: 'Roses',
      description: 'Elegant, fragrant farm-grown roses. Perfect for gifting or bringing a touch of nature indoors.',
      price: 299,
      quantity: 30,
      category: 'Flowers',
      image: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&q=80',
    },
    {
      name: 'Broccoli',
      description: 'Crisp, farm-fresh organic broccoli crowns, rich in antioxidants and vitamins.',
      price: 120,
      quantity: 60,
      category: 'Vegetables',
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&q=80',
    },
    {
      name: 'Dragon Fruit',
      description: 'Stunning pink pitaya with a refreshing, mildly sweet taste. Harvested daily for maximum freshness.',
      price: 180,
      quantity: 40,
      category: 'Exotic Fruits',
      image: '/dragon-fruit.png',
    },
    {
      name: 'GAC Fruit',
      description: 'The "Fruit from Heaven", known for its high nutritional value and vibrant orange hue. Grown organically at Talari Farms.',
      price: 450,
      quantity: 15,
      category: 'Exotic Fruits',
      image: '/gac-fruit.png',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: `seed-${p.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        ...p,
        createdAt: new Date(), // Ensure Gac Fruit (seeded last) has the latest timestamp
      },
      create: {
        id: `seed-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...p,
        createdAt: new Date(),
      },
    });
    // Tiny delay to ensure unique timestamps if DB is too fast
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
