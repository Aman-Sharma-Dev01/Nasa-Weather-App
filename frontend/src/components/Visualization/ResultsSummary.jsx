import React from 'react';

const ResultsSummary = ({ variableKey, data }) => {
    // Helper to capitalize and format the key for display
    const variableName = variableKey.charAt(0).toUpperCase() + variableKey.slice(1).replace(/_/g, ' ');

    // Determine color based on probability threshold for visual impact
    let probabilityColorClass = 'text-green-600 bg-green-100';
    if (data.probabilityExceedingThreshold !== 'N/A') {
        const probability = parseFloat(data.probabilityExceedingThreshold);
        if (probability >= 50) {
            probabilityColorClass = 'text-red-600 bg-red-100';
        } else if (probability >= 20) {
            probabilityColorClass = 'text-yellow-700 bg-yellow-100';
        }
    }

    return (
        <div className="p-5 border border-gray-200 rounded-xl shadow-md bg-gray-50 hover:shadow-lg transition duration-200">
            <h3 className="text-xl font-bold text-indigo-700 mb-3 border-b pb-2">
                {variableName}
            </h3>
            
            <div className="mb-4 space-y-2">
                {/* Mean Value */}
                <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">Historical Average:</span>
                    <span className="text-2xl font-extrabold text-blue-600">
                        {data.mean} {data.unit}
                    </span>
                </div>

                {/* Probability */}
                <div className="flex justify-between items-center text-gray-700 pt-2 border-t border-gray-100">
                    <span className="font-semibold">Exceedance Probability:</span>
                    <span className={`px-4 py-1 rounded-full text-lg font-extrabold ${probabilityColorClass}`}>
                        {data.probabilityExceedingThreshold}
                    </span>
                </div>
            </div>

            {/* Simple Explanation */}
            <div className="text-sm pt-3 border-t border-gray-200">
                <p className="font-medium text-gray-800 mb-1">Summary:</p>
                <p className="text-gray-600 italic leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: data.simpleExplanation }} 
                />
                
                <p className="mt-2 text-xs text-gray-500">
                    Source: {data.metadata.source} ({data.metadata.variableName})
                </p>
            </div>
        </div>
    );
};

export default ResultsSummary;
