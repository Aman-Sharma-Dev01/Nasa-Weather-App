import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { deleteDashboard } from '../../api/apiService';

const SavedDashboards = () => {
  const { 
    savedDashboards, 
    fetchSavedDashboards, 
    loadingDashboards, 
    dashboardError, 
    setCurrentQuery,
    setQueryResults 
  } = useDashboard();

  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!savedDashboards.length && !loadingDashboards) {
      fetchSavedDashboards();
    }
  }, [savedDashboards.length, loadingDashboards, fetchSavedDashboards]);

  const formatVariables = (vars) =>
    vars.map(v => v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ')).join(', ');

  const formatLocationDetails = (locationType, details) => {
    if (!details) return `${locationType}: Unknown`;
    const lat = details.lat;
    const lon = details.lon;
    if (typeof lat === 'number' && typeof lon === 'number') {
      return `${locationType}: Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
    }
    if (details.city) return `${locationType}: ${details.city}`;
    return `${locationType}: Invalid Coordinates`;
  };

  const handleLoadQuery = (dashboard) => {
    const queryToLoad = {
      location: dashboard.details,
      dayOfYear: dashboard.dayOfYear,
      variables: dashboard.selectedVariables,
      thresholds: dashboard.thresholds || [],
    };
    setCurrentQuery(queryToLoad);
    setQueryResults(null);
    setMessage(`Loaded configuration: ${dashboard.name}. Run query below.`);
    if (window.location.pathname !== '/dashboard') navigate('/dashboard');
  };

  const handleDeleteConfirm = (id, name) => {
    setMessage('');
    setConfirmDelete({ id, name });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteDashboard(id);
      await fetchSavedDashboards();
      setMessage(`Dashboard "${name}" successfully deleted.`);
    } catch (err) {
      setMessage(`Error deleting dashboard: ${err.toString()}`);
    }
  };

  return (
    <div className="bg-[#0B1120] text-gray-100 p-6 rounded-2xl shadow-lg border border-[#1E2A47] min-h-full relative z-50">
      <h2 className="text-3xl font-bold text-[#00C2FF] mb-6 border-b border-[#1E2A47] pb-2">
        Saved Dashboards
      </h2>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="bg-[#131C31] p-6 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-red-500">
            <p className="text-lg font-semibold text-gray-100 mb-4">Confirm Deletion</p>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-red-400">"{confirmDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#1E2A47] rounded-lg hover:bg-[#2C3A66] transition"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <p
          className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.startsWith('Error')
              ? 'bg-red-900/40 text-red-300 border border-red-700'
              : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
          }`}
        >
          {message}
        </p>
      )}

      {/* Loading State */}
      {loadingDashboards && (
        <div className="text-center p-10">
          <svg
            className="animate-spin h-8 w-8 text-[#00C2FF] mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-400">Loading saved dashboards...</p>
        </div>
      )}

      {/* Error State */}
      {dashboardError && (
        <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-lg">
          <p>{dashboardError}</p>
        </div>
      )}

      {/* Empty State */}
      {!loadingDashboards && savedDashboards.length === 0 && (
        <div className="text-center p-10 bg-[#101B33] border border-[#1E2A47] rounded-xl">
          <p className="text-lg text-gray-300">No dashboards saved yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Use the Query Form to create and save your first configuration.
          </p>
        </div>
      )}

      {/* Dashboards List */}
      <div className="space-y-4">
        {savedDashboards.map((dashboard) => (
          <div
            key={dashboard._id}
            className="p-5 border border-[#1E2A47] rounded-xl bg-[#131C31] shadow-md hover:shadow-lg transition-all"
          >
            <h3 className="text-xl font-bold text-[#00C2FF] mb-2">{dashboard.name}</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong className="text-gray-400">Day of Year:</strong>{' '}
                <span className="font-semibold text-[#7FDBFF]">{dashboard.dayOfYear}</span>
              </p>
              <p>
                <strong className="text-gray-400">Location:</strong>{' '}
                {formatLocationDetails(dashboard.location, dashboard.details)}
              </p>
              <p>
                <strong className="text-gray-400">Variables:</strong>{' '}
                <span className="text-xs px-2 py-0.5 bg-[#1B2B47] text-[#7FDBFF] rounded-full">
                  {formatVariables(dashboard.selectedVariables)}
                </span>
              </p>

              {dashboard.thresholds && dashboard.thresholds.length > 0 && (
                <p>
                  <strong className="text-gray-400">Thresholds:</strong>
                  {dashboard.thresholds.map((t, index) => (
                    <span
                      key={index}
                      className="text-xs ml-2 px-2 py-0.5 bg-yellow-900/30 text-yellow-300 border border-yellow-700 rounded-full"
                    >
                      {t.variable}: {t.value} {t.unit}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div className="mt-5 flex space-x-3">
              <button
                onClick={() => handleLoadQuery(dashboard)}
                className="px-4 py-2 text-sm font-semibold bg-[#00C2FF] text-black rounded-lg hover:bg-[#00A6E0] transition shadow-md"
              >
                Load & Run Query
              </button>
              <button
                onClick={() => handleDeleteConfirm(dashboard._id, dashboard.name)}
                className="px-4 py-2 text-sm font-semibold border border-red-500 text-red-400 rounded-lg hover:bg-red-900/30 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedDashboards;
