import { Router } from 'express';
import * as contactsController from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  addContactSchema,
  updateContactSchema,
} from '../schemas/contactsSchemas.js';

export const contactsRouter = Router();

contactsRouter.use(authenticate);

contactsRouter.get('/', ctrlWrapper(contactsController.getAllContacts));

contactsRouter.get(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.getContactById),
);

contactsRouter.post(
  '/',
  validateBody(addContactSchema),
  ctrlWrapper(contactsController.createContact),
);

contactsRouter.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(contactsController.updateContact),
);

contactsRouter.delete(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.deleteContact),
);
