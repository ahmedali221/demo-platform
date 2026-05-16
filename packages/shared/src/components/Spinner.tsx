import React from "react";

const Spinner = ({ size = "h-8 w-8", color = "border-blue-500" }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${size} border-4 border-gray-200 ${color} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Spinner;
