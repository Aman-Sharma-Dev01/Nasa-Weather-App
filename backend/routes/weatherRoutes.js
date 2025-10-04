// routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const { getWeatherForecast, downloadData } = require('../controllers/weatherController');
const auth = require('../middleware/authMiddleware');

// @route POST /api/weather/query
// @desc Get weather statistics for a specific query
// @access Private (Requires JWT)
router.post('/query', auth, getWeatherForecast);

// @route GET /api/weather/download/:filename
// @desc Download the generated CSV/JSON file
// @access Public (or token-protected)
router.get('/download/:filename', downloadData); 

module.exports = router;