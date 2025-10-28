import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutaction } from "../redux/authSlice";
import {
  FaAddressBook,
  FaBook,
  FaChartBar,
  FaClock,
  FaDollarSign,
  FaEnvelope,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTasks,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { acessPermission } from "../services/settingservices/permissionAccessRouter";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const metadata = useSelector((state) => state.auth.metadataUser);
  const effectiveRole = metadata?.role || role;
  const [isOpen, setIsOpen] = useState(false);

  const logoutpage = () => {
    dispatch(logoutaction());
    navigate("/");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const { data: permissionData } = useQuery({
    queryKey: ["permissionToAccess"],
    queryFn: acessPermission,
  });

  const hideLeadDetails = permissionData?.getPermission?.find(
    (perm) => perm.title === "Hide lead details form agent"
  );
  const displayLeadDetails = permissionData?.getPermission?.find(
    (perm) => perm.title === "Display all leads for every staff member"
  );
  const displayCustomerDetails = permissionData?.getPermission?.find(
    (perm) => perm.title === "Display all customers for every staff member"
  );

  return (
    <>
      {/* ☰ Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 transition"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-48 lg:w-64
  bg-gradient-to-b from-teal-500 to-blue-600 text-white shadow-xl
  overflow-y-auto
  [scrollbar-width:thin] [scrollbar-color:#14b8a6_#1E3A8A]
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-blue-900/30
  [&::-webkit-scrollbar-thumb]:bg-teal-400
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb:hover]:bg-cyan-400
  transition-transform duration-300 ease-in-out z-40
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 text-center font-extrabold text-3xl border-b border-white/30 flex justify-center items-center space-x-2">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-100 to-cyan-300 text-transparent bg-clip-text font-serif"
          >
            Irohub
          </motion.span>
          <motion.span
            className="relative text-yellow-300 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            CRM
            <motion.div
              layoutId="underline"
              className="absolute left-0 right-0 -bottom-1 h-[3px] bg-yellow-400 rounded-full"
            />
          </motion.span>
        </div>

        {/* Sidebar Menu */}
        <ul className="space-y-2 p-4">
          {effectiveRole === "Admin" && (
            <>
              <SidebarLink
                to="/admindashboard"
                icon={<FaTachometerAlt />}
                text="Dashboard"
                close={setIsOpen}
              />
              <SidebarLink
                to="/agents"
                icon={<FaUserFriends />}
                text="Staffs"
                close={setIsOpen}
              />
              <SidebarLink
                to="/leads"
                icon={<FaAddressBook />}
                text="Leads"
                close={setIsOpen}
              />
              <SidebarLink
                to="/followups"
                icon={<FaBook />}
                text="Followups"
                close={setIsOpen}
              />
              <SidebarLink
                to="/customers"
                icon={<FaUsers />}
                text="Customers"
                close={setIsOpen}
              />
              <SidebarLink
                to="/tasks"
                icon={<FaTasks />}
                text="Tasks"
                close={setIsOpen}
              />
              <SidebarLink
                to="/payments"
                icon={<FaDollarSign />}
                text="Payments"
                close={setIsOpen}
              />
              <SidebarLink
                to="/paymentReports"
                icon={<FaDollarSign />}
                text="Payment Reports"
                close={setIsOpen}
              />
              <SidebarLink
                to="/subadminreports"
                icon={<FaChartBar />}
                text="Reports"
                close={setIsOpen}
              />
            </>
          )}

          {effectiveRole === "Agent" && (
            <>
              <SidebarLink
                to="/subadminhome"
                icon={<FaTachometerAlt />}
                text="Dashboard"
                close={setIsOpen}
              />
              {displayLeadDetails?.active && (
                <SidebarLink
                  to="/leads"
                  icon={<FaEnvelope />}
                  text="Lead List"
                  close={setIsOpen}
                />
              )}
              <SidebarLink
                to="/followups"
                icon={<FaClock />}
                text="Followups"
                close={setIsOpen}
              />
              {displayCustomerDetails?.active && (
                <SidebarLink
                  to="/customers"
                  icon={<FaUserFriends />}
                  text="Customers"
                  close={setIsOpen}
                />
              )}
              <SidebarLink
                to="/agenttasks"
                icon={<FaTasks />}
                text="Tasks"
                close={setIsOpen}
              />
              <SidebarLink
                to="/payments"
                icon={<FaDollarSign />}
                text="Payments"
                close={setIsOpen}
              />
            </>
          )}

          {/* Logout */}
          <li>
            <button
              onClick={() => {
                logoutpage();
                setIsOpen(false);
              }}
              className="flex items-center w-full py-3 px-4 font-bold hover:bg-red-600 rounded-md cursor-pointer transform transition hover:scale-105"
            >
              <FaSignOutAlt className="mr-3 text-lg" />
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}

export default Sidebar;

// ✅ Reusable link component
function SidebarLink({ to, icon, text, close }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center py-3 px-4 font-bold rounded-lg transition-all duration-200
          hover:bg-white/20 hover:text-gray-100 transform hover:scale-105
          ${isActive ? "bg-blue-700" : ""}`
        }
        onClick={() => close(false)}
      >
        <span className="mr-3 text-lg">{icon}</span>
        {text}
      </NavLink>
    </li>
  );
}
