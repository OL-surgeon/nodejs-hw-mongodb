import { Router } from 'express';
import * as contactsController from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

export const contactsRouter = Router();

contactsRouter.get('/', ctrlWrapper(contactsController.getAllContacts));
contactsRouter.get(
  '/:contactId',
  ctrlWrapper(contactsController.getContactById),
);
contactsRouter.post('/', ctrlWrapper(contactsController.createContact));
contactsRouter.patch(
  '/:contactId',
  ctrlWrapper(contactsController.updateContact),
);
contactsRouter.delete(
  '/:contactId',
  ctrlWrapper(contactsController.deleteContact),
);
