// Where the family's data lives (same layout as src/data/index.js). One family for now.
export const FAMILY = 'families/main';
export const childPath = (childId) => `${FAMILY}/children/${childId}`;

export const loadChildren = async (db) =>
  (await db.list(`${FAMILY}/children`)).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export const loadFamilySettings = async (db) => (await db.get(`${FAMILY}/settings`, 'app')) || {};
