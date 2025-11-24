import React from "react";

const TableRowSkeleton = () => {
  return (
    <tr className="bg-white even:bg-gray-50">
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </td>
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </td>
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </td>
    </tr>
  );
};

export default TableRowSkeleton;
