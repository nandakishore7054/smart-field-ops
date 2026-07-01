const bcrypt = require('bcryptjs');
const User = require('./auth.model');
const { connectDatabase } = require('../../config/db');
const { environment, validateEnvironment } = require('../../config/environment');

const initialAdmin = {
  name: process.env.SEED_ADMIN_NAME || 'System Admin',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@smartfieldops.local',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  role: 'admin',
  status: 'active',
};

async function seedInitialAdmin() {
  validateEnvironment();
  await connectDatabase(environment.mongoUri);

  const existingAdmin = await User.findOne({ email: initialAdmin.email });

  if (existingAdmin) {
    console.log(`Admin user already exists: ${initialAdmin.email}`);
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash(initialAdmin.password, 12);

  const adminUser = await User.create({
    name: initialAdmin.name,
    email: initialAdmin.email,
    password: hashedPassword,
    role: initialAdmin.role,
    status: initialAdmin.status,
  });

  console.log(`Initial admin user created: ${adminUser.email}`);
  return adminUser;
}

if (require.main === module) {
  seedInitialAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed initial admin user:', error);
      process.exit(1);
    });
}

module.exports = {
  seedInitialAdmin,
};