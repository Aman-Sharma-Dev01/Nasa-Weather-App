import React, { useState, useEffect } from "react";

const TimeSeriesChart = ({ variableKey, unit }) => {
  // --- State for Animations and Mock Data ---
  const [isAnimated, setIsAnimated] = useState(false);

  // Generate mock historical data and probability for visualization
  const { mockData, exceedanceProbability } = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const data = Array.from({ length: 10 }, (_, i) => ({
      year: currentYear - 9 + i, // Adjusted to end with the current year
      value: Math.random() * 40 + 275, // Simulated values around 275K
    }));
    const probability = Math.floor(Math.random() * 81) + 10; // Random % from 10-90
    return { mockData: data, exceedanceProbability: probability };
  }, []);
  
  // State for the count-up animation of the probability text
  const [displayProbability, setDisplayProbability] = useState(0);

  // Trigger animations shortly after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Effect for the count-up animation
  useEffect(() => {
    if (isAnimated) {
      let start = 0;
      const end = exceedanceProbability;
      if (start === end) return;

      const duration = 1200; // Animation duration in ms
      const incrementTime = Math.max(10, Math.floor(duration / end));

      const timer = setInterval(() => {
        start += 1;
        setDisplayProbability(start);
        if (start >= end) {
          setDisplayProbability(end);
          clearInterval(timer);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isAnimated, exceedanceProbability]);


  // --- SVG Circle Chart Calculations ---
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = isAnimated
    ? circumference - (exceedanceProbability / 100) * circumference
    : circumference;

  const variableName =
    variableKey.charAt(0).toUpperCase() +
    variableKey.slice(1).replace(/_/g, " ");

  return (
    <div className="w-full bg-[#1B1E38] p-6 border border-[#2A2F4F] rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Historical Trend Bar Chart */}
        <div>
          <h4 className="text-lg font-semibold text-cyan-400 mb-4">
            Historical Trend for {variableName}
          </h4>
          <div className="h-64 flex items-end justify-between px-2 border-l border-b border-gray-600 relative">
            {mockData.map((d, index) => (
              <div key={d.year} className="flex flex-col items-center h-full justify-end group">
                <div
                  className="w-3 bg-cyan-500 rounded-t-full group-hover:bg-cyan-300"
                  style={{
                    height: isAnimated ? `${((d.value - 270) / 50) * 100}%` : "0%",
                    transformOrigin: "bottom",
                    transition: `height 0.5s ease-out ${index * 50}ms`,
                  }}
                  title={`Year ${d.year}: ${d.value.toFixed(2)} ${unit}`}
                />
                <span className="text-xs text-gray-400 mt-2">{d.year}</span>
              </div>
            ))}
            <span className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-400 origin-center">
              Value ({unit})
            </span>
          </div>
           <p className="text-center text-sm text-gray-500 mt-2">Year</p>
        </div>

        {/* Right Side: Exceedance Probability Circle Chart */}
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-lg font-semibold text-cyan-400 mb-4">
            Exceedance Probability
          </h4>
          <div className="relative">
            <svg height={radius * 2} width={radius * 2} className="-rotate-90">
              {/* Background Circle */}
              <circle
                stroke="#2A2F4F"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Progress Circle */}
              <circle
                stroke="url(#probabilityGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.2s ease-out' }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="probabilityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3ABEF9" />
                  <stop offset="100%" stopColor="#5DE2E7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {displayProbability}
                <span className="text-2xl text-gray-400">%</span>
              </span>
            </div>
          </div>
           <p className="text-center text-sm text-gray-500 mt-4">Likelihood of exceeding the set threshold.</p>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;