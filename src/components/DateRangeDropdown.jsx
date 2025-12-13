import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment";

const DateRangeDropdown = ({ onDateRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [yearError, setYearError] = useState(""); // NEW
  const dropdownRef = useRef(null);

  useEffect(() => {
    applyDateRange("all");
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const validateYear = (dateValue) => {
    const year = dateValue.split("-")[0];
    if (year && year.length !== 4) {
      setYearError("Year must be a 4-digit value");
      return false;
    }
    setYearError("");
    return true;
  };

  const applyDateRange = (range, start = null, end = null) => {
    let s = null,
      e = null;

    switch (range) {
      case "today":
        s = moment().startOf("day");
        e = moment().endOf("day");
        break;

      case "yesterday":
        s = moment().subtract(1, "day").startOf("day");
        e = moment().subtract(1, "day").endOf("day");
        break;

      case "last7days":
        s = moment().subtract(6, "days").startOf("day");
        e = moment().endOf("day");
        break;

      case "last30days":
        s = moment().subtract(29, "days").startOf("day");
        e = moment().endOf("day");
        break;

      case "thismonth":
        s = moment().startOf("month");
        e = moment().endOf("month");
        break;

      case "lastmonth":
        s = moment().subtract(1, "month").startOf("month");
        e = moment().subtract(1, "month").endOf("month");
        break;

      case "custom":
        s = start ? moment(start).startOf("day") : null;
        e = end ? moment(end).endOf("day") : null;
        break;

      default:
        s = null;
        e = null;
        break;
    }

    setSelectedRange(range);
    onDateRangeChange(s ? s.toDate() : null, e ? e.toDate() : null);
    setIsDropdownOpen(false);
  };

  const handleCustomSubmit = () => {
    setYearError(""); // Clear previous errors
    if (!customStart || !customEnd)
      return alert("Please select both dates");

    if (!validateYear(customStart) || !validateYear(customEnd)) {
      return; // Validation failed, do not proceed
    }

    applyDateRange("custom", customStart, customEnd);
  };

  const getLabel = () =>
    ({
      today: "Today",
      yesterday: "Yesterday",
      last7days: "Last 7 Days",
      last30days: "Last 30 Days",
      thismonth: "This Month",
      lastmonth: "Last Month",
      custom: "Custom Range",
      all: "All Time",
    }[selectedRange]);

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 border border-gray-300 px-4 py-2 bg-white rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50"
      >
        <FaCalendarAlt className="text-gray-500" />
        {getLabel()}
        <span className="ml-2">▼</span>
      </button>

      {isDropdownOpen && (
        <div className="mt-2 w-72 bg-white shadow-lg border rounded-md p-3 absolute left-0 sm:right-0 z-50">
          <div className="max-h-64 overflow-y-auto text-sm">

            {/* Predefined Ranges */}
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "last7days", label: "Last 7 Days" },
              { key: "last30days", label: "Last 30 Days" },
              { key: "thismonth", label: "This Month" },
              { key: "lastmonth", label: "Last Month" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => applyDateRange(item.key)}
                className={`block w-full text-left px-3 py-2 rounded-md ${
                  selectedRange === item.key
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t my-2" />

            {/* Custom Range */}
            <p className="font-medium text-gray-700 mb-1">Custom Range</p>

            <input
              type="date"
              value={customStart}
              onChange={(e) => {
                const newValue = e.target.value;
                if (!newValue || validateYear(newValue)) {
                  setCustomStart(newValue);
                }
              }}
              className="border px-3 py-2 rounded w-full mb-2"
            />

            <input
              type="date"
              value={customEnd}
              onChange={(e) => {
                const newValue = e.target.value;
                if (!newValue || validateYear(newValue)) {
                  setCustomEnd(newValue);
                }
              }}
              className="border px-3 py-2 rounded w-full mb-2"
            />

            {yearError && (
              <p className="text-red-600 text-xs mb-2">{yearError}</p>
            )}

            <button
              onClick={handleCustomSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;