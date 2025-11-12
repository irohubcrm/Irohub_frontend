import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
  useTransition,
} from "react";
import Sidebar from "./Sidebar";
import MonthlyLeadsChart from "../components/BarChart";
import LeadStatusPieChart from "../components/PieChart";
import { FaBars, FaChartBar } from "react-icons/fa";
import Icons from "./Icons";
import Spinner from "../components/Spinner";
import useDebounce from "../utils/useDebounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listleads } from "../services/leadsRouter";

// Lazy heavy tabs
const StaffReport = React.lazy(() => import("../components/StaffReport"));
const CustomerReport = React.lazy(() => import("../components/CustomerReport"));

// Lightweight ErrorBoundary for Suspense fallback
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    // optionally log
    // console.error(error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg text-red-700">
          Something went wrong. Try refreshing the tab.
        </div>
      );
    }
    return this.props.children;
  }
}

// Row component memoized to avoid re-renders
const LeadRow = React.memo(function LeadRow({ lead }) {
  const created = lead.createdAt
    ? new Date(lead.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const statusClasses = useMemo(() => {
    switch (lead.status) {
      case "converted":
        return "bg-green-100 text-green-700";
      case "open":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "closed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, [lead.status]);

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-2 sm:px-4 py-2 truncate">{lead.name || "N/A"}</td>
      <td className="px-2 sm:px-4 py-2 truncate">{lead.email || "N/A"}</td>
      <td className="px-2 sm:px-4 py-2">{lead.mobile || "N/A"}</td>
      <td className="px-2 sm:px-4 py-2 capitalize">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses}`}
        >
          {lead.status || "N/A"}
        </span>
      </td>
      <td className="px-2 sm:px-4 py-2">{created}</td>
      <td className="px-2 sm:px-4 py-2 capitalize truncate">
        {lead?.source?.title || "N/A"}
      </td>
      <td className="px-2 sm:px-4 py-2 capitalize truncate">
        {lead?.assignedTo?.name || "N/A"}
      </td>
    </tr>
  );
});

// Virtualized list wrapper (optional: requires react-window)
function VirtualizedLeads({ leads, RowComponent, height = 400 }) {
  // Try to import react-window dynamically (so app doesn't crash if not installed)
  let FixedSizeList;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    FixedSizeList = require("react-window").FixedSizeList;
  } catch {
    FixedSizeList = null;
  }

  if (!FixedSizeList) {
    // fallback: plain table
    return (
      <div className="overflow-x-auto max-h-[400px]">
        <table className="min-w-full text-xs sm:text-sm border-collapse">
          <thead className="bg-blue-600 text-white font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left">Name</th>
              <th className="px-2 sm:px-4 py-2 text-left">Email</th>
              <th className="px-2 sm:px-4 py-2 text-left">Phone</th>
              <th className="px-2 sm:px-4 py-2 text-left">Status</th>
              <th className="px-2 sm:px-4 py-2 text-left">Created</th>
              <th className="px-2 sm:px-4 py-2 text-left">Source</th>
              <th className="px-2 sm:px-4 py-2 text-left">Assigned To</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {leads.map((l) => (
              <LeadRow key={l._id} lead={l} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Virtualized table using react-window
  const rowHeight = 56;
  const ColumnHeader = () => (
    <div className="grid grid-cols-7 gap-0 font-semibold text-sm sticky top-0 bg-blue-600 text-white z-10">
      <div className="px-2 py-3 text-left truncate">Name</div>
      <div className="px-2 py-3 text-left truncate">Email</div>
      <div className="px-2 py-3 text-left">Phone</div>
      <div className="px-2 py-3 text-left">Status</div>
      <div className="px-2 py-3 text-left">Created</div>
      <div className="px-2 py-3 text-left truncate">Source</div>
      <div className="px-2 py-3 text-left truncate">Assigned To</div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <ColumnHeader />
      <div style={{ height }}>
        <FixedSizeList
          height={height}
          itemCount={leads.length}
          itemSize={rowHeight}
          width="100%"
        >
          {({ index, style }) => {
            const lead = leads[index];
            return (
              <div
                style={style}
                key={lead._id}
                className="border-b border-gray-200"
              >
                <div className="grid grid-cols-7 gap-0 text-xs sm:text-sm text-gray-800">
                  <div className="px-2 sm:px-4 py-3 truncate">
                    {lead.name || "N/A"}
                  </div>
                  <div className="px-2 sm:px-4 py-3 truncate">
                    {lead.email || "N/A"}
                  </div>
                  <div className="px-2 sm:px-4 py-3">
                    {lead.mobile || "N/A"}
                  </div>
                  <div className="px-2 sm:px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        lead.status === "converted"
                          ? "bg-green-100 text-green-700"
                          : lead.status === "open"
                          ? "bg-yellow-100 text-yellow-700"
                          : lead.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : lead.status === "closed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lead.status || "N/A"}
                    </span>
                  </div>
                  <div className="px-2 sm:px-4 py-3">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                  <div className="px-2 sm:px-4 py-3 truncate">
                    {lead?.source?.title || "N/A"}
                  </div>
                  <div className="px-2 sm:px-4 py-3 truncate">
                    {lead?.assignedTo?.name || "N/A"}
                  </div>
                </div>
              </div>
            );
          }}
        </FixedSizeList>
      </div>
    </div>
  );
}

function Subadminreports() {
  const queryClient = useQueryClient();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeReports, setActiveReports] = useState("lead");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [leadPage, setLeadPage] = useState(1);

  // React 18 transition for non-blocking UI updates
  const [isPending, startTransition] = useTransition();

  // Month filter
  const currentDate = useMemo(() => new Date(), []);
  const monthFilter = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [currentDate]);

  // Query key memoized
  const queryKey = useMemo(
    () => ["MonthlyLeads", monthFilter, leadPage, debouncedSearchQuery],
    [monthFilter, leadPage, debouncedSearchQuery]
  );

  const {
    data: initialLeadsData,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () =>
      listleads({
        page: leadPage,
        date: monthFilter,
        searchText: debouncedSearchQuery,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      // prefetch next page if available (fast pagination UX)
      if (data?.totalPages && leadPage < data.totalPages) {
        queryClient.prefetchQuery(
          ["MonthlyLeads", monthFilter, leadPage + 1, debouncedSearchQuery],
          () =>
            listleads({
              page: leadPage + 1,
              date: monthFilter,
              searchText: debouncedSearchQuery,
            })
        );
      }
    },
  });

  // memoized table headers
  const leadTableHeaders = useMemo(
    () => [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Created",
      "Source",
      "Assigned To",
    ],
    []
  );

  // Stable handlers
  const handleSearchChange = useCallback((e) => {
    const v = e.target.value;
    // Use startTransition to avoid blocking UI while query re-runs
    startTransition(() => {
      setSearchQuery(v);
      // reset page when searching
      setLeadPage(1);
    });
  }, []);

  const goPrevious = useCallback(() => {
    startTransition(() => setLeadPage((p) => Math.max(p - 1, 1)));
  }, []);

  const goNext = useCallback(() => {
    startTransition(() =>
      setLeadPage((p) => Math.min(p + 1, initialLeadsData?.totalPages || p + 1))
    );
  }, [initialLeadsData?.totalPages]);

  // Switch tabs non-blocking
  const switchTab = useCallback((tab) => {
    startTransition(() => setActiveReports(tab));
  }, []);

  // Avoid rendering heavy charts during small screens / when no data
  const memoizedLeads = useMemo(
    () => initialLeadsData?.leads || [],
    [initialLeadsData?.leads]
  );

  // Small skeleton / placeholder for charts
  const ChartSkeleton = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-40 bg-gray-200 rounded-lg" />
      <div className="h-24 bg-gray-200 rounded-lg" />
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-100 overflow-x-hidden">
      {/* Sidebar */}
      <div
        className={`w-64 h-full fixed top-0 left-0 z-50 transition-transform duration-200 ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main */}
      <div
        style={{ marginLeft: sidebarVisible ? "16rem" : "0" }}
        className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-200"
      >
        {/* Header */}
        <div className="relative flex flex-col sm:flex-row justify-between items-start p-4 sm:p-6 bg-gray-100 border-b border-gray-300">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0 flex items-center">
            <button
              aria-label="Toggle sidebar"
              className="mr-4 text-blue-600 hover:text-blue-800 transition-none"
              onClick={() => setSidebarVisible((s) => !s)}
            >
              <FaBars className="text-lg sm:text-xl" />
            </button>
            Reports{" "}
            {isPending && (
              <span className="ml-3 text-sm text-gray-500">Updating…</span>
            )}
          </h3>
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
            <Icons />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
            {["lead", "staff", "customer"].map((type) => {
              const active = activeReports === type;
              return (
                <button
                  key={type}
                  onClick={() => switchTab(type)}
                  className={`px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition ${
                    active
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {type[0].toUpperCase() + type.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Lead Report */}
          {activeReports === "lead" && (
            <div className="flex flex-col gap-6 sm:gap-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow min-h-[200px]">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <FaChartBar className="text-blue-500 text-lg sm:text-xl" />
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Lead Sources
                    </h4>
                  </div>
                  {isLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <MonthlyLeadsChart
                      leads={memoizedLeads}
                      isAnimationActive={false}
                    />
                  )}
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow min-h-[200px]">
                  {isLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <LeadStatusPieChart
                      leads={memoizedLeads}
                      isAnimationActive={false}
                    />
                  )}
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-2">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Leads for{" "}
                    {currentDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search by name, email, or mobile..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="Search leads"
                    />
                    {isFetching && (
                      <div className="ml-2">
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading / Error / Data */}
                {isLoading ? (
                  <div className="py-12 flex justify-center">
                    <Spinner />
                  </div>
                ) : isError ? (
                  <p className="text-red-500 text-sm sm:text-base">
                    Error loading leads data.
                  </p>
                ) : memoizedLeads.length > 0 ? (
                  // Virtualized list with fallback
                  <VirtualizedLeads
                    leads={memoizedLeads}
                    RowComponent={LeadRow}
                    height={400}
                  />
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">
                    No leads found for this month.
                  </p>
                )}

                {/* Pagination */}
                <div className="flex justify-center items-center mt-4">
                  <button
                    onClick={goPrevious}
                    disabled={leadPage === 1}
                    className="px-4 py-2 mx-1 bg-gray-300 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 mx-1">
                    {leadPage} / {initialLeadsData?.totalPages || 1}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={
                      leadPage === initialLeadsData?.totalPages ||
                      !initialLeadsData?.totalPages
                    }
                    className="px-4 py-2 mx-1 bg-gray-300 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Staff & Customer — lazy loaded */}
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="py-12 flex justify-center">
                  <Spinner />
                </div>
              }
            >
              {activeReports === "staff" && <StaffReport />}
              {activeReports === "customer" && <CustomerReport />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Subadminreports);
