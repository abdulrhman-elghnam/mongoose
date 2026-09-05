import { sendSuccess } from '../../../../common/main/structure/index.js';
import {
  createNote,
  updateNote,
  replaceNote,
  updateAll,
  deleteNote,
  getNotesPaginated,
  getNoteById,
  getByContent,
  getNotes,
  getNoteTitleAggregate,
  deleteAllNotes,
} from './note.service.js';
import { Router } from 'express';
export const noteController = Router();

noteController.post('/', async (req, res) => {
  const serviceFeedback = await createNote(req.query.id, req.body);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.patch('/all', async (req, res) => {
  const serviceFeedback = await updateAll(req.query.user, req.body);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.get('/paginate-sort', async (req, res) => {
  const serviceFeedback = await getNotesPaginated(req.query.user, req.query.page, req.query.limit);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.get('/note-by-content', async (req, res) => {
  const serviceFeedback = await getByContent(req.query?.content);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.get('/note-with-user', async (req, res) => {
  const serviceFeedback = await getNotes(req.query.user);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.get('/aggregate', async (req, res) => {
  const serviceFeedback = await getNoteTitleAggregate(req.query.title);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.delete('/', async (req, res) => {
  const serviceFeedback = await deleteAllNotes(req.query.user);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.get('/:id', async (req, res) => {
  const serviceFeedback = await getNoteById(req.params.id, req.query.user);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.put('/replace/:id', async (req, res) => {
  const serviceFeedback = await replaceNote(req.params.id, req.query.user, req.body);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.delete('/:id', async (req, res) => {
  const serviceFeedback = await deleteNote(req.query.user, req.params.id);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.patch('/:id', async (req, res) => {
  const serviceFeedback = await updateNote(req.params.id, req.query.user, req.body);
  return sendSuccess({ res, ...serviceFeedback });
});

noteController.get('/:id', async (req, res) => {
  const serviceFeedback = await getNoteById(req.params.id, req.query.user);
  return sendSuccess({ res, ...serviceFeedback });
});
