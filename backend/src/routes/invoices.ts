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

import { auth } from '../middleware/auth';

const router = Router();


const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {

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

router.post('/', createInvoice);


router.post('/upload', upload.single('file'), uploadInvoice);

router.put('/:id', updateInvoice);

router.delete('/:id', deleteInvoice);

export default router;
