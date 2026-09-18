const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');
const { Sequelize } = sequelize;

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  const queryInterface = sequelize.getQueryInterface();
  const migrationsDir = path.join(__dirname, '../migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('ℹ️ No migrations directory found.');
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js')).sort();

  for (const file of files) {
    console.log(`⏳ Checking migration: ${file}`);
    const migration = require(path.join(migrationsDir, file));
    if (migration && typeof migration.up === 'function') {
      await migration.up(queryInterface, Sequelize);
      console.log(`✅ Completed: ${file}`);
    }
  }

  console.log('✨ All migrations processed successfully!');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = runMigrations;
