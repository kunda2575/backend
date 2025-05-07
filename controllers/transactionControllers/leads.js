
const { Op } = require('sequelize');

const Leads = require("../../models/transactionModels/leadsModel")
const LeadSource = require("../../models/updateModels/leadSourceSchema")
const LeadStage = require("../../models/updateModels/leadStageSchema")
const TeamMember = require("../../models/updateModels/teamMembersSchema")

// Create
exports.createLeadsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      contact_name,
      contact_phone,
      contact_email,
      address,
      customer_profession,
      native_language,
      lead_source,
      lead_stage,
      value_in_inr,
      creation_date,
      expected_date,
      team_member,
      last_interacted_on,
      next_interacted_date,
      remarks,
      reason_for_lost_customers,
    } = req.body;

    const newLeadDetails = await Leads.create({

      contact_name,
      contact_phone,
      contact_email,
      address,
      customer_profession,
      native_language,
      lead_source,
      lead_stage,
      value_in_inr,
      creation_date,
      expected_date,
      team_member,
      last_interacted_on,
      next_interacted_date,
      remarks,
      reason_for_lost_customers,
      userId
    });
    res.status(201).json(newLeadDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
// exports.getLeadDetails = async (req, res) => {

//   try {
//     console.log("query = ", req.query);

//     const userId = req.userId;

//     const skip = parseInt(req.query.skip) || 0;
//     const limit = parseInt(req.query.limit) || null;  // null means no limit
//     const conditions = [];

//     // Utility function to parse and handle empty or null arrays
//     const parseArray = value => (value && value !== '[]') ? value.split(',').map(item => item.trim()) : [];

//     // Add conditions if query parameters are provided and valid
//     if (req.query.leadStage) conditions.push({ lead_stage: { [Op.in]: parseArray(req.query.leadStage) } });
//     if (req.query.leadSource) conditions.push({ lead_source: { [Op.in]: parseArray(req.query.leadSource) } });
//     if (req.query.teamMember) conditions.push({ team_member: { [Op.in]: parseArray(req.query.teamMember) } });

//     // If no conditions, fetch all data (no filter)
//     const whereClause = conditions.length > 0 ? { [Op.or]: conditions } : {};

//     console.log("whereClause =", whereClause);  // Debugging

//     // Fetch leads based on whereClause
//     // Fetch paginated leads
//     const leadDetails = await Leads.findAll({
//       where: whereClause,
//       offset: skip,
//       limit: limit,
//     });
//     const leadDetailsCount = await Leads.count({ where: whereClause });

//     // Return result or message if no data is found
//     res.status(200).json({ "leadDetails": leadDetails, "leadCount": leadDetailsCount })
//   } catch (err) {
//     console.error("Error details:", err);  // Log the error
//     res.status(500).json({ error: err.message });
//   }

// };

exports.getLeadDetails = async (req, res) => {
  try {
    console.log("query = ", req.query);

    const userId = req.userId;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || null;

    const parseArray = value => (value && value !== '[]') ? value.split(',').map(item => item.trim()) : [];

    const conditions = [];

    if (req.query.leadStage) conditions.push({ lead_stage: { [Op.in]: parseArray(req.query.leadStage) } });
    if (req.query.leadSource) conditions.push({ lead_source: { [Op.in]: parseArray(req.query.leadSource) } });
    if (req.query.teamMember) conditions.push({ team_member: { [Op.in]: parseArray(req.query.teamMember) } });

    // Combine userId with other conditions using Op.and
    let whereClause = { userId: userId }; // base condition

    if (conditions.length > 0) {
      whereClause = {
        [Op.and]: [
          { userId: userId },
          { [Op.or]: conditions }
        ]
      };
    }

    console.log("whereClause =", JSON.stringify(whereClause));

    const leadDetails = await Leads.findAll({
      where: whereClause,
      offset: skip,
      limit: limit,
    });

    const leadDetailsCount = await Leads.count({
      where: whereClause
    });

    res.status(200).json({
      leadDetails,
      leadCount: leadDetailsCount
    });

  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Leads by ID
exports.getLeadDetailsById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const leadDetails = await Leads.findOne({ where: { id, userId } });

    if (!leadDetails) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    return res.status(200).json(leadDetails);
  } catch (err) {
    console.error("Error fetching material by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Update Leads
exports.updateLeadDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Primary key (assumed)
    const {
      contact_name,
      contact_phone,
      contact_email,
      address,
      customer_profession,
      native_language,
      lead_source,
      lead_stage,
      value_in_inr,
      creation_date,
      expected_date,
      team_member,
      last_interacted_on,
      next_interacted_date,
      remarks,
      reason_for_lost_customers,
    } = req.body;

    const leadDetails = await Leads.findOne({ where: { id, userId } });

    if (!leadDetails) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    await leadDetails.update({
      contact_name,
      contact_phone,
      contact_email,
      address,
      customer_profession,
      native_language,
      lead_source,
      lead_stage,
      value_in_inr,
      creation_date,
      expected_date,
      team_member,
      last_interacted_on,
      next_interacted_date,
      remarks,
      reason_for_lost_customers,
    });

    return res.status(200).json({ message: "Material updated successfully.", leadDetails });
  } catch (err) {
    console.error("Error updating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Leads
exports.deleteLeadDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Primary key (assumed)

    const deleted = await Leads.destroy({ where: { id, userId } });

    if (!deleted) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    // await material.destroy();

    return res.status(200).json({ message: "Material deleted successfully." });
  } catch (err) {
    console.error("Error deleting material:", err);
    return res.status(500).json({ error: err.message });
  }
};


exports.getLeadSourceDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const leadSourceDetails = await LeadSource.findAll({ where: { userId } });
    res.json(leadSourceDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeadStageDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const leadStageDetails = await LeadStage.findAll({ where: { userId } });
    res.json(leadStageDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamMemberDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const teamMemberDetails = await TeamMember.findAll({ where: { userId } });
    res.json(teamMemberDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};