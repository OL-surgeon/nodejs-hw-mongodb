import { Router } from 'express';
import * as contactsController from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import {
  addContactSchema,
  updateContactSchema,
} from '../schemas/contactsSchemas.js';

export const contactsRouter = Router();

// Захищаємо всі маршрути
contactsRouter.use(authenticate);

// =======================
// GET /contacts
// =======================
contactsRouter.get('/', ctrlWrapper(contactsController.getAllContacts));

// =======================
// GET /contacts/:contactId
// =======================
contactsRouter.get(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.getContactById),
);

// =======================
// POST /contacts
// =======================
contactsRouter.post(
  '/',
  upload.single('photo'),
  validateBody(addContactSchema),
  ctrlWrapper(contactsController.createContact),
);

// =======================
// PATCH /contacts/:contactId
// =======================
contactsRouter.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(contactsController.updateContact),
);

// =======================
// DELETE /contacts/:contactId
// =======================
contactsRouter.delete(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.deleteContact),
);
