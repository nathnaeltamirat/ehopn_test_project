import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getInvoices, 
  uploadInvoice, 
  updateInvoice, 
  deleteInvoice,
  createInvoice
} from '../controllers/invoiceController';
import { validateInvoice } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();


const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {

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

router.use(auth as any);

router.get('/', getInvoices);

router.post('/', validateInvoice, createInvoice);


router.post('/upload', upload.single('file'), uploadInvoice);

router.put('/:id', validateInvoice, updateInvoice);

router.delete('/:id', deleteInvoice);

export default router;
