-- Seed 120 Products into Supabase
-- Run this in your Supabase SQL Editor
BEGIN;

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Lamy Bestseller Item 1', 
  'KAB-POP-001', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  21.08, 
  100, 
  'Premium quality Lamy Bestseller Item 1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Bestseller Item 2', 
  'KAB-POP-002', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  20.49, 
  100, 
  'Premium quality Zebra Bestseller Item 2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Bestseller Item 3', 
  'KAB-POP-003', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  21.87, 
  100, 
  'Premium quality Faber-Castell Bestseller Item 3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Bestseller Item 4', 
  'KAB-POP-004', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  22.40, 
  100, 
  'Premium quality Zebra Bestseller Item 4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Bestseller Item 5', 
  'KAB-POP-005', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  21.44, 
  100, 
  'Premium quality Faber-Castell Bestseller Item 5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Lamy Bestseller Item 6', 
  'KAB-POP-006', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  23.70, 
  100, 
  'Premium quality Lamy Bestseller Item 6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Bestseller Item 7', 
  'KAB-POP-007', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  20.09, 
  100, 
  'Premium quality Pilot Bestseller Item 7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Bestseller Item 8', 
  'KAB-POP-008', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  24.59, 
  100, 
  'Premium quality Muji Bestseller Item 8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Bestseller Item 9', 
  'KAB-POP-009', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  20.12, 
  100, 
  'Premium quality Faber-Castell Bestseller Item 9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Bestseller Item 10', 
  'KAB-POP-0010', 
  (SELECT id FROM categories WHERE name = 'Popular' LIMIT 1), 
  23.72, 
  100, 
  'Premium quality Tombow Bestseller Item 10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Graphite Pro 1H', 
  'KAB-PNC-001', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  4.92, 
  100, 
  'Premium quality Rotring Graphite Pro 1H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Graphite Pro 2H', 
  'KAB-PNC-002', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  6.53, 
  100, 
  'Premium quality Faber-Castell Graphite Pro 2H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Graphite Pro 3H', 
  'KAB-PNC-003', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  3.56, 
  100, 
  'Premium quality Pilot Graphite Pro 3H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Graphite Pro 4H', 
  'KAB-PNC-004', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  2.11, 
  100, 
  'Premium quality Pilot Graphite Pro 4H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Moleskine Graphite Pro 5H', 
  'KAB-PNC-005', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  6.95, 
  100, 
  'Premium quality Moleskine Graphite Pro 5H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Graphite Pro 6H', 
  'KAB-PNC-006', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  3.26, 
  100, 
  'Premium quality Tombow Graphite Pro 6H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Graphite Pro 7H', 
  'KAB-PNC-007', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  3.21, 
  100, 
  'Premium quality Zebra Graphite Pro 7H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Graphite Pro 8H', 
  'KAB-PNC-008', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  3.21, 
  100, 
  'Premium quality Uni Graphite Pro 8H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Graphite Pro 9H', 
  'KAB-PNC-009', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  2.19, 
  100, 
  'Premium quality Tombow Graphite Pro 9H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Graphite Pro 10H', 
  'KAB-PNC-0010', 
  (SELECT id FROM categories WHERE name = 'Pencils' LIMIT 1), 
  6.81, 
  100, 
  'Premium quality Pentel Graphite Pro 10H designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Gel Ink Fineliner 0.4mm', 
  'KAB-PEN-001', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  8.65, 
  100, 
  'Premium quality Muji Gel Ink Fineliner 0.4mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Gel Ink Fineliner 0.5mm', 
  'KAB-PEN-002', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  6.02, 
  100, 
  'Premium quality Rotring Gel Ink Fineliner 0.5mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Gel Ink Fineliner 0.6mm', 
  'KAB-PEN-003', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  5.45, 
  100, 
  'Premium quality Rotring Gel Ink Fineliner 0.6mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Gel Ink Fineliner 0.7mm', 
  'KAB-PEN-004', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  6.78, 
  100, 
  'Premium quality Zebra Gel Ink Fineliner 0.7mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Gel Ink Fineliner 0.3mm', 
  'KAB-PEN-005', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  6.57, 
  100, 
  'Premium quality Zebra Gel Ink Fineliner 0.3mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Gel Ink Fineliner 0.4mm', 
  'KAB-PEN-006', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  8.78, 
  100, 
  'Premium quality Faber-Castell Gel Ink Fineliner 0.4mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Gel Ink Fineliner 0.5mm', 
  'KAB-PEN-007', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  6.75, 
  100, 
  'Premium quality Zebra Gel Ink Fineliner 0.5mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Gel Ink Fineliner 0.6mm', 
  'KAB-PEN-008', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  6.98, 
  100, 
  'Premium quality Faber-Castell Gel Ink Fineliner 0.6mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Gel Ink Fineliner 0.7mm', 
  'KAB-PEN-009', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  6.64, 
  100, 
  'Premium quality Rotring Gel Ink Fineliner 0.7mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Gel Ink Fineliner 0.3mm', 
  'KAB-PEN-0010', 
  (SELECT id FROM categories WHERE name = 'Pens' LIMIT 1), 
  4.45, 
  100, 
  'Premium quality Faber-Castell Gel Ink Fineliner 0.3mm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Dust-Free Block Mini-1', 
  'KAB-ERA-001', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  4.00, 
  100, 
  'Premium quality Zebra Dust-Free Block Mini-1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Dust-Free Block Mini-2', 
  'KAB-ERA-002', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  2.33, 
  100, 
  'Premium quality Pentel Dust-Free Block Mini-2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Dust-Free Block Mini-3', 
  'KAB-ERA-003', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  2.90, 
  100, 
  'Premium quality Tombow Dust-Free Block Mini-3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Lamy Dust-Free Block Mini-4', 
  'KAB-ERA-004', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  4.77, 
  100, 
  'Premium quality Lamy Dust-Free Block Mini-4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Dust-Free Block Mini-5', 
  'KAB-ERA-005', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  1.77, 
  100, 
  'Premium quality Rotring Dust-Free Block Mini-5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Dust-Free Block Mini-6', 
  'KAB-ERA-006', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  4.71, 
  100, 
  'Premium quality Muji Dust-Free Block Mini-6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Dust-Free Block Mini-7', 
  'KAB-ERA-007', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  5.65, 
  100, 
  'Premium quality Uni Dust-Free Block Mini-7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Moleskine Dust-Free Block Mini-8', 
  'KAB-ERA-008', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  4.62, 
  100, 
  'Premium quality Moleskine Dust-Free Block Mini-8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Dust-Free Block Mini-9', 
  'KAB-ERA-009', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  1.79, 
  100, 
  'Premium quality Pentel Dust-Free Block Mini-9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Dust-Free Block Mini-10', 
  'KAB-ERA-0010', 
  (SELECT id FROM categories WHERE name = 'Erasers' LIMIT 1), 
  6.27, 
  100, 
  'Premium quality Pilot Dust-Free Block Mini-10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Moleskine Precision Ruler 10cm', 
  'KAB-VAR-001', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  10.87, 
  100, 
  'Premium quality Moleskine Precision Ruler 10cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Precision Ruler 20cm', 
  'KAB-VAR-002', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  9.77, 
  100, 
  'Premium quality Pentel Precision Ruler 20cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Precision Ruler 30cm', 
  'KAB-VAR-003', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  10.39, 
  100, 
  'Premium quality Tombow Precision Ruler 30cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Precision Ruler 40cm', 
  'KAB-VAR-004', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  6.00, 
  100, 
  'Premium quality Pentel Precision Ruler 40cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Precision Ruler 50cm', 
  'KAB-VAR-005', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  10.55, 
  100, 
  'Premium quality Zebra Precision Ruler 50cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Precision Ruler 60cm', 
  'KAB-VAR-006', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  10.97, 
  100, 
  'Premium quality Uni Precision Ruler 60cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Precision Ruler 70cm', 
  'KAB-VAR-007', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  8.60, 
  100, 
  'Premium quality Zebra Precision Ruler 70cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Moleskine Precision Ruler 80cm', 
  'KAB-VAR-008', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  10.98, 
  100, 
  'Premium quality Moleskine Precision Ruler 80cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Precision Ruler 90cm', 
  'KAB-VAR-009', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  9.00, 
  100, 
  'Premium quality Faber-Castell Precision Ruler 90cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Precision Ruler 100cm', 
  'KAB-VAR-0010', 
  (SELECT id FROM categories WHERE name = 'Various Tools' LIMIT 1), 
  10.46, 
  100, 
  'Premium quality Pentel Precision Ruler 100cm designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Tape Runner Pro V1', 
  'KAB-COR-001', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  6.61, 
  100, 
  'Premium quality Faber-Castell Tape Runner Pro V1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Tape Runner Pro V2', 
  'KAB-COR-002', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  6.95, 
  100, 
  'Premium quality Uni Tape Runner Pro V2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Lamy Tape Runner Pro V3', 
  'KAB-COR-003', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  5.17, 
  100, 
  'Premium quality Lamy Tape Runner Pro V3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Tape Runner Pro V4', 
  'KAB-COR-004', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  7.69, 
  100, 
  'Premium quality Uni Tape Runner Pro V4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Tape Runner Pro V5', 
  'KAB-COR-005', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  7.37, 
  100, 
  'Premium quality Muji Tape Runner Pro V5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Tape Runner Pro V6', 
  'KAB-COR-006', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  3.65, 
  100, 
  'Premium quality Muji Tape Runner Pro V6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Tape Runner Pro V7', 
  'KAB-COR-007', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  6.06, 
  100, 
  'Premium quality Tombow Tape Runner Pro V7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Tape Runner Pro V8', 
  'KAB-COR-008', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  7.37, 
  100, 
  'Premium quality Muji Tape Runner Pro V8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Tape Runner Pro V9', 
  'KAB-COR-009', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  7.31, 
  100, 
  'Premium quality Pentel Tape Runner Pro V9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Tape Runner Pro V10', 
  'KAB-COR-0010', 
  (SELECT id FROM categories WHERE name = 'Correction' LIMIT 1), 
  3.52, 
  100, 
  'Premium quality Zebra Tape Runner Pro V10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow A5 Grid Journal', 
  'KAB-NOT-001', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  13.59, 
  100, 
  'Premium quality Tombow A5 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot A6 Grid Journal', 
  'KAB-NOT-002', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  16.86, 
  100, 
  'Premium quality Pilot A6 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell A4 Grid Journal', 
  'KAB-NOT-003', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  14.11, 
  100, 
  'Premium quality Faber-Castell A4 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell A5 Grid Journal', 
  'KAB-NOT-004', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  15.52, 
  100, 
  'Premium quality Faber-Castell A5 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni A6 Grid Journal', 
  'KAB-NOT-005', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  12.99, 
  100, 
  'Premium quality Uni A6 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel A4 Grid Journal', 
  'KAB-NOT-006', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  15.90, 
  100, 
  'Premium quality Pentel A4 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring A5 Grid Journal', 
  'KAB-NOT-007', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  14.60, 
  100, 
  'Premium quality Rotring A5 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell A6 Grid Journal', 
  'KAB-NOT-008', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  14.98, 
  100, 
  'Premium quality Faber-Castell A6 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel A4 Grid Journal', 
  'KAB-NOT-009', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  13.01, 
  100, 
  'Premium quality Pentel A4 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring A5 Grid Journal', 
  'KAB-NOT-0010', 
  (SELECT id FROM categories WHERE name = 'Notebooks' LIMIT 1), 
  16.58, 
  100, 
  'Premium quality Rotring A5 Grid Journal designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Field Notes A6 Vol.1', 
  'KAB-POC-001', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  12.21, 
  100, 
  'Premium quality Tombow Field Notes A6 Vol.1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Field Notes A6 Vol.2', 
  'KAB-POC-002', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  10.27, 
  100, 
  'Premium quality Pilot Field Notes A6 Vol.2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Field Notes A6 Vol.3', 
  'KAB-POC-003', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  11.18, 
  100, 
  'Premium quality Faber-Castell Field Notes A6 Vol.3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Field Notes A6 Vol.4', 
  'KAB-POC-004', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  12.65, 
  100, 
  'Premium quality Rotring Field Notes A6 Vol.4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Field Notes A6 Vol.5', 
  'KAB-POC-005', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  8.16, 
  100, 
  'Premium quality Rotring Field Notes A6 Vol.5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Field Notes A6 Vol.6', 
  'KAB-POC-006', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  8.81, 
  100, 
  'Premium quality Rotring Field Notes A6 Vol.6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Field Notes A6 Vol.7', 
  'KAB-POC-007', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  10.57, 
  100, 
  'Premium quality Faber-Castell Field Notes A6 Vol.7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Field Notes A6 Vol.8', 
  'KAB-POC-008', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  10.21, 
  100, 
  'Premium quality Faber-Castell Field Notes A6 Vol.8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Field Notes A6 Vol.9', 
  'KAB-POC-009', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  8.07, 
  100, 
  'Premium quality Rotring Field Notes A6 Vol.9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel Field Notes A6 Vol.10', 
  'KAB-POC-0010', 
  (SELECT id FROM categories WHERE name = 'Pocket Notebooks' LIMIT 1), 
  10.92, 
  100, 
  'Premium quality Pentel Field Notes A6 Vol.10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Advanced Calculus Practice-1', 
  'KAB-MAT-001', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  18.06, 
  100, 
  'Premium quality Muji Advanced Calculus Practice-1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Advanced Calculus Practice-2', 
  'KAB-MAT-002', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  20.63, 
  100, 
  'Premium quality Muji Advanced Calculus Practice-2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Lamy Advanced Calculus Practice-3', 
  'KAB-MAT-003', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  18.07, 
  100, 
  'Premium quality Lamy Advanced Calculus Practice-3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Advanced Calculus Practice-4', 
  'KAB-MAT-004', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  20.26, 
  100, 
  'Premium quality Faber-Castell Advanced Calculus Practice-4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Advanced Calculus Practice-5', 
  'KAB-MAT-005', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  18.77, 
  100, 
  'Premium quality Faber-Castell Advanced Calculus Practice-5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Advanced Calculus Practice-6', 
  'KAB-MAT-006', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  20.31, 
  100, 
  'Premium quality Pilot Advanced Calculus Practice-6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Advanced Calculus Practice-7', 
  'KAB-MAT-007', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  18.35, 
  100, 
  'Premium quality Pilot Advanced Calculus Practice-7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Advanced Calculus Practice-8', 
  'KAB-MAT-008', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  19.31, 
  100, 
  'Premium quality Pilot Advanced Calculus Practice-8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Advanced Calculus Practice-9', 
  'KAB-MAT-009', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  19.33, 
  100, 
  'Premium quality Pilot Advanced Calculus Practice-9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Advanced Calculus Practice-10', 
  'KAB-MAT-0010', 
  (SELECT id FROM categories WHERE name = 'Math Books' LIMIT 1), 
  18.12, 
  100, 
  'Premium quality Tombow Advanced Calculus Practice-10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Moleskine Physics Lab Manual V1', 
  'KAB-SCI-001', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  20.86, 
  100, 
  'Premium quality Moleskine Physics Lab Manual V1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Physics Lab Manual V2', 
  'KAB-SCI-002', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  16.27, 
  100, 
  'Premium quality Zebra Physics Lab Manual V2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Physics Lab Manual V3', 
  'KAB-SCI-003', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  16.51, 
  100, 
  'Premium quality Uni Physics Lab Manual V3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Physics Lab Manual V4', 
  'KAB-SCI-004', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  17.59, 
  100, 
  'Premium quality Pilot Physics Lab Manual V4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Physics Lab Manual V5', 
  'KAB-SCI-005', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  20.95, 
  100, 
  'Premium quality Tombow Physics Lab Manual V5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Physics Lab Manual V6', 
  'KAB-SCI-006', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  16.33, 
  100, 
  'Premium quality Uni Physics Lab Manual V6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Physics Lab Manual V7', 
  'KAB-SCI-007', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  17.17, 
  100, 
  'Premium quality Pilot Physics Lab Manual V7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Physics Lab Manual V8', 
  'KAB-SCI-008', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  18.86, 
  100, 
  'Premium quality Faber-Castell Physics Lab Manual V8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Lamy Physics Lab Manual V9', 
  'KAB-SCI-009', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  20.24, 
  100, 
  'Premium quality Lamy Physics Lab Manual V9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Physics Lab Manual V10', 
  'KAB-SCI-0010', 
  (SELECT id FROM categories WHERE name = 'Science Books' LIMIT 1), 
  18.44, 
  100, 
  'Premium quality Uni Physics Lab Manual V10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra World History Outline Pt.1', 
  'KAB-SOC-001', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  16.17, 
  100, 
  'Premium quality Zebra World History Outline Pt.1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring World History Outline Pt.2', 
  'KAB-SOC-002', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  17.24, 
  100, 
  'Premium quality Rotring World History Outline Pt.2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow World History Outline Pt.3', 
  'KAB-SOC-003', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  15.85, 
  100, 
  'Premium quality Tombow World History Outline Pt.3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni World History Outline Pt.4', 
  'KAB-SOC-004', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  14.50, 
  100, 
  'Premium quality Uni World History Outline Pt.4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Moleskine World History Outline Pt.5', 
  'KAB-SOC-005', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  14.06, 
  100, 
  'Premium quality Moleskine World History Outline Pt.5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell World History Outline Pt.6', 
  'KAB-SOC-006', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  18.80, 
  100, 
  'Premium quality Faber-Castell World History Outline Pt.6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot World History Outline Pt.7', 
  'KAB-SOC-007', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  15.37, 
  100, 
  'Premium quality Pilot World History Outline Pt.7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pentel World History Outline Pt.8', 
  'KAB-SOC-008', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  18.40, 
  100, 
  'Premium quality Pentel World History Outline Pt.8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra World History Outline Pt.9', 
  'KAB-SOC-009', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  15.13, 
  100, 
  'Premium quality Zebra World History Outline Pt.9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell World History Outline Pt.10', 
  'KAB-SOC-0010', 
  (SELECT id FROM categories WHERE name = 'Social Books' LIMIT 1), 
  16.93, 
  100, 
  'Premium quality Faber-Castell World History Outline Pt.10 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Ancient Civilizations Vol.1', 
  'KAB-HIS-001', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  15.82, 
  100, 
  'Premium quality Muji Ancient Civilizations Vol.1 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Ancient Civilizations Vol.2', 
  'KAB-HIS-002', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  17.15, 
  100, 
  'Premium quality Muji Ancient Civilizations Vol.2 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Pilot Ancient Civilizations Vol.3', 
  'KAB-HIS-003', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  15.33, 
  100, 
  'Premium quality Pilot Ancient Civilizations Vol.3 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Faber-Castell Ancient Civilizations Vol.4', 
  'KAB-HIS-004', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  16.37, 
  100, 
  'Premium quality Faber-Castell Ancient Civilizations Vol.4 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Zebra Ancient Civilizations Vol.5', 
  'KAB-HIS-005', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  15.45, 
  100, 
  'Premium quality Zebra Ancient Civilizations Vol.5 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Muji Ancient Civilizations Vol.6', 
  'KAB-HIS-006', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  19.37, 
  100, 
  'Premium quality Muji Ancient Civilizations Vol.6 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Ancient Civilizations Vol.7', 
  'KAB-HIS-007', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  19.68, 
  100, 
  'Premium quality Uni Ancient Civilizations Vol.7 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Rotring Ancient Civilizations Vol.8', 
  'KAB-HIS-008', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  16.64, 
  100, 
  'Premium quality Rotring Ancient Civilizations Vol.8 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Uni Ancient Civilizations Vol.9', 
  'KAB-HIS-009', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  17.82, 
  100, 
  'Premium quality Uni Ancient Civilizations Vol.9 designed for daily use.'
);

INSERT INTO products (name, sku, category_id, price, stock, description) 
VALUES (
  'Tombow Ancient Civilizations Vol.10', 
  'KAB-HIS-0010', 
  (SELECT id FROM categories WHERE name = 'History Books' LIMIT 1), 
  16.48, 
  100, 
  'Premium quality Tombow Ancient Civilizations Vol.10 designed for daily use.'
);
COMMIT;
