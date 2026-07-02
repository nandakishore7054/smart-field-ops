const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const tasksController = require('./tasks.controller');

const router = express.Router();

router.use(protect, requireRoles('admin'));

router.post('/', tasksController.createTask);
router.get('/', tasksController.listTasks);
router.get('/:id', tasksController.getTaskById);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;