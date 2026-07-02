const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const submissionsController = require('./submissions.controller');

const router = express.Router();

router.get('/upload/signature', protect, submissionsController.uploadSignature);
router.post('/submissions', protect, requireRoles('worker'), submissionsController.createSubmission);

module.exports = router;