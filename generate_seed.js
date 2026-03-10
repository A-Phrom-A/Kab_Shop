const fs = require('fs');

const dummyCategories = [
  "Popular", "Pencils", "Pens", "Erasers", "Various Tools",
  "Correction", "Notebooks", "Pocket Notebooks",
  "Math Books", "Science Books", "Social Books", "History Books"
];

const brands = ['Muji', 'Faber-Castell', 'Tombow', 'Lamy', 'Rotring', 'Pilot', 'Pentel', 'Uni', 'Zebra', 'Moleskine'];

let idCounter = 1;
let sqlCommands = `-- Seed 120 Products into Supabase
-- Run this in your Supabase SQL Editor
BEGIN;
`;

dummyCategories.forEach((category) => {
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

    const price = (basePrice + (Math.random() * 5)).toFixed(2);
    let categoryPrefix = category.replace(/\s+/g, '').substring(0,3).toUpperCase();
    if (category === 'Pencils') categoryPrefix = 'PNC'; // Make unique from Pens(PEN)
    
    const escapedName = `${brand} ${baseName}`.replace(/'/g, "''");
    
    // We lookup the category ID by name
    sqlCommands += `
INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  '${escapedName}', 
  'KAB-${categoryPrefix}-00${i}', 
  (SELECT id FROM categories WHERE name = '${category}' LIMIT 1), 
  ${price}, 
  100, 
  'Premium quality ${escapedName} designed for daily use.'
);
`;
  }
});

sqlCommands += `COMMIT;\n`;

fs.writeFileSync('seed_products.sql', sqlCommands);
console.log('Successfully generated seed_products.sql');
