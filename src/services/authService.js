/**
 * Real User Authentication Service for Virtual Box
 * Manages user accounts, secure SHA-256 password hashing, registration, login, and session storage.
 */

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'virtual_box_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const USERS_DB_KEY = 'virtualbox_users_db';
const ACTIVE_SESSION_KEY = 'virtualbox_active_user';

function getUsersDB() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveUsersDB(db) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

export const registerUser = async (username, email, password) => {
  if (!username || !email || !password) {
    throw new Error('All registration fields are required.');
  }

  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  const lowerUser = username.toLowerCase().trim();

  if (db.some(u => u.email.toLowerCase() === lowerEmail || u.username.toLowerCase() === lowerUser)) {
    throw new Error('User with this username or email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: `usr_${Date.now()}`,
    username: username.trim(),
    email: lowerEmail,
    passwordHash: passwordHash,
    avatar: '👑',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  db.push(newUser);
  saveUsersDB(db);
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    throw new Error('Please enter your username/email and password.');
  }

  const db = getUsersDB();
  const lowerId = identifier.toLowerCase().trim();
  const passwordHash = await hashPassword(password);

  const found = db.find(u => 
    (u.email.toLowerCase() === lowerId || u.username.toLowerCase() === lowerId) &&
    u.passwordHash === passwordHash
  );

  if (!found) {
    throw new Error('Invalid credentials. Please check your username/email and password.');
  }

  found.lastLogin = new Date().toISOString();
  saveUsersDB(db);
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(found));
  return found;
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Default guest authenticated user if first launch
  const defaultUser = {
    id: 'usr_default_host',
    username: 'CinemaHost',
    email: 'host@virtualbox.app',
    avatar: '👑',
    createdAt: new Date().toISOString(),
  };
  return defaultUser;
};

export const logoutUser = () => {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
};
