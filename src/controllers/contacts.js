import createHttpError from 'http-errors';
import * as contactsService from '../services/contacts.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';

// =======================
// GET /contacts
// =======================
export const getAllContacts = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;
  const userId = req.user._id;

  const { contacts, totalItems, totalPages } =
    await contactsService.getAllContacts({
      userId,
      page: Number(page),
      perPage: Number(perPage),
      sortBy,
      sortOrder,
      type,
      isFavourite,
    });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts.map((c) => ({
        ...c.toObject(),
        photo: c.photo || null,
      })),
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: Number(page) > 1,
      hasNextPage: Number(page) < totalPages,
    },
  });
};

// =======================
// GET /contacts/:contactId
// =======================
export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await contactsService.getContactById(contactId, userId);
  if (!contact) throw createHttpError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: { ...contact.toObject(), photo: contact.photo || null },
  });
};

// =======================
// POST /contacts
// =======================
export const createContact = async (req, res) => {
  const userId = req.user._id;
  const photo = req.file;

  let photoUrl = null;
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const newContact = await contactsService.createContact(
    { ...req.body, userId, ...(photoUrl && { photo: photoUrl }) },
    userId,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: { ...newContact.toObject(), photo: newContact.photo || null },
  });
};

// =======================
// PATCH /contacts/:contactId
// =======================
export const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const photo = req.file;

  let photoUrl = null;
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const updated = await contactsService.updateContact(
    contactId,
    { ...req.body, ...(photoUrl && { photo: photoUrl }) },
    userId,
  );

  if (!updated) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: { ...updated.toObject(), photo: updated.photo || null },
  });
};

// =======================
// DELETE /contacts/:contactId
// =======================
export const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const deleted = await contactsService.deleteContact(contactId, userId);
  if (!deleted) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(204).send();
};
