const userRepo = require('../repositories/userRepository');
const auditRepo = require('../repositories/auditLogRepository');

// PUBLIC_INTERFACE
async function ensureUser({ email, name, provider = null, providerId = null, actorContext = null }) {
  /** Ensure a user exists, creating one if missing. */
  let user = await userRepo.findUserByEmail(email);
  if (!user) {
    user = await userRepo.createUser({ email, name, provider, providerId });
    await auditRepo.createAuditLog({
      actor: actorContext?.actor || null,
      action: 'user.login',
      resourceType: 'User',
      resourceId: user._id?.toString?.() || null,
      metadata: { created: true, email },
    });
  }
  return user;
}

module.exports = {
  ensureUser,
};
