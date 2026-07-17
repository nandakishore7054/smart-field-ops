const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const aiController = require('./ai.controller');

const router = express.Router();

router.use(protect);
router.use(requireRoles('admin', 'dispatcher'));

router.get('/operations-summary', aiController.getOperationsSummary);

module.exports = router;
