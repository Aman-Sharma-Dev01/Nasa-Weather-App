// controllers/dashboardController.js
const Dashboard = require('../models/Dashboard');

// @route POST /api/dashboard
// @desc Create a new dashboard entry
// @access Private
exports.createDashboard = async (req, res) => {
    try {
        const newDashboard = new Dashboard({
            user: req.user.id, // ID obtained from auth middleware
            ...req.body
        });

        const dashboard = await newDashboard.save();
        res.json(dashboard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route GET /api/dashboard
// @desc Get all dashboards for the current user
// @access Private
exports.getDashboards = async (req, res) => {
    try {
        const dashboards = await Dashboard.find({ user: req.user.id }).sort({ date: -1 });
        res.json(dashboards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route GET /api/dashboard/:id
// @desc Get a specific dashboard by ID
// @access Private
exports.getDashboardById = async (req, res) => {
    try {
        const dashboard = await Dashboard.findById(req.params.id);

        if (!dashboard) {
            return res.status(404).json({ msg: 'Dashboard not found' });
        }
        
        // Check user ownership
        if (dashboard.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        res.json(dashboard);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Dashboard not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route PUT /api/dashboard/:id
// @desc Update an existing dashboard
// @access Private
exports.updateDashboard = async (req, res) => {
    try {
        let dashboard = await Dashboard.findById(req.params.id);

        if (!dashboard) {
            return res.status(404).json({ msg: 'Dashboard not found' });
        }

        // Check user ownership
        if (dashboard.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Update the dashboard with new data
        dashboard = await Dashboard.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(dashboard);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Dashboard not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route DELETE /api/dashboard/:id
// @desc Delete a dashboard
// @access Private
exports.deleteDashboard = async (req, res) => {
    try {
        const dashboard = await Dashboard.findById(req.params.id);

        if (!dashboard) {
            return res.status(404).json({ msg: 'Dashboard not found' });
        }

        // Check user ownership
        if (dashboard.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Dashboard.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Dashboard removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Dashboard not found' });
        }
        res.status(500).send('Server Error');
    }
};