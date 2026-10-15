// Firebase sign-in needs an email, so a plain user name "ofek" maps to "ofek@tommycare.app"
// (a made-up domain, no mail is ever sent). A full address with "@" is used as is.
export const USER_DOMAIN = 'tommycare.app';

export const usernameToEmail = (name) => {
  const n = name.trim().toLowerCase();
  return n.includes('@') ? n : `${n}@${USER_DOMAIN}`;
};

// For display: "ofek@tommycare.app" → "ofek"; real addresses stay as they are.
export const displayUser = (email) => (email || '').replace(`@${USER_DOMAIN}`, '');
