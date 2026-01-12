import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create database connection
const client = createClient({
  url: 'file:research.db',
});

// Read and execute migrations
const migrations = [
  '0000_many_beast.sql',
  '0001_low_bloodstorm.sql',
  '0002_sturdy_charles_xavier.sql',
];

for (const migrationFile of migrations) {
  console.log(`\nRunning migration: ${migrationFile}`);
  const migrationPath = join(__dirname, '../../drizzle', migrationFile);

  try {
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const [index, statement] of statements.entries()) {
      try {
        await client.execute(statement);
        console.log(`✓ Statement ${index + 1} executed successfully`);
      } catch (error) {
        // Ignore errors for tables/columns that already exist
        if (error instanceof Error &&
            (error.message.includes('duplicate column name') ||
             error.message.includes('already exists'))) {
          console.log(`→ Statement ${index + 1} already applied`);
        } else {
          console.error(`✗ Error executing statement ${index + 1}:`, error);
          throw error;
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.log(`→ Migration file not found, skipping`);
    } else {
      throw error;
    }
  }
}

console.log('✓ Migration completed successfully!');

client.close();
