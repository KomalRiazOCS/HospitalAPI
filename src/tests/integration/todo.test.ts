import request from 'supertest';
import {app} from '../../index';
import {pool, client} from '../../startup/db';

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    )
  `);
});

beforeEach(async () => {
  await pool.query('DELETE FROM todos');
});

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS todos');
  client?.release()
  await pool.end();
});

describe('Todos API', () => {
  it('should create a new todo', async () => {
    const response = await request(app)
      .post('/api/todos/')
      .send({ description: 'Test todo' });
   
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('Test todo');
    expect(response.body.completed).toBe(false);
  });

  it('should fetch all todos', async () => {
    await pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2)', ['First todo', false]);
    await pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2)', ['Second todo', true]);

    const response = await request(app).get('/api/todos');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should fetch a todo by ID', async () => {
    const result = await pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2) RETURNING *', ['Test todo', false]);
    const todo = result.rows[0];

    const response = await request(app).get(`/api/todos/${todo.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(todo.id);
    expect(response.body.description).toBe(todo.description);
  });

  it('should update a todo', async () => {
    const result = await pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2) RETURNING *', ['Test todo', false]);
    const todo = result.rows[0];

    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ description: 'Updated todo', completed: true });

    expect(response.status).toBe(200);
    expect(response.body.description).toBe('Updated todo');
    expect(response.body.completed).toBe(true);
  });

  it('should delete a todo', async () => {
    const result = await pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2) RETURNING *', ['Test todo', false]);
    const todo = result.rows[0];

    const response = await request(app).delete(`/api/todos/${todo.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(todo.id);

    const getResponse = await request(app).get(`/api/todos/${todo.id}`);
    expect(getResponse.status).toBe(404);
  });
});
