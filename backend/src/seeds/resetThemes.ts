import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetAndSeedThemes() {
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

  try {
    console.log("🗑️  Deleting existing data...");
    // Delete posts first due to foreign key constraints
    await prisma.post.deleteMany({});
    console.log("✓ Deleted all posts");
    await prisma.subTheme.deleteMany({});
    console.log("✓ Deleted all sub-themes");
    await prisma.theme.deleteMany({});
    console.log("✓ Deleted all themes\n");

    console.log("🌱 Seeding new Turkish themes...\n");

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

    console.log("\n✅ Theme reset and seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during reset/seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeedThemes();
