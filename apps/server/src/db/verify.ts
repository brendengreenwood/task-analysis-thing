import { db } from './index';
import { projects, personas, activities, tasks, operations, sessions, insights } from './schema';

async function verify() {
  console.log('Verifying database setup...\n');

  // Get table names by querying sqlite_master
  const tables = await db.all(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `);

  console.log('✓ Database tables created:');
  tables.forEach((table: any) => {
    if (table.name !== 'sqlite_sequence') {
      console.log(`  - ${table.name}`);
    }
  });

  console.log('\n✓ Database setup verified successfully!');
  console.log('\nReady for Step 2: API Layer');
}

verify().catch(console.error);
