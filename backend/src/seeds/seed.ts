import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedThemes() {
  const themesData = [
    {
      name: "Kültür & Miras",
      emoji: "🏛️",
      description: "Gezginler, tarihi meraklıları ve mimari sevdalıları.",
      subThemes: [
        "Müzeler & Galeriler",
        "Tarihi Siteler & Kaleler",
        "İbadet Yerleri",
        "Yerel Mahalleler",
      ],
    },
    {
      name: "Yeme & İçme",
      emoji: "🍽️",
      description: "Yemek severler, kültürel seyahatçiler ve gece hayatı arayıcıları.",
      subThemes: [
        "Yerel Yemekler & Sokak Yemekleri",
        "Fine Dining",
        "Kafeler & Fırınlar",
        "Gece Hayatı & Barlar",
        "Yemek Deneyimleri",
      ],
    },
    {
      name: "Doğa & Macera",
      emoji: "🏔️",
      description: "Dağcılar, macera severler ve doğa fotoğrafçıları.",
      subThemes: [
        "İzler & Yürüyüş",
        "Parklar & Bahçeler",
        "Su Kenarları",
        "Manzara Noktaları",
        "Yaban Hayatı",
      ],
    },
    {
      name: "Konaklama",
      emoji: "🏨",
      description: "Konaklama seçeneklerini inceleyin, bütçeden lüksüne kadar.",
      subThemes: [
        "Oteller & Resortlar",
        "Alternatif Konaklama",
        "Bütçe Konaklama",
        "Kamp Alanları",
      ],
    },
    {
      name: "Aktiviteler & Eğlence",
      emoji: "🎢",
      description: "Aileler, heyecan arayıcılar ve deneyimli seyahatçiler.",
      subThemes: [
        "Eğlence Parkları",
        "Macera Sporları",
        "Wellness & Rahatlama",
        "Alışveriş & Pazarlar",
        "Etkinlikler & Festivaller",
      ],
    },
    {
      name: "Ulaşım & İpuçları",
      emoji: "🗺️",
      description: "Pratik seyahat ipuçları ve nerede nasıl dolaşılır.",
      subThemes: ["Sakin Rotalar", "Terminal & Lounge"],
    },
  ];

  console.log("🌱 Starting theme seeding...");

  for (const themeData of themesData) {
    const theme = await prisma.theme.create({
      data: {
        name: themeData.name,
        emoji: themeData.emoji,
        description: themeData.description,
      },
    });

    console.log(`✓ Created theme: ${theme.name}`);

    for (const subThemeName of themeData.subThemes) {
      const subTheme = await prisma.subTheme.create({
        data: {
          themeId: theme.id,
          name: subThemeName,
        },
      });
      console.log(`  ✓ Created sub-theme: ${subTheme.name}`);
    }
  }

  console.log("\n✅ Theme seeding completed successfully!");
}

seedThemes()
  .catch((e) => {
    console.error("❌ Error seeding themes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
