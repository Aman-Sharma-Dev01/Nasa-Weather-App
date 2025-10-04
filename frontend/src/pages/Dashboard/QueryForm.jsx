import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import 'leaflet-geosearch/dist/geosearch.css';
import { useDashboard } from "../../context/DashboardContext";
import { runWeatherQuery, createDashboard } from "../../api/apiService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import L from "leaflet";

const NASA_VARIABLES = [
    { name: "Temperature", key: "temperature", unit: "Fahrenheit / Kelvin" },
    { name: "Precipitation Rate", key: "precipitation", unit: "mm/hr" },
    { name: "Wind Speed (10m)", key: "windspeed", unit: "m/s" },
    { name: "Relative Humidity (2m)", key: "relative_humidity", unit: "%" },
    { name: "Solar Insolation", key: "solar_insolation", unit: "W/m^2" },
    { name: "Solar Radiation", key: "solar_radiation", unit: "unitless" },
];

// Custom icon for the map marker
const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [30, 30],
});

/**
 * A combined component to handle map interactions like clicking to set a marker
 * and integrating the geosearch (address search) functionality.
 */
const MapEvents = ({ setCoords }) => {
    const map = useMap();

    // Handle map clicks to set coordinates and move the view
    useMapEvents({
        click(e) {
            setCoords(e.latlng);
            map.setView(e.latlng, map.getZoom()); // Makes the map "stick" to the clicked location
        },
    });

    // Add search control functionality
    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: true,
            autoClose: true,
            keepResult: true,
            searchLabel: 'Enter address',
        });

        map.addControl(searchControl);

        const onShowLocation = (result) => {
            const { x: lon, y: lat } = result.location;
            setCoords({ lat, lng: lon });
        };

        map.on('geosearch/showlocation', onShowLocation);

        // Cleanup function to remove control and event listener
        return () => {
            map.removeControl(searchControl);
            map.off('geosearch/showlocation', onShowLocation);
        };
    }, [map, setCoords]);

    return null;
};


const QueryForm = () => {
    const { currentQuery, setCurrentQuery, setQueryResults, fetchSavedDashboards } =
    useDashboard();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    
    // --- MODIFICATIONS START ---

    // Prefill dashboard name for the default location
    const [dashboardName, setDashboardName] = useState("Faridabad - Full Weather Report");
    
    // Prefill all threshold inputs with average data
    const [thresholdInput, setThresholdInput] = useState({
        temperature: { value: "75" },        // Average temperate day in Fahrenheit
        precipitation: { value: "0.5" },     // Light precipitation
        windspeed: { value: "3" },           // Gentle breeze in m/s
        relative_humidity: { value: "65" },  // Average humidity
        solar_insolation: { value: "500" },   // Moderately sunny
        solar_radiation: { value: "50" },     // Average unitless value
    });

    // Default date to today
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Set default query state on component mount
    useEffect(() => {
        const faridabadCoords = { lat: 28.4089, lon: 77.3178 };
        // Select all variables by default
        const defaultVariables = NASA_VARIABLES.map(v => v.key);
        // Set thresholds for all variables
        const defaultThresholds = [
            { variable: "temperature", value: 75, unit: "F" },
            { variable: "precipitation", value: 0.5, unit: "mm/hr" },
            { variable: "windspeed", value: 3, unit: "m/s" },
            { variable: "relative_humidity", value: 65, unit: "%" },
            { variable: "solar_insolation", value: 500, unit: "W/m^2" },
            { variable: "solar_radiation", value: 50, unit: "unitless" }
        ];

        setCurrentQuery(prev => ({
            ...prev,
            location: faridabadCoords,
            variables: defaultVariables,
            thresholds: defaultThresholds,
        }));
    }, [setCurrentQuery]); // Run only once on initial render

    // --- MODIFICATIONS END ---

    // Update lat/lon when user selects on map or search
    const handleCoordsChange = (coords) => {
        setCurrentQuery((prev) => ({
            ...prev,
            location: { lat: coords.lat, lon: coords.lng },
        }));
    };

    const handleVariableToggle = (key) => {
        setCurrentQuery((prev) => {
            const newVariables = prev.variables.includes(key) ?
                prev.variables.filter((v) => v !== key) :
                [...prev.variables, key];
            const newThresholds = prev.thresholds.filter((t) =>
                newVariables.includes(t.variable)
            );
            return { ...prev, variables: newVariables, thresholds: newThresholds };
        });
        setMessage("");
    };

    const handleThresholdChange = (key, value) => {
        setThresholdInput((prev) => ({ ...prev, [key]: { value } }));
    };

    const handleAddThreshold = (key, unit) => {
        const inputData = thresholdInput[key];
        const primaryUnit = unit.split("/")[0].trim();
        const finalUnit = primaryUnit === "Fahrenheit" ? "F" : primaryUnit;

        if (!inputData?.value) {
            setMessage(`Please enter a valid threshold for ${key}.`);
            return;
        }

        const newThreshold = {
            variable: key,
            value: parseFloat(inputData.value),
            unit: finalUnit,
        };
        setCurrentQuery((prev) => ({
            ...prev,
            thresholds: [
                ...prev.thresholds.filter((t) => t.variable !== key),
                newThreshold,
            ],
        }));
        setMessage(
            `Threshold added for ${key}: ${newThreshold.value} ${newThreshold.unit}.`
        );
    };

    const handleRemoveThreshold = (key) => {
        setCurrentQuery((prev) => ({
            ...prev,
            thresholds: prev.thresholds.filter((t) => t.variable !== key),
        }));
        setMessage(`Threshold removed for ${key}.`);
    };

    const handleSubmitQuery = async (e) => {
        e.preventDefault();
        if (currentQuery.variables.length === 0) {
            setMessage("Please select at least one variable.");
            return;
        }

        const { lat, lon } = currentQuery.location || {};
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            setMessage("Please enter valid coordinates.");
            return;
        }

        // convert date to day of year
        const start = new Date(selectedDate.getFullYear(), 0, 0);
        const diff =
            selectedDate - start + (start.getTimezoneOffset() - selectedDate.getTimezoneOffset()) * 60 * 1000;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        setCurrentQuery((prev) => ({ ...prev, dayOfYear }));

        setLoading(true);
        setQueryResults(null);
        setMessage("");

        try {
            const data = await runWeatherQuery({ ...currentQuery, dayOfYear });
            setQueryResults(data);
            setMessage("Query executed successfully!");
        } catch (err) {
            console.error(err);
            setMessage(`Error running query: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDashboard = async () => {
        if (!dashboardName.trim()) {
            setMessage("Please enter a name for the dashboard.");
            return;
        }
        if (currentQuery.variables.length === 0) {
            setMessage("Select at least one variable before saving.");
            return;
        }

        const { lat, lon } = currentQuery.location || {};
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            setMessage("Cannot save: Invalid coordinates.");
            return;
        }

        const dashboardData = {
            name: dashboardName.trim(),
            location: "Pin",
            details: currentQuery.location,
            dayOfYear: currentQuery.dayOfYear,
            selectedVariables: currentQuery.variables,
            thresholds: currentQuery.thresholds,
        };

        try {
            setLoading(true);
            await createDashboard(dashboardData);
            setDashboardName("");
            await fetchSavedDashboards();
            setMessage(`Dashboard "${dashboardName.trim()}" saved successfully!`);
        } catch (err) {
            setMessage(`Failed to save dashboard: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const getActiveThreshold = (key) =>
        currentQuery.thresholds.find((t) => t.variable === key);

    return (
        <>
            {/* FIX: Add this style block to override the search bar text color */}
            <style>{`
                .leaflet-geosearch-bar form input,
                .geosearch.bar form input {
                    color: black !important;
                }
                .leaflet-geosearch-bar form input::placeholder,
                .geosearch.bar form input::placeholder {
                    color: #333 !important;
                }
            `}</style>
            <form
                onSubmit={handleSubmitQuery}
                className="bg-[#0B113A] border border-[#1E2A78] rounded-2xl p-6 text-gray-100"
            >
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">
                    🌍 New Weather Dashboard Query
                </h2>

                {/* Map Section */}
                <div className="mb-6 ">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">📍 Select Location</h3>
                    <p className="text-xs text-gray-400 mb-2">
                        Click on the map or search to set coordinates.
                    </p>
                    <MapContainer
                        // --- MODIFICATION ---
                        center={[28.4089, 77.3178]} // Default to Faridabad
                        zoom={11} // Zoom in on the city
                        style={{ height: "300px", width: "100%", zIndex: 0 }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="© OpenStreetMap"
                        />
                        {currentQuery.location?.lat && currentQuery.location?.lon && (
                            <Marker
                                position={[currentQuery.location.lat, currentQuery.location.lon]}
                                icon={customIcon}
                            />
                        )}
                        <MapEvents setCoords={handleCoordsChange} />
                    </MapContainer>
                </div>

                {/* Calendar */}
                <div className="mb-6">
                    <label className="block text-sm text-cyan-300 mb-1">📅 Select Date</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MMMM d, yyyy"
                        className="bg-[#060B28] border border-[#24318D] rounded-lg px-3 py-2 text-sm text-gray-200"
                    />
                </div>

                {/* Variables & Thresholds */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Variables</h3>
                    {NASA_VARIABLES.map((v) => (
                        <div
                            key={v.key}
                            className="bg-[#0D1448] border border-[#1E2A78] rounded-lg p-3 mb-2"
                        >
                            <div className="flex justify-between items-center">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentQuery.variables.includes(v.key)}
                                        onChange={() => handleVariableToggle(v.key)}
                                        className="h-4 w-4 text-cyan-500"
                                    />
                                    <span className="text-gray-200">
                                        {v.name} <span className="text-xs text-gray-500">({v.unit})</span>
                                    </span>
                                </label>
                            </div>
                            {currentQuery.variables.includes(v.key) && (
                                <div className="mt-2 flex items-center space-x-2 pl-6">
                                    <input
                                        type="number"
                                        placeholder={`Value in ${v.unit.split("/")[0]}`}
                                        value={thresholdInput[v.key]?.value || ""}
                                        onChange={(e) => handleThresholdChange(v.key, e.target.value)}
                                        className="bg-[#060B28] border border-[#24318D] rounded-lg px-2 py-1 text-sm text-gray-200"
                                    />
                                    {!getActiveThreshold(v.key) ? (
                                        <button
                                            type="button"
                                            onClick={() => handleAddThreshold(v.key, v.unit)}
                                            className="bg-cyan-600 px-2 py-1 text-xs rounded"
                                        >
                                            Add
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveThreshold(v.key)}
                                            className="bg-red-600 px-2 py-1 text-xs rounded"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <button
                        type="submit"
                        disabled={loading || currentQuery.variables.length === 0}
                        className="bg-cyan-600 px-6 py-2 rounded-lg font-semibold text-white disabled:bg-gray-600"
                    >
                        {loading ? "Running..." : "Run Query"}
                    </button>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Dashboard Name"
                            value={dashboardName}
                            onChange={(e) => setDashboardName(e.target.value)}
                            className="bg-[#060B28] border border-[#24318D] rounded-lg px-3 py-2 text-sm text-gray-200"
                        />
                        <button
                            type="button"
                            onClick={handleSaveDashboard}
                            disabled={loading || !dashboardName.trim()}
                            className="bg-purple-600 px-4 py-2 rounded-lg text-sm text-white disabled:bg-gray-600"
                        >
                            Save
                        </button>
                    </div>
                </div>

                {message && (
                    <p className="mt-4 p-2 text-sm text-center bg-[#0D1448] rounded-lg text-cyan-300">
                        {message}
                    </p>
                )}
            </form>
        </>
    );
};

export default QueryForm;