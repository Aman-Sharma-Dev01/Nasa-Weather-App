import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import ResultsSummary from '../components/Visualization/ResultsSummary';
import TimeSeriesChart from '../components/Visualization/TimeSeriesChart';
import { getDownloadUrl } from '../api/apiService';

const ResultsPage = () => {
    const { queryResults, currentQuery } = useDashboard();
    const navigate = useNavigate();

    // --- 1. State Check ---
    if (!queryResults) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-red-600 mb-4">No Results Found</h2>
                <p className="text-lg text-gray-700 mb-6">Please run a query from the dashboard first.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition"
                >
                    Go to Query Form
                </button>
            </div>
        );
    }

    const { downloadLink, queryResults: resultsData, visualizations } = queryResults;
    const locationStr = `Lat: ${currentQuery.location.lat}, Lon: ${currentQuery.location.lon}`;
    const dayStr = `Day ${currentQuery.dayOfYear} of the Year`;

    // Extract keys to iterate over (e.g., 'temperature', 'windspeed')
    const variableKeys = Object.keys(resultsData);

    return (
        <div className="p-6 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Query Results for {locationStr}</h2>
                <p className="text-xl text-gray-600 mb-4 border-b pb-4">{dayStr} (Historical Data)</p>

                {/* Download Button */}
                <div className="flex justify-end mb-6">
                    <a
                        href={getDownloadUrl(downloadLink.split('/').pop())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Download Raw Data (CSV)</span>
                    </a>
                </div>

                {/* Results Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {variableKeys.map(key => (
                        <ResultsSummary 
                            key={key} 
                            variableKey={key} 
                            data={resultsData[key]} 
                        />
                    ))}
                </div>
            </div>

            {/* Visualization Section */}
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
                <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Historical Visualizations</h3>
                
                {variableKeys.map(key => (
                    <div key={`chart-${key}`} className="mb-10 p-4 border border-gray-200 rounded-lg">
                        <h4 className="text-xl font-semibold text-indigo-700 mb-4">{key.replace('_', ' ').toUpperCase()} Trend</h4>
                        <p className="text-sm text-gray-500 mb-4">{visualizations.find(v => v.includes(key))}</p>
                        
                        {/* NOTE: In a real app, TimeSeriesChart would fetch/use the raw 
                            historical data from the backend to render the graph. 
                            Here, it uses the key and current query state for simulation. 
                        */}
                        <TimeSeriesChart 
                            variableKey={key} 
                            unit={resultsData[key].unit}
                        />
                    </div>
                ))}
            </div>
            
            <div className="text-center pt-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition"
                >
                    Run Another Query
                </button>
            </div>
        </div>
    );
};

export default ResultsPage;
