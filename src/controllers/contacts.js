import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
// =======================
// GET /contacts
// =======================
export const getAllContacts = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId: req.user._id,
  });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

// =======================
// GET /contacts/:contactId
// =======================
export const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId, req.user._id);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

// =======================
// POST /contacts
// =======================
// export const createContact = async (req, res) => {
//   const photo = req.file;

//   let photoUrl = null;
//   if (photo) {
//     if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
//       photoUrl = await saveFileToCloudinary(photo);
//     } else {
//       photoUrl = await saveFileToUploadDir(photo);
//     }
//   }

//   const newContact = await contactsService.createContact(
//     { ...req.body, userId, ...(photoUrl && { photo: photoUrl }) },
//     userId,
//   );

//   res.status(201).json({
//     status: 201,
//     message: 'Successfully created a contact!',
//     data: { ...newContact.toObject(), photo: newContact.photo || null },
//   });
// };
export const createContact = async (req, res) => {
  const photo = req.file;

  let photoUrl;
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  const contact = await createContact({
    ...req.body,
    userId: req.user._id,
    ...(photoUrl && { photo: photoUrl }),
  });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};
// =======================
// PATCH /contacts/:contactId
// =======================
export const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = await updateContact(
    contactId,
    req.body,
    req.user._id,
    photoUrl,
  );

  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.contact,
  });
};

// =======================
// DELETE /contacts/:contactId
// =======================
export const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }
  res.status(204).send();
};
