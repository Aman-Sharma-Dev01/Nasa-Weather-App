// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createDashboard, getDashboards, getDashboardById, updateDashboard, deleteDashboard } = require('../controllers/dashboardController');

// @route POST /api/dashboard
// @desc Create a new dashboard entry
// @access Private
router.post('/', auth, createDashboard);

// @route GET /api/dashboard
// @desc Get all dashboards for the current user
// @access Private
router.get('/', auth, getDashboards);

// @route GET /api/dashboard/:id
// @desc Get a specific dashboard by ID
// @access Private
router.get('/:id', auth, getDashboardById);

// @route PUT /api/dashboard/:id
// @desc Update an existing dashboard
// @access Private
router.put('/:id', auth, updateDashboard);

// @route DELETE /api/dashboard/:id
// @desc Delete a dashboard
// @access Private
router.delete('/:id', auth, deleteDashboard);

module.exports = router;