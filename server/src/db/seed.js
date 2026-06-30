'use strict';
/* Seeds PostgreSQL (via Prisma) with taxonomy, locations, reference catalogs, demo users
   and listings. Run AFTER migrating the schema:  npm run prisma:migrate  then  npm run seed
   (or just `npm run setup` which does generate + migrate + seed). Safe to re-run — it truncates first. */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');
const { TAXONOMY, LOCATIONS, buildReferenceItems } = require('./seedData');
const categorySchema = require('../schema/categorySchema');
const { publicListingId, publicUserId } = require('../utils/helpers');

const SCHEMA_IDS = new Set(categorySchema.listSchemaCategoryIds());
const img = (seed, w = 1000, h = 750) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
const rupees = (r) => Math.round(r * 100); // -> minor units

function flattenCategories() {
  const parents = [];
  const leaves = [];
  TAXONOMY.forEach((top, ti) => {
    parents.push({
      id: top.id, parentId: null, slug: top.id, label: top.label, icon: top.icon,
      listingKind: 'good', priceTypesAllowed: ['fixed', 'negotiable'], sortOrder: ti, isLeaf: false, isActive: true,
    });
    (top.children || []).forEach((leaf, li) => {
      leaves.push({
        id: leaf.id, parentId: top.id, slug: leaf.id, label: leaf.label, icon: top.icon,
        listingKind: leaf.listingKind || 'good',
        priceTypesAllowed: leaf.priceTypesAllowed || ['fixed', 'negotiable'],
        schemaRef: leaf.schemaRef || null,
        hasSchema: !!leaf.schemaRef,
        sortOrder: li, isLeaf: true, isActive: true,
      });
    });
  });
  return { parents, leaves };
}

// Demo users
const USERS = [
  { key: 'ali', name: 'Ali Imran', email: 'ali@bazaario.pk', phone: '+923001234567', cityId: 'pk.punjab.lahore', trustTier: 'VERIFIED', isPhoneVerified: true, bio: 'Selling quality used items in Lahore.' },
  { key: 'sara', name: 'Sara Khan', email: 'sara@bazaario.pk', phone: '+923009876543', cityId: 'pk.sindh.karachi', trustTier: 'ACTIVE', isPhoneVerified: true, bio: 'Karachi based. Quick replies.' },
  { key: 'autos', name: 'Premium Autos', email: 'sales@premiumautos.pk', phone: '+923111222333', cityId: 'pk.ict.islamabad', trustTier: 'VERIFIED', isBusiness: true, businessName: 'Premium Autos', isPhoneVerified: true, bio: 'Certified used car dealership. Inspection on request.' },
  { key: 'estates', name: 'Skyline Estates', email: 'info@skyline.pk', phone: '+923211222333', cityId: 'pk.punjab.lahore', trustTier: 'VERIFIED', isBusiness: true, businessName: 'Skyline Estates', isPhoneVerified: true, bio: 'Real estate experts — DHA & Bahria.' },
  { key: 'gadgets', name: 'Gadget Hub', email: 'shop@gadgethub.pk', phone: '+923451222333', cityId: 'pk.sindh.karachi', trustTier: 'VERIFIED', isBusiness: true, businessName: 'Gadget Hub', isPhoneVerified: true, bio: 'Mobiles, tablets & accessories. PTA approved stock.' },
  { key: 'admin', name: 'Bazaario Admin', email: 'admin@bazaario.pk', phone: '+923000000000', cityId: 'pk.ict.islamabad', role: 'ADMIN', trustTier: 'VERIFIED', isPhoneVerified: true },
];

// Listing fixtures
function listingFixtures() {
  return [
    // ---- Cars ----
    { seller: 'autos', categoryId: 'vehicles.cars', loc: 'pk.ict.islamabad', featured: true, priceType: 'negotiable',
      title: 'Toyota Corolla Altis Grande 2021 — Single Owner', price: 7150000, condition: 'used', n: 5,
      desc: 'Immaculate Corolla Altis Grande 1.8, automatic, full original condition. Total genuine, complete file. First owner, non-accidental. Serious buyers only.',
      attrs: { make_id: 'toyota', model_id: 'toyota_corolla', condition: 'used', model_year: 2021, mileage_km: 38000, fuel: 'petrol', transmission: 'automatic', body_type: 'sedan', registration_city_id: 'islamabad', documents: 'original', assembly: 'local', color: 'white', seats: 5, owners: 1, features: ['abs', 'air_bags', 'air_conditioning', 'alloy_rims', 'cruise_control', 'navigation', 'power_steering', 'power_windows', 'keyless_entry'] } },
    { seller: 'sara', categoryId: 'vehicles.cars', loc: 'pk.sindh.karachi', priceType: 'negotiable',
      title: 'Honda Civic Oriel 2019 UG — Excellent Condition', price: 6450000, condition: 'used', n: 4,
      desc: 'Honda Civic 1.8 i-VTEC Oriel, sunroof, original paint, well maintained. Lady driven. New tyres fitted recently.',
      attrs: { make_id: 'honda', model_id: 'honda_civic', condition: 'used', model_year: 2019, mileage_km: 61000, fuel: 'petrol', transmission: 'automatic', body_type: 'sedan', registration_city_id: 'karachi', documents: 'original', assembly: 'local', color: 'black', seats: 5, owners: 2, features: ['abs', 'air_bags', 'sun_roof', 'alloy_rims', 'power_windows', 'rear_camera'] } },
    { seller: 'autos', categoryId: 'vehicles.cars', loc: 'pk.ict.islamabad', featured: true, priceType: 'fixed',
      title: 'Suzuki Alto VXL AGS 2022 — Like New', price: 3050000, condition: 'used', n: 4,
      desc: 'Suzuki Alto VXL AGS, automatic, factory fitted AC and power steering. Low mileage, total genuine.',
      attrs: { make_id: 'suzuki', model_id: 'suzuki_alto', condition: 'used', model_year: 2022, mileage_km: 19000, fuel: 'petrol', transmission: 'automatic', body_type: 'hatchback', registration_city_id: 'islamabad', documents: 'original', assembly: 'local', color: 'silver', seats: 4, owners: 1, features: ['air_conditioning', 'power_steering', 'power_windows', 'alloy_rims'] } },
    { seller: 'ali', categoryId: 'vehicles.cars', loc: 'pk.punjab.lahore', priceType: 'negotiable',
      title: 'Kia Sportage AWD 2021 — Top of the Line', price: 8900000, condition: 'used', n: 5,
      desc: 'Kia Sportage AWD, panoramic sunroof, 360 camera, fully loaded. Showroom condition.',
      attrs: { make_id: 'kia', model_id: 'kia_sportage', condition: 'used', model_year: 2021, mileage_km: 45000, fuel: 'petrol', transmission: 'automatic', body_type: 'suv', registration_city_id: 'lahore', documents: 'original', assembly: 'local', color: 'grey', seats: 5, owners: 1, features: ['abs', 'air_bags', 'sun_roof', 'navigation', 'rear_camera', 'cruise_control', 'keyless_entry', 'alloy_rims'] } },

    // ---- Mobiles ----
    { seller: 'gadgets', categoryId: 'mobiles.mobile_phones', loc: 'pk.sindh.karachi', featured: true, priceType: 'fixed',
      title: 'Apple iPhone 14 Pro Max 256GB PTA Approved', price: 389000, condition: 'used', n: 4,
      desc: 'iPhone 14 Pro Max, Deep Purple, 256GB, PTA approved with all accessories. Battery health 92%. 10/10 condition with box.',
      attrs: { brand_id: 'apple', model_id: 'apple_iphone_14', condition: 'used', pta_status: 'pta_approved', storage_gb: 256, ram_gb: 6, warranty: 'none' } },
    { seller: 'sara', categoryId: 'mobiles.mobile_phones', loc: 'pk.sindh.karachi', priceType: 'negotiable',
      title: 'Samsung Galaxy S23 Ultra 12/256 — With Box', price: 245000, condition: 'used', n: 3,
      desc: 'Galaxy S23 Ultra, Green, 12GB/256GB, dual PTA approved. S-Pen included. Minor signs of use, fully functional.',
      attrs: { brand_id: 'samsung', model_id: 'samsung_galaxy_s23', condition: 'used', pta_status: 'pta_approved', storage_gb: 256, ram_gb: 12, warranty: 'none' } },
    { seller: 'gadgets', categoryId: 'mobiles.mobile_phones', loc: 'pk.sindh.karachi', priceType: 'fixed',
      title: 'Xiaomi Redmi Note 13 Pro 8/256 — Brand New', price: 74999, condition: 'new', n: 3,
      desc: 'Brand new sealed Redmi Note 13 Pro, 8GB/256GB, PTA approved, 1 year local warranty. All colors available.',
      attrs: { brand_id: 'xiaomi', model_id: 'xiaomi_redmi_note_13', condition: 'new', pta_status: 'pta_approved', storage_gb: 256, ram_gb: 8, warranty: 'local_manufacturer' } },
    { seller: 'ali', categoryId: 'mobiles.mobile_phones', loc: 'pk.punjab.lahore', priceType: 'negotiable',
      title: 'iPhone 11 64GB Non-PTA — Factory Unlocked', price: 79000, condition: 'used', n: 3,
      desc: 'iPhone 11 white 64GB, non-PTA (factory unlocked). Clean condition, battery 84%. Patched for calls.',
      attrs: { brand_id: 'apple', model_id: 'apple_iphone_11', condition: 'used', pta_status: 'non_pta', storage_gb: 64, ram_gb: 4, warranty: 'none' } },

    // ---- Motorcycles ----
    { seller: 'ali', categoryId: 'bikes.motorcycles', loc: 'pk.punjab.lahore', priceType: 'fixed',
      title: 'Honda CG 125 2023 — Self Start', price: 232000, condition: 'used', n: 3,
      desc: 'Honda CG 125 model 2023, original condition, complete documents. Genuine mileage.',
      attrs: { make_id: 'honda', model_id: 'honda_cg_125', model_year: 2023, condition: 'used', mileage_km: 9000, engine_cc: 125, registration_city_id: 'lahore', documents: 'original' } },
    { seller: 'sara', categoryId: 'bikes.motorcycles', loc: 'pk.sindh.karachi', featured: true, priceType: 'negotiable',
      title: 'Yamaha YBR 125G 2022 — Mint Condition', price: 305000, condition: 'used', n: 3,
      desc: 'Yamaha YBR 125G, 2022, first owner. Maintained by company workshop. Smoke-free engine.',
      attrs: { make_id: 'yamaha', model_id: 'yamaha_ybr_125g', model_year: 2022, condition: 'used', mileage_km: 12500, engine_cc: 125, registration_city_id: 'karachi', documents: 'original' } },

    // ---- Property for sale: Houses ----
    { seller: 'estates', categoryId: 'property_for_sale.houses', loc: 'pk.punjab.lahore', featured: true, priceType: 'negotiable',
      title: '10 Marla Brand New House DHA Phase 6 Lahore', price: 62500000, condition: null, n: 6,
      desc: 'Brand new luxury 10 marla house in DHA Phase 6. 5 bedrooms with attached baths, double unit, basement, modern kitchen. Prime location near park.',
      attrs: { furnishing: 'unfurnished', bedrooms: 5, bathrooms: 6, construction_state: 'finished', area_value: 10, area_unit: 'marla', features: ['kitchen', 'drawing_room', 'dining_room', 'lounge', 'store_room', 'servant_quarters', 'prayer_room'] } },
    { seller: 'estates', categoryId: 'property_for_sale.houses', loc: 'pk.ict.islamabad', priceType: 'contact_for_price',
      title: '1 Kanal Designer House Bahria Town Islamabad', price: 0, condition: null, n: 5,
      desc: 'Stunning 1 kanal designer bungalow in Bahria Town. Home theater, swimming pool, smart home automation. Price on demand for serious clients.',
      attrs: { furnishing: 'semi_furnished', bedrooms: 6, bathrooms: 7, construction_state: 'finished', area_value: 1, area_unit: 'kanal', features: ['kitchen', 'drawing_room', 'dining_room', 'lounge', 'gym', 'study_room', 'servant_quarters', 'steam_room'] } },

    // ---- Property for rent: Apartments ----
    { seller: 'sara', categoryId: 'property_for_rent.apartments', loc: 'pk.sindh.karachi', priceType: 'fixed',
      title: '2 Bed Furnished Apartment for Rent Clifton', price: 130000, condition: null, n: 5,
      desc: 'Fully furnished 2 bedroom apartment in Clifton Block 2. Sea-facing, 24/7 security, lift, standby generator. Monthly rent.',
      attrs: { rent_period: 'monthly', furnishing: 'furnished', bedrooms: 2, bathrooms: 2, floor_level: 7, area_value: 1400, area_unit: 'square_foot', features: ['kitchen', 'lounge', 'drawing_room'] } },
    { seller: 'estates', categoryId: 'property_for_rent.apartments', loc: 'pk.punjab.lahore', featured: true, priceType: 'fixed',
      title: 'Studio Apartment for Rent Gulberg — Brand New', price: 65000, condition: null, n: 4,
      desc: 'Brand new fully furnished studio apartment in Gulberg. Ideal for bachelors/small family. All bills separate.',
      attrs: { rent_period: 'monthly', furnishing: 'furnished', bedrooms: 1, bathrooms: 1, floor_level: 3, area_value: 650, area_unit: 'square_foot', features: ['kitchen', 'lounge'] } },

    // ---- Land & Plots ----
    { seller: 'estates', categoryId: 'property_for_sale.land_plots', loc: 'pk.ict.islamabad', priceType: 'negotiable',
      title: '5 Marla Residential Plot Bahria Enclave Islamabad', price: 9800000, condition: null, n: 3,
      desc: '5 marla residential plot in Bahria Enclave, Sector C. Possession available, all utilities. Park facing corner.',
      attrs: { plot_type: 'residential_plot', area_value: 5, area_unit: 'marla', features: ['electricity', 'water_supply', 'sewerage', 'corner_plot', 'park_facing'], ownership_status: 'registered' } },

    // ---- Jobs ----
    { seller: 'gadgets', categoryId: 'jobs.it', loc: 'pk.sindh.karachi', priceType: null, free: true,
      title: 'Hiring React Native Developer — 2+ Years Experience', price: 0, condition: null, n: 0,
      desc: 'We are looking for a skilled React Native developer to build cross-platform mobile apps. Strong JS/TS, REST APIs, and Git required. Competitive salary + benefits.',
      attrs: { employer_name: 'Gadget Hub (Pvt) Ltd', position_type: 'full_time', workplace_mode: 'onsite', salary_min_minor: rupees(120000), salary_max_minor: rupees(220000), salary_period: 'monthly', experience_min_years: 2, education_level: 'bachelors', application_method: 'platform_chat' } },
    { seller: 'autos', categoryId: 'jobs.sales', loc: 'pk.ict.islamabad', priceType: null, free: true,
      title: 'Sales Executive Required — Automobile Showroom', price: 0, condition: null, n: 0,
      desc: 'Premium Autos needs energetic sales executives. Must have good communication skills. Commission on every sale plus base salary.',
      attrs: { employer_name: 'Premium Autos', position_type: 'full_time', workplace_mode: 'onsite', salary_min_minor: rupees(50000), salary_max_minor: rupees(90000), salary_period: 'monthly', experience_min_years: 1, education_level: 'intermediate', application_method: 'verified_phone' } },

    // ---- Services ----
    { seller: 'ali', categoryId: 'services.repair', loc: 'pk.punjab.lahore', priceType: 'range',
      title: 'AC Installation & Repair Services — All Brands', price: 2500, condition: null, n: 3,
      desc: 'Professional AC installation, gas refilling, servicing and repair for all brands. Same-day service across Lahore. Trained technicians.',
      attrs: { provider_type: 'individual', price_model: 'per_visit', service_area_ids: ['pk.punjab.lahore'], availability: ['weekdays', 'weekends'] } },
    { seller: 'sara', categoryId: 'services.movers', loc: 'pk.sindh.karachi', priceType: 'quote_required',
      title: 'Movers & Packers — Home & Office Shifting', price: 0, condition: null, n: 3,
      desc: 'Reliable home and office shifting with trained labour, covered trucks and packing material. Insurance available. Free survey.',
      attrs: { provider_type: 'business', price_model: 'quote_required', service_area_ids: ['pk.sindh.karachi'], availability: ['twenty_four_seven'] } },

    // ---- Electronics (generic) ----
    { seller: 'gadgets', categoryId: 'electronics.computers', loc: 'pk.sindh.karachi', featured: true, priceType: 'negotiable',
      title: 'MacBook Air M2 2023 8/256 — Warranty', price: 285000, condition: 'used', n: 4, brand: 'Apple',
      desc: 'MacBook Air M2 chip, 8GB/256GB, Midnight. Cycle count 80. With charger and box. AppleCare till 2025.',
      attrs: { condition: 'used', brand: 'Apple' } },
    { seller: 'ali', categoryId: 'electronics.tvs', loc: 'pk.punjab.lahore', priceType: 'fixed',
      title: 'Samsung 55" Crystal UHD 4K Smart TV', price: 135000, condition: 'used', n: 3, brand: 'Samsung',
      desc: 'Samsung 55 inch 4K UHD smart TV, excellent picture, no dead pixels. With original remote and stand.',
      attrs: { condition: 'used', brand: 'Samsung' } },
    { seller: 'sara', categoryId: 'electronics.ac_coolers', loc: 'pk.sindh.karachi', priceType: 'negotiable',
      title: 'Haier 1.5 Ton DC Inverter AC — Heat & Cool', price: 98000, condition: 'used', n: 2, brand: 'Haier',
      desc: 'Haier 1.5 ton DC inverter AC, heat and cool, low electricity consumption. Working perfectly with remote.',
      attrs: { condition: 'used', brand: 'Haier' } },

    // ---- Furniture (generic) ----
    { seller: 'ali', categoryId: 'furniture.sofas', loc: 'pk.punjab.lahore', priceType: 'negotiable',
      title: '7 Seater L-Shaped Sofa Set — Premium Fabric', price: 85000, condition: 'used', n: 3,
      desc: 'Elegant 7 seater L-shaped sofa in premium grey fabric. Solid wood frame. Light usage, smoke-free home.',
      attrs: { condition: 'used' } },
    { seller: 'sara', categoryId: 'furniture.beds', loc: 'pk.sindh.karachi', priceType: 'fixed',
      title: 'King Size Bed with Side Tables — Sheesham Wood', price: 62000, condition: 'used', n: 3,
      desc: 'Solid sheesham wood king size bed with two side tables. Strong and durable. No termite.',
      attrs: { condition: 'used' } },

    // ---- Fashion (generic) ----
    { seller: 'sara', categoryId: 'fashion.watches', loc: 'pk.sindh.karachi', priceType: 'negotiable',
      title: 'Casio Edifice Chronograph — Original', price: 18500, condition: 'used', n: 2,
      desc: 'Original Casio Edifice chronograph, stainless steel, working 100%. Minor wear on strap.',
      attrs: { condition: 'used' } },

    // ---- Animals (generic) ----
    { seller: 'ali', categoryId: 'animals.cats', loc: 'pk.punjab.lahore', priceType: 'negotiable',
      title: 'Persian Kittens — Triple Coat, Vaccinated', price: 25000, condition: null, n: 3,
      desc: 'Beautiful triple coat Persian kittens, litter trained and vaccinated. Healthy and playful. Pair available.',
      attrs: {} },
  ];
}

async function run() {
  console.log('Connecting to PostgreSQL...');
  await prisma.$connect();

  console.log('Clearing existing data...');
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "messages","conversations","favourites","saved_searches","reports","listing_media","listings","reference_items","categories","locations","users" RESTART IDENTITY CASCADE'
  );

  // Categories — parents first (self-referencing FK)
  const { parents, leaves } = flattenCategories();
  await prisma.category.createMany({ data: parents });
  await prisma.category.createMany({ data: leaves });
  console.log(`Seeded ${parents.length + leaves.length} categories`);

  // Locations — array is already ordered country -> province -> city -> area
  await prisma.location.createMany({ data: LOCATIONS });
  console.log(`Seeded ${LOCATIONS.length} locations`);

  // Reference catalogs
  const refs = buildReferenceItems();
  await prisma.referenceItem.createMany({ data: refs });
  console.log(`Seeded ${refs.length} reference items`);

  // Users (created individually to capture ids)
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const userByKey = {};
  for (const u of USERS) {
    const created = await prisma.user.create({
      data: {
        publicId: publicUserId(), name: u.name, email: u.email, phone: u.phone, passwordHash,
        cityId: u.cityId, bio: u.bio || null, trustTier: u.trustTier || 'ACTIVE',
        isBusiness: !!u.isBusiness, businessName: u.businessName || null,
        isPhoneVerified: !!u.isPhoneVerified, role: u.role || 'USER',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
      },
    });
    userByKey[u.key] = created;
  }
  console.log(`Seeded ${USERS.length} users (password: Password123!)`);

  // Listings
  const fixtures = listingFixtures();
  const leafById = Object.fromEntries(leaves.map((c) => [c.id, c]));
  const now = Date.now();
  let count = 0;
  for (let i = 0; i < fixtures.length; i++) {
    const f = fixtures[i];
    const cat = leafById[f.categoryId];
    const schemaId = (cat && cat.schemaRef) || f.categoryId;

    // Normalize attributes via the schema engine when a detailed schema exists.
    let attributes = f.attrs || {};
    if (SCHEMA_IDS.has(schemaId)) {
      const { errors, attributes: norm } = categorySchema.validateAndNormalize(schemaId, f.attrs, null);
      if (Object.keys(errors).length) console.warn(`  ! ${f.title}: attr issues`, errors);
      attributes = norm;
      if (f.brand) attributes.brand = f.brand;
    } else if (f.brand) {
      attributes = { ...attributes, brand: f.brand };
    }

    const publishedAt = new Date(now - i * 3600_000 * 7); // stagger freshness
    const seller = userByKey[f.seller];
    const media = [];
    for (let m = 0; m < (f.n || 0); m++) media.push({ url: img(`${f.categoryId}-${i}-${m}`), sortOrder: m });

    await prisma.listing.create({
      data: {
        publicId: publicListingId(),
        userId: seller.id,
        categoryId: f.categoryId,
        title: f.title,
        description: f.desc,
        priceMinor: BigInt(f.price ? rupees(f.price) : 0),
        priceType: f.priceType || (f.free ? 'free' : 'fixed'),
        currency: 'PKR',
        condition: f.condition || attributes.condition || null,
        locationId: f.loc,
        attributes,
        schemaVersion: categorySchema.schemaVersion,
        state: 'ACTIVE',
        isFeatured: !!f.featured,
        featuredUntil: f.featured ? new Date(now + 14 * 86400000) : null,
        viewCount: Math.floor(Math.random() * 900) + 25,
        favouriteCount: Math.floor(Math.random() * 40),
        publishedAt,
        expiresAt: new Date(publishedAt.getTime() + 30 * 86400000),
        media: media.length ? { create: media } : undefined,
      },
    });
    count++;
  }
  console.log(`Seeded ${count} listings`);

  console.log('\nDone. Demo logins (password: Password123!):');
  console.log('  ali@bazaario.pk            (individual)');
  console.log('  sales@premiumautos.pk      (business)');
  console.log('  admin@bazaario.pk          (admin)\n');
}

run()
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
