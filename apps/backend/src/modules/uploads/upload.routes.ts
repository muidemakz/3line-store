import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/AppError';

const router = Router();

router.use(authenticate);

/**
 * POST /api/v1/uploads
 * Accepts a single image file (field name: "file").
 * Returns the public URL that can be stored and displayed later.
 */
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded.', 400);
    }

    const filename = req.file.filename;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${filename}`;

    return sendCreated(
      res,
      { url, filename, size: req.file.size, mimetype: req.file.mimetype },
      'File uploaded successfully',
    );
  }),
);

export default router;
