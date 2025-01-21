import React from "react";

const ProgressBar = ({ progress, target }) => {
  const percentage = Math.min((progress / target) * 100, 100);  // Ensure the progress doesn't exceed 100%

  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{progress} / {target}</span>
      </div>
      <div className="flex mb-2 items-center justify-between">
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full">
          <div
            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-l-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <span className="text-sm">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;
