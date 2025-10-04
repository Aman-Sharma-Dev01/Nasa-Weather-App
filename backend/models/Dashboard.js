// models/Dashboard.js
const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: { 
        type: String, // e.g., 'Pin', 'Boundary', 'CityName'
        details: { type: Object, required: true } // { lat: X, lon: Y } or { city: 'London' }
    },
    dayOfYear: {
        type: Number, // 1-366
        required: true
    },
    selectedVariables: {
        type: [String], // e.g., ['temperature', 'precipitation']
        required: true
    },
    thresholds: {
        type: [Object], // [{ variable: 'temperature', value: 90, unit: 'F' }]
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('dashboard', DashboardSchema);