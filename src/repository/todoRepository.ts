import {pool} from '../startup/db';

interface Todo {
  id?: number;
  description: string;
  completed?: boolean;
}

class TodoRepository {
  async create(todo: Todo): Promise<Todo> {
    const result = await pool.query(
      'INSERT INTO todos (description, completed) VALUES ($1, $2) RETURNING *',
      [todo.description, todo.completed || false]
    );
    return result.rows[0];
  }

  async findAll(): Promise<Todo[]> {
    const result = await pool.query('SELECT * FROM todos');
    return result.rows;
  }

  async findById(id: number): Promise<Todo | null> {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async update(id: number, description: Partial<Todo> | string, completed: Partial<Todo> | string  ): Promise<Todo | null> {
    const result = await pool.query(
      'UPDATE todos SET description = $1, completed = $2 WHERE id = $3 RETURNING *',
      [description, completed, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<Todo | null> {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

export default new TodoRepository();
