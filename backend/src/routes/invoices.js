const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getInvoices, 
  uploadInvoice, 
  updateInvoice, 
  deleteInvoice,
  createInvoice
} = require('../controllers/invoiceController');
const { validateInvoice } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and Excel files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});

router.use(auth);

router.get('/', getInvoices);
router.post('/', validateInvoice, createInvoice);
router.post('/upload', upload.single('file'), uploadInvoice);
router.put('/:id', validateInvoice, updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
