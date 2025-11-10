const User = require('../models/user');

// PUBLIC_INTERFACE
async function createUser({ email, name, provider = null, providerId = null }) {
  /** Create a new user. Throws on unique constraint violation. */
  const user = await User.create({ email, name, provider, providerId });
  return user.toObject();
}

// PUBLIC_INTERFACE
async function findUserByEmail(email) {
  /** Find a user by email. Returns a plain object or null. */
  const user = await User.findOne({ email }).lean();
  return user;
}

// PUBLIC_INTERFACE
async function findUserById(id) {
  /** Find a user by id. Returns a plain object or null. */
  const user = await User.findById(id).lean();
  return user;
}

// PUBLIC_INTERFACE
async function updateUser(id, updates) {
  /** Update a user and return the updated plain object. */
  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
  return user;
}

// PUBLIC_INTERFACE
async function listUsers({ limit = 50, offset = 0 } = {}) {
  /** List users with pagination. */
  const data = await User.find().sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
  return data;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  listUsers,
};
