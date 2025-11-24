import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment";

const DateRangeDropdown = ({ onDateRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const dropdownRef = useRef(null);

  // Default “All Time” on mount
  useEffect(() => {
    applyDateRange("all");
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to apply range
  const applyDateRange = (range, start = null, end = null) => {
    let startDate = null;
    let endDate = null;

    switch (range) {
      case "today":
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
        break;
      case "yesterday":
        startDate = moment().subtract(1, "days").startOf("day");
        endDate = moment().subtract(1, "days").endOf("day");
        break;
      case "last7days":
        startDate = moment().subtract(6, "days").startOf("day");
        endDate = moment().endOf("day");
        break;
      case "last30days":
        startDate = moment().subtract(29, "days").startOf("day");
        endDate = moment().endOf("day");
        break;
      case "last90days":
        startDate = moment().subtract(89, "days").startOf("day");
        endDate = moment().endOf("day");
        break;
      case "thismonth":
        startDate = moment().startOf("month");
        endDate = moment().endOf("month");
        break;
      case "lastmonth":
        startDate = moment().subtract(1, "month").startOf("month");
        endDate = moment().subtract(1, "month").endOf("month");
        break;
      case "thisyear":
        startDate = moment().startOf("year");
        endDate = moment().endOf("year");
        break;
      case "lastyear":
        startDate = moment().subtract(1, "year").startOf("year");
        endDate = moment().subtract(1, "year").endOf("year");
        break;
      case "custom":
        startDate = start ? moment(start).startOf("day") : null;
        endDate = end ? moment(end).endOf("day") : null;
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
        break;
    }

    setSelectedRange(range);
    onDateRangeChange(
      startDate ? startDate.toDate() : null,
      endDate ? endDate.toDate() : null
    );
    setIsDropdownOpen(false);
  };

  const getRangeText = () => {
    switch (selectedRange) {
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "last7days": return "Last 7 Days";
      case "last30days": return "Last 30 Days";
      case "last90days": return "Last 90 Days";
      case "thismonth": return "This Month";
      case "lastmonth": return "Last Month";
      case "thisyear": return "This Year";
      case "lastyear": return "Last Year";
      case "custom": return "Custom Range";
      default: return "All Time";
    }
  };

  const handleCustomSearch = () => {
    if (!customStart || !customEnd) {
      alert("Please select both start and end dates");
      return;
    }
    applyDateRange("custom", customStart, customEnd);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-[9999]">
      {/* Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaCalendarAlt className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
        {getRangeText()}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1 max-h-64 overflow-y-auto">
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "last7days", label: "Last 7 Days" },
              { key: "last30days", label: "Last 30 Days" },
              { key: "last90days", label: "Last 90 Days" },
              { key: "thismonth", label: "This Month" },
              { key: "lastmonth", label: "Last Month" },
              { key: "thisyear", label: "This Year" },
              { key: "lastyear", label: "Last Year" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => applyDateRange(item.key)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedRange === item.key
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t my-2"></div>

            {/* Custom Range Section */}
            <div className="px-4 pb-3">
              <p className="text-sm font-medium text-gray-600 mb-2">Custom Range</p>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleCustomSearch}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1.5 rounded-md shadow-md transition"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;
