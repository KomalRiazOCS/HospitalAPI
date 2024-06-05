import express, { Request, Response } from 'express';
import todoRepository from '../repository/todoRepository';
import validateRequest from '../helper/validateRequest';
import { createTodoSchema, updateTodoSchema } from '../validations/todoValidations';

const router = express.Router();

router.post('/todos', validateRequest(createTodoSchema), async (req: Request, res: Response) => {
  try {
    const { description, completed } = req.body;
    const newTodo = await todoRepository.create({ description, completed });
    res.send(newTodo);
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/todos', async (req: Request, res: Response) => {
  try {
    const allTodos = await todoRepository.findAll();
    res.send(allTodos);
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await todoRepository.findById(parseInt(id));
    if (!todo) {
      return res.status(404).send('Todo not found');
    }
    res.send(todo);
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/todos/:id', validateRequest(updateTodoSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todoExist = await todoRepository.findById(parseInt(id));
    if(todoExist){
      const { description, completed } = req.body;

      const currentDescription = description || todoExist.description;
      const currentCompleted = completed !== undefined ? completed : todoExist.completed;

      const updatedTodo = await todoRepository.update(parseInt(id), currentDescription, currentCompleted );
      if (!updatedTodo) {
        return res.status(404).send('Error in updation');
      }
      res.send(updatedTodo);
    }
    else{
      res.status(404).send('Todo not found');
    }
    
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTodo = await todoRepository.delete(parseInt(id));
    if (!deletedTodo) {
      return res.status(404).send('Todo not found');
    }
    res.send(deletedTodo);
  } catch (err: any) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
