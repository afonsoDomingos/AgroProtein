const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@avicultura.com' });
    
    if (!adminExists) {
      const admin = await User.create({
        email: 'admin@avicultura.com',
        password: '@Admin123@',
        name: 'Administrador',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
      return admin;
    } else {
      console.log('ℹ️ Admin user already exists');
      return adminExists;
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
};

module.exports = seedAdmin;
