import Database from 'better-sqlite3';
import { readdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const migrationsPath = fileURLToPath(new URL('../../prisma/migrations/', import.meta.url));

export async function createMigratedTestDatabase(databasePath) {
  await rm(databasePath, { force: true });

  const migrationDirectories = (await readdir(migrationsPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const database = new Database(databasePath);
  try {
    for (const directory of migrationDirectories) {
      const sql = await readFile(`${migrationsPath}/${directory}/migration.sql`, 'utf8');
      database.exec(sql);
    }
  } finally {
    database.close();
  }
}
