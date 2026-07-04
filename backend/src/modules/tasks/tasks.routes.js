const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const tasksController = require('./tasks.controller');

const router = express.Router();

router.use(protect);

router.get('/my-tasks', requireRoles('worker'), tasksController.listMyTasks);
router.patch('/:id/status', requireRoles('worker'), tasksController.updateTaskStatus);

router.post('/', requireRoles('admin', 'dispatcher'), tasksController.createTask);
router.get('/', requireRoles('admin', 'dispatcher'), tasksController.listTasks);
router.get('/:id', requireRoles('admin', 'dispatcher'), tasksController.getTaskById);
router.put('/:id', requireRoles('admin', 'dispatcher'), tasksController.updateTask);

router.patch('/:id/verify', requireRoles('admin'), tasksController.verifyTask);
router.delete('/:id', requireRoles('admin'), tasksController.deleteTask);

module.exports = router;