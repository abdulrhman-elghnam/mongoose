import { sendSuccess } from '#/common/main/structure/index.js';
import { signup, login, updateUser, deleteUser, getUser } from '../main/user.service.js';
import { Router } from 'express';
export const userController = Router();

userController.post('/signup', async (req, res) => {
  const serviceFeedback = await signup(req.body);
  return sendSuccess({ res, ...serviceFeedback });
});

userController.post('/login', async (req, res) => {
  const serviceFeedback = await login(req.body);
  return sendSuccess({ res, ...serviceFeedback });
});

userController.delete('/', async (req, res) => {
  const serviceFeedback = await deleteUser(req.query.id);
  return sendSuccess({ res, ...serviceFeedback });
});
userController.get('/', async (req, res) => {
  const serviceFeedback = await getUser(req.query.id);
  return sendSuccess({ res, ...serviceFeedback });
});

userController.patch('/:id', async (req, res) => {
  const serviceFeedback = await updateUser(req.params.id, req.body);
  return sendSuccess({ res, ...serviceFeedback });
});
