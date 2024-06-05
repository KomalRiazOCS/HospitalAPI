import { Pool, PoolClient } from 'pg';
import { dbConfig } from './configuration';

const pool = new Pool(dbConfig.db);

async function createTodosTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);
  } catch (err) {
    console.error(err);
  }
}

let client: PoolClient | undefined;
const connectToDB = async (): Promise<void> => {
  try {
    client = await pool.connect();
    console.log('Connected to the database');
    await createTodosTable();
  } catch (err) {
    console.error('Unable to connect to database');
    throw err;
  }
};

export { pool, client, connectToDB };
