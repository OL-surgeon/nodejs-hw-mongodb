import createHttpError from 'http-errors';
import * as contactsService from '../services/contacts.js';
import cloudinary from '../utils/cloudinary.js';

/**
 * Завантаження зображення на Cloudinary (Promise-версія)
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'contacts_photos' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(fileBuffer);
  });
};

/**
 * GET /contacts
 */
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
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: Number(page) > 1,
      hasNextPage: Number(page) < totalPages,
    },
  });
};

/**
 * GET /contacts/:contactId
 */
export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await contactsService.getContactById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

/**
 * POST /contacts
 */
export const createContact = async (req, res) => {
  const { name, phoneNumber, contactType, email, isFavourite } = req.body;
  const userId = req.user._id;

  let photoUrl = null;
  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file.buffer);
  }

  const newContact = await contactsService.createContact(
    {
      name,
      phoneNumber,
      contactType,
      email: email || null,
      isFavourite: isFavourite || false,
      photo: photoUrl,
    },
    userId,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: { contact: newContact },
  });
};

/**
 * PATCH /contacts/:contactId
 */
export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  let photoUrl = null;
  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file.buffer);
  }

  const updated = await contactsService.updateContact(
    contactId,
    { ...req.body, ...(photoUrl && { photo: photoUrl }) },
    userId,
  );

  if (!updated) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

/**
 * DELETE /contacts/:contactId
 */
export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const deleted = await contactsService.deleteContact(contactId, userId);

  if (!deleted) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
