/**
 * Seed script:
 * - Connects to MongoDB
 * - Ensures an admin user exists (ADMIN_EMAIL)
 * - Assigns 'admin' role to admin user
 * - Logs an audit entry 'seed.run'
 */
const { connectMongo, disconnectMongo } = require('../db/mongoose');
const config = require('../config');
const userRepo = require('../repositories/userRepository');
const roleRepo = require('../repositories/roleAssignmentRepository');
const auditRepo = require('../repositories/auditLogRepository');

async function main() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is not set. Cannot run seed.');
  }
  console.log('Connecting to MongoDB...');
  await connectMongo();

  if (!config.seed.adminEmail) {
    throw new Error('ADMIN_EMAIL is not configured. Please set it before seeding.');
  }

  console.log('Ensuring admin user exists...');
  const user = await userRepo.findUserByEmail(config.seed.adminEmail) ||
               await userRepo.createUser({ email: config.seed.adminEmail, name: config.seed.adminName });

  console.log('Assigning admin role...');
  await roleRepo.assignRole({ userId: user._id, role: 'admin', assignedBy: user._id });

  console.log('Writing audit log...');
  await auditRepo.createAuditLog({
    actor: user._id,
    action: 'seed.run',
    resourceType: 'User',
    resourceId: user._id.toString(),
    metadata: { roles: ['admin'] },
  });

  console.log('Seed completed successfully.');
}

main()
  .then(async () => {
    await disconnectMongo();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seed failed:', err);
    try { await disconnectMongo(); } catch (_) {}
    process.exit(1);
  });
