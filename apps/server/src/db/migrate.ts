import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create database connection
const client = createClient({
  url: 'file:research.db',
});

// Read and execute migration
const migrationPath = join(__dirname, '../../drizzle/0001_aromatic_marten_broadcloak.sql');
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
    console.error(`✗ Error executing statement ${index + 1}:`, error);
    throw error;
  }
}

console.log('✓ Migration completed successfully!');

client.close();
