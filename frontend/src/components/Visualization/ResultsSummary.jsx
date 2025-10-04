import React from 'react';

const ResultsSummary = ({ variableKey, data, onViewDetails }) => {
  // Format variable name
  const variableName =
    variableKey.charAt(0).toUpperCase() + variableKey.slice(1).replace(/_/g, ' ');

  // Determine probability color
  let probabilityColorClass = 'text-green-400 bg-green-900/40 border border-green-500/40';
  if (data.probabilityExceedingThreshold !== 'N/A') {
    const probability = parseFloat(data.probabilityExceedingThreshold);
    if (probability >= 50) {
      probabilityColorClass = 'text-red-400 bg-red-900/40 border border-red-500/40';
    } else if (probability >= 20) {
      probabilityColorClass = 'text-yellow-300 bg-yellow-900/40 border border-yellow-500/40';
    }
  }

  return (
    <div className="p-6 border border-cyan-900/40 rounded-2xl shadow-lg bg-[#111B2E] hover:shadow-cyan-500/20 transition duration-300">
      {/* Title */}
      <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">
        {variableName}
      </h3>

      {/* Metrics */}
      <div className="mb-5 space-y-3">
        {/* Mean */}
        <div className="flex justify-between items-center text-gray-300">
          <span className="font-semibold">Historical Average:</span>
          <span className="text-2xl font-extrabold text-blue-400">
            {data.mean} {data.unit}
          </span>
        </div>

        {/* Probability */}
        <div className="flex justify-between items-center text-gray-300 pt-2 border-t border-gray-700">
          <span className="font-semibold">Exceedance Probability:</span>
          <span
            className={`px-4 py-1 rounded-full text-lg font-extrabold ${probabilityColorClass}`}
          >
            {data.probabilityExceedingThreshold}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="text-sm pt-4 border-t border-gray-700">
        <p className="font-medium text-gray-200 mb-1">Summary:</p>
        <p
          className="text-gray-400 italic leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.simpleExplanation }}
        />

        <p className="mt-2 text-xs text-gray-500">
          Source: {data.metadata.source} ({data.metadata.variableName})
        </p>
      </div>

      {/* View Details Button */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={onViewDetails}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-md transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ResultsSummary;
