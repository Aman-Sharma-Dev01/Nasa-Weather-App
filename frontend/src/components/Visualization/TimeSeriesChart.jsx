import React from 'react';

// NOTE: This is a placeholder component. In a real application, you would integrate a 
// charting library like Recharts or Chart.js here. For simplicity, we simulate the visualization.

const TimeSeriesChart = ({ variableKey, unit }) => {
    // Generate mock historical data for visualization simulation
    const mockData = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => ({
            year: currentYear - 10 + i,
            value: (Math.random() * 50) + 270, // Simulated values near 273K (0C)
        }));
    }, []);

    const variableName = variableKey.charAt(0).toUpperCase() + variableKey.slice(1).replace(/_/g, ' ');

    return (
        <div className="w-full bg-white p-4 border border-blue-100 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Historical Trend for {variableName}
            </h4>
            
            {/* Simulation of the Chart Area */}
            <div className="h-64 flex flex-col justify-end items-start border-l border-b border-gray-300 relative">
                <div className="absolute top-0 left-0 w-full h-full p-2 text-center text-gray-400 text-sm">
                    [Placeholder for Line Chart: Showing value trend over the last 10 years]
                </div>

                {/* Simulated Data Points */}
                {mockData.map((d, index) => (
                    <div 
                        key={d.year}
                        className="absolute bottom-0 text-xs text-gray-600"
                        style={{ left: `${index * 10}%`, transform: 'translateX(-50%)' }}
                    >
                        <div 
                            className={`w-1 bg-indigo-400 rounded-t-full mx-auto`}
                            style={{ height: `${(d.value - 270) * 3}px` }} // Scale height based on value
                            title={`Year ${d.year}: ${d.value.toFixed(2)} ${unit}`}
                        ></div>
                        <span className="mt-1 block">{d.year}</span>
                    </div>
                ))}

                {/* Y-Axis Label */}
                <span className="absolute -left-10 top-1/2 -translate-y-1/2 rotate-90 text-sm font-medium text-gray-500">{unit}</span>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">Year</p>
        </div>
    );
};

export default TimeSeriesChart;
