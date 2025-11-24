export const listleads = async (options) => {
    const { page = 1, limit = 2000, priority, status, filterleads, assignedTo,
       searchText, date, startDate, endDate,
        sortBy,
         noLimit = false, role, metadataUser } = options || {};
  
    const params = new URLSearchParams({ page });
  if (noLimit) {
    params.append("noLimit", "true");
  } else {
    params.append("limit", limit); // Add limit if noLimit is false
  }  if (priority && priority !== "Priority") params.append("priority", priority);
  if (status && status !== "Status") params.append("status", status); // ← filtering
  if (filterleads && filterleads !== "All") params.append("filterleads", filterleads);
  if (assignedTo && assignedTo !== "AssignedTo") params.append("assignedTo", assignedTo);
  if (searchText) params.append("searchText", searchText);
  if (date && date !== "Date") params.append("date", date);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const user = metadataUser || JSON.parse(sessionStorage.getItem('metadataUser') || '{}');
  const endpoint = role === 'Admin' ? 'list-admin' : 'list';

  const { data } = await axios.get(
    `${API_URL}/leads/${endpoint}?${params.toString()}`,
    getAuthorized()
  );

  // CORRECT: Log the actual lead statuses, not the filter param
  console.log("Leads statuses:", data?.length)
  console.log("API Response:", data);

  return data;
};










list: asynchandler(async (req, res) => {
    const { role, id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Extract filter parameters
    const {
      priority,
      status,
      assignedTo,
      searchText,
      date,
      startDate,
      endDate,
      sortBy,
      filterleads,
    } = req.query;

    let query = { role: "user" };

    // Role-based query
    if (role === "Sub-Admin") {
      const subAdmin = await User.findById(id).populate('assignedAgents', 'id');
      const agentIds = subAdmin.assignedAgents.map(agent => agent.id);
      query = {
        role: "user",
        $or: [
          { createdBy: id },
          { assignedTo: id },
          { createdBy: { $in: agentIds } },
          { assignedTo: { $in: agentIds } },
        ],
      };
    } else if(role === "Agent") {
            query = { role: "user", $or: [{ createdBy: id }, { assignedTo: id }] };
    } else { // Agent and other roles
      query = { role: "user" };
    }

    // Apply filters
    if (
      priority &&
      ["hot", "warm", "cold", "Not Assigned"].includes(priority)
    ) {
      query.priority = priority;
    }
    if (filterleads === "Assigned") {
      query.assignedTo = { $exists: true, $ne: null };
    } else if (filterleads === "Unassigned") {
      query.assignedTo = { $exists: false };
    }
    if (searchText) {
      query.name = { $regex: searchText, $options: "i" };
    }
    //............savio changed.....
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
      }
    } else if (date === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (date === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      query.createdAt = {
        $gte: yesterday,
        $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (date === "custom" && startDate) {
      const customDate = new Date(startDate);
      customDate.setHours(0, 0, 0, 0);
      query.createdAt = {
        $gte: customDate,
        $lt: new Date(customDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default sort by createdAt descending
    if (sortBy === "ascleadvalue") {
      sort = { leadvalue: 1 };
    } else if (sortBy === "descleadvalue") {
      sort = { leadvalue: -1 };
    }

    const total = await User.countDocuments(query);
    let leadsQuery = User.find(query)
      .populate("createdBy", "name")
      .populate("assignedLeads","name")
      .populate("assignedTo", "name")
      .populate("updatedBy", "name")
      .populate("nextfollowupupdatedBy", "role name")
      .populate("source")
      .populate("userDetails.leadFormId", "name type options ")
      .sort(sort);

    if (req.query.noLimit !== 'true') {
      leadsQuery = leadsQuery.skip(skip).limit(limit);
    }

    const leads = await leadsQuery;

    const leadforms = await Leadform.find();

    res.status(200).json({
      leads,
      leadforms,
      currentPage: req.query.noLimit === 'true' ? 1 : page,
      totalPages: req.query.noLimit === 'true' ? 1 : Math.ceil(total / limit),
      totalLeads: total,
    });
  }),
