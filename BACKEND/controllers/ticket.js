import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";

// ✅ Create Ticket
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, deadline, relatedSkills, assignedTo } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      priority: priority || "Low", // Ensure consistency (Capitalized)
      deadline,
      relatedSkills: relatedSkills || [],
      assignedTo: assignedTo || null,
      createdBy: req.user._id.toString(),
    });

    // Populate to return the full object to the frontend immediately
    await newTicket.populate('assignedTo', 'name email');

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title: newTicket.title,
        description: newTicket.description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get All Tickets
export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    // Define which fields of 'assignedTo' we always want
    const populateOptions = { path: 'assignedTo', select: 'name email _id' };

    if (user.role === "admin") {
      tickets = await Ticket.find({})
        .populate(populateOptions)
        .sort({ createdAt: -1 });
    } else if (user.role === "moderator") {
      tickets = await Ticket.find({
        $or: [{ assignedTo: user._id }, { createdBy: user._id }],
      })
        .populate(populateOptions)
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .populate(populateOptions)
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Single Ticket 
export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    // Include 'requiredSkills' if your model uses it, or 'relatedSkills'
    const selectFields = "title description status createdAt priority relatedSkills requiredSkills assignedTo aiNotes helpfulNotes moderatorMessage";

    const query = user.role === "admin" 
      ? { _id: req.params.id }
      : user.role === "moderator"
        ? { _id: req.params.id, $or: [{ assignedTo: user._id }, { createdBy: user._id }] }
        : { _id: req.params.id, createdBy: user._id };

    ticket = await Ticket.findOne(query)
        .select(selectFields)
        .populate("assignedTo", ["name", "email", "_id"]);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found or access denied" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Update Ticket — Only Admin 
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, moderatorMessage, assignedTo, priority } = req.body;

    // Basic validation
    if (!title && !description && assignedTo === undefined && !priority) {
       return res.status(400).json({ message: "No fields to update provided" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update ticket details" });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (priority) ticket.priority = priority;

    if (moderatorMessage !== undefined) {
      ticket.moderatorMessage = moderatorMessage;
    }

    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo || null;
    }

    await ticket.save();
    // Important: Populate before returning so the frontend updates the user name
    await ticket.populate("assignedTo", "name email _id");

    return res.status(200).json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Update Ticket Status
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, moderatorMessage } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Normalization: Ensure uppercase
    status = status.toUpperCase();

    const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "moderator" &&
      ticket.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to update this ticket" });
    }

    ticket.status = status;

    if (moderatorMessage !== undefined) {
      ticket.moderatorMessage = moderatorMessage;
    }

    await ticket.save();
    // Populate to maintain consistency in the UI
    await ticket.populate("assignedTo", "name email _id");

    return res.status(200).json({ message: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};