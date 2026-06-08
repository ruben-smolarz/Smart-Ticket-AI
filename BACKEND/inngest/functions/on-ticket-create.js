import { inngest } from "../client.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-create", retries: 2, triggers: [{ event: "ticket/created" }] },
  async ({ event, step }) => {
    
    const { ticketId } = event.data;

    // 1. Fetch the Ticket
    const ticket = await step.run("fetch-ticket", async () => {
      const ticketObject = await Ticket.findById(ticketId);
      if (!ticketObject) {
        throw new NonRetriableError("Ticket not found");
      }
      return ticketObject.toObject();
    });

    // 2. Update initial status
    await step.run("update-ticket-status", async () => {
      await Ticket.findByIdAndUpdate(ticketId, { status: "IN_PROGRESS" });
    });

    // 3. Analyze with AI
    // Run the AI analysis function
    const aiResponse = await step.run("analyze-ticket-ai", async () => {
      return await analyzeTicket(ticket);
    });

    // 4. Save AI results
    const updatedTicketInfo = await step.run("save-ai-results", async () => {
      let priority = "Medium";
      
      // Normalize priority
      if (aiResponse && aiResponse.priority) {
         const p = aiResponse.priority.toLowerCase();
         if (p === 'low') priority = "Low";
         else if (p === 'high') priority = "High";
         else if (p === 'urgent') priority = "Urgent";
      }

      // Ensure it is an array
      const skillsToSave = aiResponse.relatedSkills || [];

      await Ticket.findByIdAndUpdate(ticketId, {
        priority: priority,
        helpfulNotes: aiResponse.helpfulNotes || "No notes provided.",
        relatedSkills: skillsToSave, // Save the correct skills array here
        // aiNotes: "" // If not used in the model, better to remove
      });

      return { relatedSkills: skillsToSave };
    });

    // 5. Assign Moderator based on Skills
    const moderator = await step.run("assign-moderator", async () => {
      const skills = updatedTicketInfo.relatedSkills;

      if (skills.length === 0) return null;

      // Find user with matching skills (flexible JS substring match)
      let user = null;
      if (skills && skills.length > 0) {
        const moderators = await User.find({ role: "moderator" });
        user = moderators.find(mod => {
          return mod.skills.some(modSkill =>
            skills.some(ticketSkill =>
              ticketSkill.toLowerCase().includes(modSkill.toLowerCase()) ||
              modSkill.toLowerCase().includes(ticketSkill.toLowerCase())
            )
          );
        });
      }

      // If no expert found, fallback to any admin
      if (!user) {
        user = await User.findOne({ role: "admin" });
      }

      if (user) {
        await Ticket.findByIdAndUpdate(ticketId, {
          assignedTo: user._id,
        });
      }

      return user ? user.toObject() : null;
    });

    // 6. Send notification
    if (moderator) {
      await step.run("send-notification", async () => {
        const finalTicket = await Ticket.findById(ticketId);
        
        const subject = `New Ticket Assigned: ${finalTicket.title}`;
        const message = `Hello ${moderator.name},\n\nA new ticket has been assigned to you.\n\nTitle: ${finalTicket.title}\nPriority: ${finalTicket.priority}\nSkills: ${finalTicket.relatedSkills.join(", ")}\n\nPlease check the dashboard.\n\nBest regards,\nSmartTicket AI`;

        await sendMail(moderator.email, subject, message);
        console.log(`📧 Notification sent to: ${moderator.email}`);
      });
    }

    return { success: true, processedSkills: updatedTicketInfo.relatedSkills };
  }
);