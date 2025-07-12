const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {verifyToken} = require("../Middlewares/authMiddleware");
const { uploadDocuments } = require('../controllers/documentVerificationController/documentsVerifyController');

const uploadFields = upload.fields([
  { name: 'highschoolmarksheet', maxCount: 1 },
  { name: 'intermediatemarksheet', maxCount: 1 },
  { name: 'highestqualificationmarksheet', maxCount: 1 },
  { name: 'aadharfront', maxCount: 1 },
  { name: 'aadharback', maxCount: 1 },
  { name: 'pancard', maxCount: 1 }
]);

router.post('/upload-documents', verifyToken,uploadFields, uploadDocuments);

module.exports = router;