import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import ResultsSummary from '../components/Visualization/ResultsSummary';
import TimeSeriesChart from '../components/Visualization/TimeSeriesChart';
import { getDownloadUrl } from '../api/apiService';

const ResultsPage = () => {
  const { queryResults, currentQuery } = useDashboard();
  const navigate = useNavigate();

  const [activeVariable, setActiveVariable] = useState(null);

  // --- 1. State Check ---
  if (!queryResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-[#0B1120] rounded-2xl shadow-2xl text-white">
        <h2 className="text-3xl font-extrabold text-cyan-400 mb-4">No Results Found</h2>
        <p className="text-lg text-gray-400 mb-6">
          Please run a query from the dashboard first.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl shadow-md hover:bg-cyan-700 transition"
        >
          Go to Query Form
        </button>
      </div>
    );
  }

  const { downloadLink, queryResults: resultsData } = queryResults;
  const locationStr = `Lat: ${currentQuery.location.lat}, Lon: ${currentQuery.location.lon}`;
  const dayStr = `Day ${currentQuery.dayOfYear} of the Year`;

  const variableKeys = Object.keys(resultsData);

  return (
    <div className="min-h-screen bg-[#050818] p-8 text-gray-100 space-y-10">
      {/* --- Header Card --- */}
      <div className="bg-[#0B1222] p-8 rounded-2xl shadow-lg border border-cyan-900/30">
        <h2 className="text-4xl font-bold text-cyan-400 mb-2">
          Query Results for <span className="text-white">{locationStr}</span>
        </h2>
        <p className="text-lg text-gray-400 mb-6 border-b border-gray-700 pb-3">
          {dayStr} (Historical Data)
        </p>

        {/* --- Action Buttons --- */}
        <div className="flex justify-end space-x-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 bg-gray-800 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
          <a
            href={getDownloadUrl(downloadLink.split('/').pop())}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-md flex items-center space-x-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Download Data</span>
          </a>
        </div>

        {/* --- Summary Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {variableKeys.map((key) => (
            <ResultsSummary
              key={key}
              variableKey={key}
              data={resultsData[key]}
              onViewDetails={() => setActiveVariable(key)}
            />
          ))}
        </div>
      </div>

      {/* --- Popup Modal for Chart --- */}
      {activeVariable && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-[#0B1222] w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 rounded-2xl shadow-2xl border border-cyan-900/30 p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setActiveVariable(null)}
              className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-cyan-400 mb-4">
              {activeVariable.replace('_', ' ').toUpperCase()} Trend
            </h3>

            <div className="bg-[#111B2E] border border-cyan-900/30 rounded-xl p-6 shadow-md">
              <TimeSeriesChart
                variableKey={activeVariable}
                unit={resultsData[activeVariable].unit}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Footer --- */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold rounded-xl transition"
        >
          Run Another Query
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
