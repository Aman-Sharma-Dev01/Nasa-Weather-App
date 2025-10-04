// controllers/weatherController.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv'); 

// Mock/Placeholder for specific NASA data endpoints
// NOTE: The keys are friendly names used in the request body, 
// while the 'variable' field holds the corresponding NASA short code.
const NASA_DATA_CONFIG = {
    // EXISTING VARIABLES
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
    // UPDATED WIND SPEED (using WS10M code)
    windspeed: {
        variable: 'WS10M',
        unit: 'm/s',
        source: 'Worldview_Dataset_ABC',
        endpoint: process.env.DATA_BASE_URL + '/ABC/WS10M'
    },
    
    // NEW VARIABLES ADDED BY REQUEST
    solar_radiation: { // Corresponds to ALLSKY_KT
        variable: 'ALLSKY_KT',
        unit: 'unitless', // Clearness index is a ratio (0-1)
        source: 'CERES_SYN_Dataset',
        endpoint: process.env.DATA_BASE_URL + '/CERES/ALLSKY_KT'
    },
    relative_humidity: { // Corresponds to RH2M
        variable: 'RH2M',
        unit: '%',
        source: 'MODIS_Atmosphere_Data',
        endpoint: process.env.DATA_BASE_URL + '/MODIS/RH2M'
    },
    solar_insolation: { // Corresponds to ALLSKY_SFC_SW_DWN
        variable: 'ALLSKY_SFC_SW_DWN',
        unit: 'W/m^2',
        source: 'CERES_SYN_Dataset',
        endpoint: process.env.DATA_BASE_URL + '/CERES/ALLSKY_SFC_SW_DWN'
    }
};

/**
 * Executes the core data query, statistical analysis, and file generation.
 * @route POST /api/weather/query
 * @access Private (Requires User Auth)
 */
exports.getWeatherForecast = async (req, res) => {
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
    const userId = req.user ? req.user.id : 'anonymous'; 
    const downloadFileName = `nasa_weather_query_${userId}_${Date.now()}`;

    try {
        for (const varName of variables) {
            const config = NASA_DATA_CONFIG[varName];
            if (!config) continue;

            // --- 2. Data Fetching (Simulated) ---
            let historicalData = [];
            
            // Generate simulated data based on expected ranges for the variable
            if (varName === 'temperature') {
                 // Kelvin (273.15 is 0C, typically high 200s to low 300s)
                historicalData = Array.from({ length: 10 }, () => Math.random() * 50 + 273.15); 
            } else if (varName === 'precipitation' || varName === 'windspeed') {
                // mm/hr or m/s (low values)
                historicalData = Array.from({ length: 10 }, () => Math.random() * 10 + 0.5); 
            } else if (varName === 'relative_humidity') {
                // Percentage (20% to 80%)
                historicalData = Array.from({ length: 10 }, () => Math.random() * 60 + 20); 
            } else if (varName === 'solar_insolation') {
                // W/m^2 (Typical peak is ~1000, simulating an average value)
                historicalData = Array.from({ length: 10 }, () => Math.random() * 500 + 200);
            } else if (varName === 'solar_radiation') {
                // Unitless Clearness Index (0.3 to 0.8 is common)
                historicalData = Array.from({ length: 10 }, () => Math.random() * 0.5 + 0.3);
            }
            
            // --- 3. Statistical Computation ---
            const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
            const threshold = thresholds.find(t => t.variable === varName);
            
            let probabilityExceedingThreshold = 'N/A';
            let simpleTextExplanation = `The average ${varName} for Day ${dayOfYear} at this location is **${mean.toFixed(2)} ${config.unit}**.`;

            if (threshold) {
                // Convert threshold value to the base unit (K, m/s, %, etc.) for comparison
                let thresholdValueBaseUnit = threshold.value;
                if (varName === 'temperature' && threshold.unit === 'F') {
                    // Farenheit to Kelvin conversion
                    thresholdValueBaseUnit = (threshold.value - 32) * 5 / 9 + 273.15;
                }
                
                const countExceeding = historicalData.filter(v => v > thresholdValueBaseUnit).length;
                
                // Assigns a number here
                probabilityExceedingThreshold = (countExceeding / historicalData.length) * 100;

                simpleTextExplanation += ` Historical data shows a **${probabilityExceedingThreshold.toFixed(0)}% chance** of exceeding the specified threshold (${threshold.value}°${threshold.unit || config.unit}).`;
            }

            // --- 4. Prepare API Response and Download Data (FIX for .toFixed()) ---

            // Check if probability is a number before calling toFixed(0)
            const probabilityOutput = typeof probabilityExceedingThreshold === 'number'
                ? probabilityExceedingThreshold.toFixed(0) + '%'
                : probabilityExceedingThreshold;

            results[varName] = {
                mean: mean.toFixed(2),
                unit: config.unit,
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
