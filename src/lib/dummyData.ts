export const dummyCategories = [
  "Popular", "Pencils", "Pens", "Erasers", "Various Tools",
  "Correction", "Notebooks", "Pocket Notebooks",
  "Math Books", "Science Books", "Social Books", "History Books"
];

// Helper to generate a slug from category name
export const getSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

// Base realistic brands for our products
const brands = ['Muji', 'Faber-Castell', 'Tombow', 'Lamy', 'Rotring', 'Pilot', 'Pentel', 'Uni', 'Zebra', 'Moleskine'];

// Function to generate 10 products per category
const generateProducts = () => {
  const products: any[] = [];
  let idCounter = 1;

  dummyCategories.forEach((category) => {
    const slug = getSlug(category);
    
    for (let i = 1; i <= 10; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      let baseName = '';
      let basePrice = 5;

      switch(category) {
        case 'Pencils': baseName = `Graphite Pro ${i}H`; basePrice = 2; break;
        case 'Pens': baseName = `Gel Ink Fineliner 0.${i%5+3}mm`; basePrice = 4; break;
        case 'Erasers': baseName = `Dust-Free Block Mini-${i}`; basePrice = 1.5; break;
        case 'Various Tools': baseName = `Precision Ruler ${i}0cm`; basePrice = 6; break;
        case 'Correction': baseName = `Tape Runner Pro V${i}`; basePrice = 3.5; break;
        case 'Notebooks': baseName = `A${(i%3)+4} Grid Journal`; basePrice = 12; break;
        case 'Pocket Notebooks': baseName = `Field Notes A6 Vol.${i}`; basePrice = 8; break;
        case 'Math Books': baseName = `Advanced Calculus Practice-${i}`; basePrice = 18; break;
        case 'Science Books': baseName = `Physics Lab Manual V${i}`; basePrice = 16; break;
        case 'Social Books': baseName = `World History Outline Pt.${i}`; basePrice = 14; break;
        case 'History Books': baseName = `Ancient Civilizations Vol.${i}`; basePrice = 15; break;
        case 'Popular': baseName = `Bestseller Item ${i}`; basePrice = 20; break;
      }

      products.push({
        id: `dummy-${idCounter++}`,
        name: `${brand} ${baseName}`,
        brand: brand,
        price: basePrice + (Math.random() * 5), // Add some randomness to price
        category: category,
        category_slug: slug,
        image_url: null, // Placeholder
      });
    }
  });
  
  return products;
};

export const dummyProducts = generateProducts();
