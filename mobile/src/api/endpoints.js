import api from './client';

// Thin wrappers around the Bazaario REST contract (/v1). Each returns response.data.
// Grouped by domain to mirror the server module layout.

const unwrap = (p) => p.then((r) => r.data);

// ---- Auth & identity ----
export const auth = {
  login: (emailOrPhone, password) => unwrap(api.post('/auth/login', { emailOrPhone, password })),
  register: (payload) => unwrap(api.post('/auth/register', payload)),
  refresh: (refreshToken) => unwrap(api.post('/auth/refresh', { refreshToken })),
  logout: () => unwrap(api.post('/auth/logout')),
  me: () => unwrap(api.get('/me')),
  updateProfile: (patch) => unwrap(api.patch('/me/profile', patch)),
};

// ---- Taxonomy / locations / reference ----
export const taxonomy = {
  categories: () => unwrap(api.get('/categories')),
  category: (id) => unwrap(api.get(`/categories/${encodeURIComponent(id)}`)),
  formSchema: (id) => unwrap(api.get(`/categories/${encodeURIComponent(id)}/form-schema`)),
  referenceData: (catalog, parentId) =>
    unwrap(api.get(`/reference-data/${encodeURIComponent(catalog)}`, { params: parentId ? { parentId } : {} })),
};

export const locations = {
  list: () => unwrap(api.get('/locations')),
  suggest: (q) => unwrap(api.get('/locations/suggest', { params: { q } })),
  children: (id) => unwrap(api.get(`/locations/${encodeURIComponent(id)}/children`)),
};

// ---- Listings ----
export const listings = {
  create: (payload) => unwrap(api.post('/listings', payload)),
  get: (publicId) => unwrap(api.get(`/listings/${encodeURIComponent(publicId)}`)),
  update: (id, patch) => unwrap(api.patch(`/listings/${encodeURIComponent(id)}`, patch)),
  markSold: (id) => unwrap(api.post(`/listings/${encodeURIComponent(id)}/mark-sold`)),
  deactivate: (id) => unwrap(api.post(`/listings/${encodeURIComponent(id)}/deactivate`)),
  renew: (id) => unwrap(api.post(`/listings/${encodeURIComponent(id)}/renew`)),
  mine: (state) => unwrap(api.get('/me/listings', { params: state ? { state } : {} })),
};

// ---- Search / discovery ----
export const search = {
  query: (params) => unwrap(api.get('/search', { params })),
  suggest: (q) => unwrap(api.get('/search/suggest', { params: { q } })),
};

// ---- Favourites / saved searches ----
export const favourites = {
  list: () => unwrap(api.get('/favourites')),
  add: (id) => unwrap(api.post(`/listings/${encodeURIComponent(id)}/favourite`)),
  remove: (id) => unwrap(api.delete(`/listings/${encodeURIComponent(id)}/favourite`)),
  savedSearches: () => unwrap(api.get('/saved-searches')),
  saveSearch: (payload) => unwrap(api.post('/saved-searches', payload)),
};

// ---- Chat ----
export const chat = {
  start: (listingPublicId) => unwrap(api.post('/conversations', { listingPublicId })),
  conversations: () => unwrap(api.get('/conversations')),
  messages: (id) => unwrap(api.get(`/conversations/${encodeURIComponent(id)}/messages`)),
  send: (id, body) => unwrap(api.post(`/conversations/${encodeURIComponent(id)}/messages`, { body })),
  markRead: (id) => unwrap(api.post(`/conversations/${encodeURIComponent(id)}/read`)),
};

// ---- Users (public) ----
export const users = {
  profile: (publicId) => unwrap(api.get(`/users/${encodeURIComponent(publicId)}`)),
  listings: (publicId) => unwrap(api.get(`/users/${encodeURIComponent(publicId)}/listings`)),
};

// ---- Reports ----
export const reports = {
  create: (payload) => unwrap(api.post('/reports', payload)),
};

export default { auth, taxonomy, locations, listings, search, favourites, chat, users, reports };
