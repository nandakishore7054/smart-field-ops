const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const tasksController = require('./tasks.controller');

const router = express.Router();

router.use(protect);

router.get('/my-tasks', requireRoles('worker'), tasksController.listMyTasks);
router.patch('/:id/status', requireRoles('worker'), tasksController.updateTaskStatus);

router.use(requireRoles('admin'));

router.post('/', tasksController.createTask);
router.get('/', tasksController.listTasks);
router.get('/:id', tasksController.getTaskById);
router.patch('/:id/verify', tasksController.verifyTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;