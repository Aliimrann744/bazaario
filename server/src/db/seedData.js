'use strict';
/* Static seed data: taxonomy, locations, reference catalogs. Derived from the
   blueprint taxonomy (§6) and the category-schema-reference.json category ids. */

// Top categories + leaves. `schemaRef` links a leaf to a detailed JSON schema.
const TAXONOMY = [
  { id: 'mobiles', label: 'Mobiles', icon: 'smartphone', children: [
    { id: 'mobiles.mobile_phones', label: 'Mobile Phones', schemaRef: 'mobiles.mobile_phones', listingKind: 'good', priceTypesAllowed: ['fixed', 'negotiable'] },
    { id: 'mobiles.tablets', label: 'Tablets', schemaRef: 'mobiles.mobile_phones', listingKind: 'good' },
    { id: 'mobiles.accessories', label: 'Accessories', listingKind: 'good' },
    { id: 'mobiles.smart_watches', label: 'Smart Watches', listingKind: 'good' },
  ]},
  { id: 'vehicles', label: 'Vehicles', icon: 'car', children: [
    { id: 'vehicles.cars', label: 'Cars', schemaRef: 'vehicles.cars', listingKind: 'vehicle', priceTypesAllowed: ['fixed', 'negotiable', 'contact_for_price'] },
    { id: 'vehicles.car_accessories', label: 'Car Accessories', listingKind: 'good' },
    { id: 'vehicles.spare_parts', label: 'Spare Parts', listingKind: 'good' },
    { id: 'vehicles.buses_vans_trucks', label: 'Buses, Vans & Trucks', listingKind: 'vehicle' },
  ]},
  { id: 'property_for_sale', label: 'Property for Sale', icon: 'home', children: [
    { id: 'property_for_sale.houses', label: 'Houses', schemaRef: 'property_for_sale.houses', listingKind: 'property', priceTypesAllowed: ['fixed', 'negotiable', 'contact_for_price'] },
    { id: 'property_for_sale.land_plots', label: 'Land & Plots', schemaRef: 'property_for_sale.land_plots', listingKind: 'property', priceTypesAllowed: ['fixed', 'negotiable', 'contact_for_price'] },
    { id: 'property_for_sale.apartments', label: 'Apartments & Flats', schemaRef: 'property_for_sale.houses', listingKind: 'property' },
    { id: 'property_for_sale.commercial', label: 'Shops, Offices & Commercial', listingKind: 'property' },
  ]},
  { id: 'property_for_rent', label: 'Property for Rent', icon: 'key', children: [
    { id: 'property_for_rent.apartments', label: 'Apartments & Flats', schemaRef: 'property_for_rent.apartments', listingKind: 'property', priceTypesAllowed: ['fixed', 'negotiable', 'contact_for_price'] },
    { id: 'property_for_rent.houses', label: 'Houses', schemaRef: 'property_for_rent.apartments', listingKind: 'property' },
    { id: 'property_for_rent.rooms', label: 'Rooms', schemaRef: 'property_for_rent.apartments', listingKind: 'property' },
    { id: 'property_for_rent.commercial', label: 'Shops & Offices', listingKind: 'property' },
  ]},
  { id: 'electronics', label: 'Electronics & Appliances', icon: 'tv', children: [
    { id: 'electronics.computers', label: 'Computers & Accessories', listingKind: 'good' },
    { id: 'electronics.tvs', label: 'Televisions', listingKind: 'good' },
    { id: 'electronics.ac_coolers', label: 'AC & Coolers', listingKind: 'good' },
    { id: 'electronics.kitchen', label: 'Kitchen Appliances', listingKind: 'good' },
  ]},
  { id: 'bikes', label: 'Bikes', icon: 'bike', children: [
    { id: 'bikes.motorcycles', label: 'Motorcycles', schemaRef: 'bikes.motorcycles', listingKind: 'vehicle', priceTypesAllowed: ['fixed', 'negotiable', 'contact_for_price'] },
    { id: 'bikes.bicycles', label: 'Bicycles', listingKind: 'good' },
    { id: 'bikes.scooters', label: 'Scooters', schemaRef: 'bikes.motorcycles', listingKind: 'vehicle' },
    { id: 'bikes.accessories', label: 'Bike Accessories', listingKind: 'good' },
  ]},
  { id: 'business_industrial', label: 'Business & Industry', icon: 'factory', children: [
    { id: 'business_industrial.machinery', label: 'Industrial Machinery', listingKind: 'good' },
    { id: 'business_industrial.food', label: 'Food & Restaurants', listingKind: 'good' },
    { id: 'business_industrial.business_for_sale', label: 'Business for Sale', listingKind: 'good' },
  ]},
  { id: 'services', label: 'Services', icon: 'wrench', children: [
    { id: 'services.repair', label: 'Home & Office Repair', schemaRef: 'services.generic', listingKind: 'service', priceTypesAllowed: ['fixed', 'range', 'negotiable', 'contact_for_price'] },
    { id: 'services.tuitions', label: 'Tuitions & Academies', schemaRef: 'services.generic', listingKind: 'service' },
    { id: 'services.movers', label: 'Movers & Packers', schemaRef: 'services.generic', listingKind: 'service' },
    { id: 'services.web_dev', label: 'Web Development', schemaRef: 'services.generic', listingKind: 'service' },
  ]},
  { id: 'jobs', label: 'Jobs', icon: 'briefcase', children: [
    { id: 'jobs.it', label: 'IT & Networking', schemaRef: 'jobs.generic', listingKind: 'job', priceTypesAllowed: [] },
    { id: 'jobs.sales', label: 'Sales & Marketing', schemaRef: 'jobs.generic', listingKind: 'job', priceTypesAllowed: [] },
    { id: 'jobs.delivery', label: 'Delivery Riders', schemaRef: 'jobs.generic', listingKind: 'job', priceTypesAllowed: [] },
    { id: 'jobs.customer_service', label: 'Customer Service', schemaRef: 'jobs.generic', listingKind: 'job', priceTypesAllowed: [] },
  ]},
  { id: 'animals', label: 'Animals', icon: 'paw', children: [
    { id: 'animals.dogs', label: 'Dogs', listingKind: 'good' },
    { id: 'animals.cats', label: 'Cats', listingKind: 'good' },
    { id: 'animals.birds', label: 'Birds', listingKind: 'good' },
    { id: 'animals.livestock', label: 'Livestock', listingKind: 'good' },
  ]},
  { id: 'furniture', label: 'Furniture & Decor', icon: 'sofa', children: [
    { id: 'furniture.beds', label: 'Beds & Wardrobes', listingKind: 'good' },
    { id: 'furniture.sofas', label: 'Sofa & Chairs', listingKind: 'good' },
    { id: 'furniture.tables', label: 'Tables & Dining', listingKind: 'good' },
    { id: 'furniture.decor', label: 'Home Decoration', listingKind: 'good' },
  ]},
  { id: 'fashion', label: 'Fashion & Beauty', icon: 'shirt', children: [
    { id: 'fashion.clothes', label: 'Clothes', listingKind: 'good' },
    { id: 'fashion.footwear', label: 'Footwear', listingKind: 'good' },
    { id: 'fashion.watches', label: 'Watches', listingKind: 'good' },
    { id: 'fashion.jewellery', label: 'Jewellery', listingKind: 'good' },
  ]},
  { id: 'books_sports_hobbies', label: 'Books, Sports & Hobbies', icon: 'book', children: [
    { id: 'books_sports_hobbies.books', label: 'Books & Magazines', listingKind: 'good' },
    { id: 'books_sports_hobbies.gym', label: 'Gym & Fitness', listingKind: 'good' },
    { id: 'books_sports_hobbies.sports', label: 'Sports Equipment', listingKind: 'good' },
    { id: 'books_sports_hobbies.music', label: 'Musical Instruments', listingKind: 'good' },
  ]},
  { id: 'kids', label: 'Kids', icon: 'baby', children: [
    { id: 'kids.toys', label: 'Toys', listingKind: 'good' },
    { id: 'kids.baby_gear', label: 'Baby Gear', listingKind: 'good' },
    { id: 'kids.clothing', label: 'Kids Clothing', listingKind: 'good' },
    { id: 'kids.furniture', label: 'Kids Furniture', listingKind: 'good' },
  ]},
];

// Pakistan locations: country -> province -> city -> a few areas.
const LOCATIONS = [
  { id: 'pk', level: 'country', name: 'Pakistan', parentId: null },
  // Provinces
  { id: 'pk.punjab', level: 'province', name: 'Punjab', parentId: 'pk' },
  { id: 'pk.sindh', level: 'province', name: 'Sindh', parentId: 'pk' },
  { id: 'pk.kpk', level: 'province', name: 'Khyber Pakhtunkhwa', parentId: 'pk' },
  { id: 'pk.balochistan', level: 'province', name: 'Balochistan', parentId: 'pk' },
  { id: 'pk.ict', level: 'province', name: 'Islamabad Capital Territory', parentId: 'pk' },
  // Cities
  { id: 'pk.sindh.karachi', level: 'city', name: 'Karachi', parentId: 'pk.sindh', lat: 24.8607, lon: 67.0011 },
  { id: 'pk.punjab.lahore', level: 'city', name: 'Lahore', parentId: 'pk.punjab', lat: 31.5204, lon: 74.3587 },
  { id: 'pk.ict.islamabad', level: 'city', name: 'Islamabad', parentId: 'pk.ict', lat: 33.6844, lon: 73.0479 },
  { id: 'pk.punjab.rawalpindi', level: 'city', name: 'Rawalpindi', parentId: 'pk.punjab', lat: 33.5651, lon: 73.0169 },
  { id: 'pk.punjab.faisalabad', level: 'city', name: 'Faisalabad', parentId: 'pk.punjab', lat: 31.4504, lon: 73.135 },
  { id: 'pk.punjab.multan', level: 'city', name: 'Multan', parentId: 'pk.punjab', lat: 30.1575, lon: 71.5249 },
  { id: 'pk.kpk.peshawar', level: 'city', name: 'Peshawar', parentId: 'pk.kpk', lat: 34.0151, lon: 71.5249 },
  { id: 'pk.balochistan.quetta', level: 'city', name: 'Quetta', parentId: 'pk.balochistan', lat: 30.1798, lon: 66.975 },
  { id: 'pk.sindh.hyderabad', level: 'city', name: 'Hyderabad', parentId: 'pk.sindh', lat: 25.396, lon: 68.3578 },
  { id: 'pk.punjab.gujranwala', level: 'city', name: 'Gujranwala', parentId: 'pk.punjab', lat: 32.1877, lon: 74.1945 },
  // Areas (a few popular ones)
  { id: 'pk.sindh.karachi.dha', level: 'area', name: 'DHA', parentId: 'pk.sindh.karachi' },
  { id: 'pk.sindh.karachi.gulshan', level: 'area', name: 'Gulshan-e-Iqbal', parentId: 'pk.sindh.karachi' },
  { id: 'pk.sindh.karachi.clifton', level: 'area', name: 'Clifton', parentId: 'pk.sindh.karachi' },
  { id: 'pk.punjab.lahore.dha', level: 'area', name: 'DHA', parentId: 'pk.punjab.lahore' },
  { id: 'pk.punjab.lahore.johar', level: 'area', name: 'Johar Town', parentId: 'pk.punjab.lahore' },
  { id: 'pk.punjab.lahore.model', level: 'area', name: 'Model Town', parentId: 'pk.punjab.lahore' },
  { id: 'pk.ict.islamabad.f7', level: 'area', name: 'F-7', parentId: 'pk.ict.islamabad' },
  { id: 'pk.ict.islamabad.bahria', level: 'area', name: 'Bahria Town', parentId: 'pk.ict.islamabad' },
  { id: 'pk.punjab.rawalpindi.satellite', level: 'area', name: 'Satellite Town', parentId: 'pk.punjab.rawalpindi' },
];

// Reference catalogs
const carMakes = ['Toyota', 'Honda', 'Suzuki', 'Kia', 'Hyundai', 'Nissan', 'MG', 'Changan', 'Daihatsu', 'BMW', 'Mercedes', 'Audi'];
const carModels = {
  Toyota: ['Corolla', 'Yaris', 'Fortuner', 'Hilux', 'Land Cruiser', 'Prado'],
  Honda: ['Civic', 'City', 'BR-V', 'HR-V'],
  Suzuki: ['Alto', 'Cultus', 'Wagon R', 'Swift', 'Mehran', 'Bolan'],
  Kia: ['Sportage', 'Picanto', 'Sorento', 'Stonic'],
  Hyundai: ['Tucson', 'Elantra', 'Sonata', 'Porter'],
  Nissan: ['Dayz', 'Note', 'Juke'],
  MG: ['HS', 'ZS', 'MG5'],
  Changan: ['Alsvin', 'Oshan X7', 'Karvaan'],
  Daihatsu: ['Mira', 'Move', 'Hijet'],
  BMW: ['3 Series', '5 Series', 'X5'],
  Mercedes: ['C-Class', 'E-Class', 'GLC'],
  Audi: ['A4', 'A6', 'Q5'],
};
const mobileBrands = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Infinix', 'Tecno', 'Realme', 'OnePlus', 'Google', 'Nokia'];
const mobileModels = {
  Apple: ['iPhone 15 Pro Max', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
  Samsung: ['Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy A55', 'Galaxy A35', 'Galaxy M14'],
  Xiaomi: ['Redmi Note 13', 'Redmi 13C', 'Poco X6', '13T Pro'],
  Oppo: ['Reno 11', 'A78', 'A58'],
  Vivo: ['V30', 'Y36', 'Y27'],
  Infinix: ['Note 40', 'Hot 40', 'Zero 30'],
  Tecno: ['Camon 30', 'Spark 20', 'Pova 6'],
  Realme: ['C67', '12 Pro', 'Narzo 70'],
  OnePlus: ['12R', 'Nord 4', '11'],
  Google: ['Pixel 8', 'Pixel 7a'],
  Nokia: ['G42', 'C32'],
};
const motorcycleMakes = ['Honda', 'Yamaha', 'Suzuki', 'United', 'Road Prince', 'Unique', 'Super Power'];
const motorcycleModels = {
  Honda: ['CD 70', 'CG 125', 'CB 150F', 'Pridor'],
  Yamaha: ['YBR 125', 'YBR 125G', 'YB 125Z'],
  Suzuki: ['GD 110S', 'GS 150', 'GR 150'],
  United: ['US 70', 'US 125'],
  'Road Prince': ['RP 70', 'Wego 70'],
  Unique: ['UD 70', 'Crazy 70'],
  'Super Power': ['SP 70', 'Archi 70'],
};
const regCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Unregistered'];
const carFeatures = ['ABS', 'Air Bags', 'Air Conditioning', 'Alloy Rims', 'Cruise Control', 'Navigation', 'Power Steering', 'Power Windows', 'Sun Roof', 'Rear Camera', 'Keyless Entry'];
const colors = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Maroon', 'Green', 'Beige', 'Gold'];

function buildReferenceItems() {
  const items = [];
  carMakes.forEach((m) => items.push({ catalog: 'car_makes', value: slug(m), label: m }));
  Object.entries(carModels).forEach(([make, models]) =>
    models.forEach((mo) => items.push({ catalog: 'car_models', parentId: slug(make), value: slug(`${make}-${mo}`), label: mo })));
  mobileBrands.forEach((b) => items.push({ catalog: 'mobile_brands', value: slug(b), label: b }));
  Object.entries(mobileModels).forEach(([brand, models]) =>
    models.forEach((mo) => items.push({ catalog: 'mobile_models', parentId: slug(brand), value: slug(`${brand}-${mo}`), label: mo })));
  motorcycleMakes.forEach((m) => items.push({ catalog: 'motorcycle_makes', value: slug(m), label: m }));
  Object.entries(motorcycleModels).forEach(([make, models]) =>
    models.forEach((mo) => items.push({ catalog: 'motorcycle_models', parentId: slug(make), value: slug(`${make}-${mo}`), label: mo })));
  regCities.forEach((c) => items.push({ catalog: 'vehicle_registration_locations', value: slug(c), label: c }));
  carFeatures.forEach((f) => items.push({ catalog: 'car_features', value: slug(f), label: f }));
  colors.forEach((c) => items.push({ catalog: 'managed_color_palette', value: slug(c), label: c }));
  return items;
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

module.exports = { TAXONOMY, LOCATIONS, buildReferenceItems, slug, refData: { carMakes, carModels, mobileBrands, mobileModels, motorcycleMakes, motorcycleModels, regCities, carFeatures, colors } };
