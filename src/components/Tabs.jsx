// src/components/ui/tabs.jsx
import React from "react";

export const Tabs = ({ value, onValueChange, children, className = "" }) => {
  return (
    <div className={`flex space-x-2 mb-4 ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isActive: child.props.value === value,
          onClick: () => onValueChange(child.props.value),
        })
      )}
    </div>
  );
};

export const Tab = ({ children, onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-blue-500 text-white shadow-md scale-105"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
};
