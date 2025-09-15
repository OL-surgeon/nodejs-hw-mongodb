const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Here are all contacts' });
});

router.post('/', (req, res) => {
  const newContact = req.body;
  res.status(201).json({ message: 'Contact created', contact: newContact });
});

module.exports = router;
