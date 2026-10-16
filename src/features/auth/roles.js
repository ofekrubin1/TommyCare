// Permissions. Mirrors firestore.rules (which is what actually protects the data):
//   owner  — fixed in config (OWNER_USERNAMES) or given by an owner; full access + manages users
//   editor — adds, edits and deletes records
//   viewer — sees everything, changes nothing (also anyone without a role yet: new users wait for approval)
import { OWNER_USERNAMES } from '@/config/appConfig';
import { displayUser } from './username';

export const ROLES = [
  { value: 'viewer', label: 'צפייה' },
  { value: 'editor', label: 'עריכה' },
  { value: 'owner', label: 'מנהל' },
];

export const isFixedOwner = (email) => OWNER_USERNAMES.includes(displayUser(email));

// 'owner' | 'editor' | 'viewer' | 'pending' (signed in, no role given yet → treated as viewer).
export function roleOf(uid, email, roles) {
  if (isFixedOwner(email)) return 'owner';
  return roles.find((r) => r.id === uid)?.role || 'pending';
}

export const canEditAs = (role) => role === 'owner' || role === 'editor';
