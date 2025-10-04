// controllers/weatherController.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv'); 

// Mock/Placeholder for specific NASA data endpoints
const NASA_DATA_CONFIG = {
    temperature: {
        variable: 'AirTemp_Mean',
        unit: 'K',
        source: 'GES_DISC_Dataset_XYZ',
        endpoint: process.env.DATA_BASE_URL + '/XYZ/AirTemp_Mean' 
    },
    precipitation: {
        variable: 'Rainfall_Rate',
        unit: 'mm/hr',
        source: 'Giovanni_TRMM_Dataset',
        endpoint: process.env.DATA_BASE_URL + '/TRMM/Rainfall_Rate'
    },
    windspeed: {
        variable: 'Wind_Speed_10m',
        unit: 'm/s',
        source: 'Worldview_Dataset_ABC',
        endpoint: process.env.DATA_BASE_URL + '/ABC/Wind_Speed_10m'
    }
};

/**
 * Executes the core data query, statistical analysis, and file generation.
 * @route POST /api/weather/query
 * @access Private (Requires User Auth)
 */
exports.getWeatherForecast = async (req, res) => {
    // Note: req.user.id is available here from the auth middleware
    const { 
        location, 
        dayOfYear,
        variables, 
        thresholds 
    } = req.body;

    // 1. Validation and Setup
    if (!location || !dayOfYear || !variables || variables.length === 0) {
        return res.status(400).json({ msg: 'Missing required query parameters.' });
    }

    const results = {};
    const dataForDownload = [];
    // Ensure req.user exists before accessing id (though auth middleware should handle this)
    const userId = req.user ? req.user.id : 'anonymous'; 
    const downloadFileName = `nasa_weather_query_${userId}_${Date.now()}`;

    try {
        for (const varName of variables) {
            const config = NASA_DATA_CONFIG[varName];
            if (!config) continue;

            // --- 2. Data Fetching (Simulated) ---
            // Placeholder for historical data array (10 years for the given day/location)
            const historicalData = Array.from({ length: 10 }, 
                () => Math.random() * (varName === 'temperature' ? 50 : 10) + (varName === 'temperature' ? 273.15 : 0.5)); 
            
            // --- 3. Statistical Computation ---
            const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
            const threshold = thresholds.find(t => t.variable === varName);
            
            let probabilityExceedingThreshold = 'N/A'; // Initialized as string
            let simpleTextExplanation = `The average ${varName} for Day ${dayOfYear} at this location is **${mean.toFixed(2)} ${config.unit}**.`;

            if (threshold) {
                // Convert threshold value to the base unit (Kelvin in this example) for comparison
                const thresholdValueK = (threshold.unit === 'F') 
                    ? (threshold.value - 32) * 5 / 9 + 273.15 
                    : threshold.value;
                
                const countExceeding = historicalData.filter(v => v > thresholdValueK).length;
                
                // Assigns a number here
                probabilityExceedingThreshold = (countExceeding / historicalData.length) * 100;

                simpleTextExplanation += ` Historical data shows a **${probabilityExceedingThreshold.toFixed(0)}% chance** of exceeding the specified threshold (${threshold.value}°${threshold.unit}).`;
            }

            // --- 4. Prepare API Response and Download Data (FIX IMPLEMENTED HERE) ---

            // Check if probability is a number before calling toFixed(0)
            const probabilityOutput = typeof probabilityExceedingThreshold === 'number'
                ? probabilityExceedingThreshold.toFixed(0) + '%'
                : probabilityExceedingThreshold;

            results[varName] = {
                mean: mean.toFixed(2),
                unit: config.unit,
                // Use the checked probability output
                probabilityExceedingThreshold: probabilityOutput,
                simpleExplanation: simpleTextExplanation,
                visualSuggestion: `A time series graph of the past 10 years' ${varName} for Day ${dayOfYear} is recommended.`,
                metadata: { source: config.source, variableName: config.variable }
            };

            // Prepare for CSV/JSON download
            historicalData.forEach((value, index) => {
                dataForDownload.push({
                    location: JSON.stringify(location),
                    day_of_year: dayOfYear,
                    year_offset: -(index + 1), 
                    variable: varName,
                    value: value.toFixed(4),
                    unit: config.unit,
                    source: config.source
                });
            });
        }

        // --- 5. Generate Downloadable Output (CSV) ---
        const fields = ['location', 'day_of_year', 'year_offset', 'variable', 'value', 'unit', 'source'];
        const csv = parse(dataForDownload, { fields });
        
        // Define path for temporary storage (ensure 'downloads' folder exists in project root)
        const downloadsDir = path.join(__dirname, '../../downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir);
        }

        const filePath = path.join(downloadsDir, `${downloadFileName}.csv`);
        fs.writeFileSync(filePath, csv);

        // --- 6. Final API Response ---
        res.json({
            status: 'Success',
            queryResults: results,
            downloadLink: `/api/weather/download/${downloadFileName}.csv`, 
            visualizations: Object.keys(results).map(key => results[key].visualSuggestion)
        });

    } catch (err) {
        // Log detailed error and send generic error response
        console.error('Data query error:', err.stack); 
        res.status(500).json({ msg: 'Server error during data processing.' });
    }
};

/**
 * Route to serve the generated downloadable file.
 * @route GET /api/weather/download/:filename
 * @access Public (Token check can be added for security)
 */
exports.downloadData = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, `../../downloads/${filename}`);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({ msg: 'Could not download the file.' });
            }
            // CRITICAL: Clean up the temporary file after successful download
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
            });
        });
    } else {
        res.status(404).json({ msg: 'File not found.' });
    }
};
