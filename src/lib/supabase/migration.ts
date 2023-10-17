import { migrate } from 'drizzle-orm/postgres-js/migrator';
import db from './db';

const migrateDb = async () => {
  console.log('🟠 Migrating client...');
  await migrate(db, {
    migrationsFolder: 'migrations',
  });
  console.log('🟢 Successfully Migrated!');
};

migrateDb().finally(() => {
  process.exit();
});
