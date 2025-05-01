
const { Op } = require('sequelize');

const Leads = require("../../models/transactionModels/leadsModel")
const LeadSource = require("../../models/updateModels/leadSourceSchema")
const LeadStage = require("../../models/updateModels/leadStageSchema")
const TeamMember =  require("../../models/updateModels/teamMembersSchema")
const LeadSource = require("../../models/leadSourceSchema")
const LeadStage = require("../../models/leadStageSchema")
const TeamMember = require("../../models/teamMembersSchema")
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
exports.getLeadDetails = async (req, res) => {

  try {
    console.log("query = ", req.query);

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || null;  // null means no limit
    const conditions = [];

    // Utility function to parse and handle empty or null arrays
    const parseArray = value => (value && value !== '[]') ? value.split(',').map(item => item.trim()) : [];

    // Add conditions if query parameters are provided and valid
    if (req.query.leadStage) conditions.push({ lead_stage: { [Op.in]: parseArray(req.query.leadStage) } });
    if (req.query.leadSource) conditions.push({ lead_source: { [Op.in]: parseArray(req.query.leadSource) } });
    if (req.query.teamMember) conditions.push({ team_member: { [Op.in]: parseArray(req.query.teamMember) } });

    // If no conditions, fetch all data (no filter)
    const whereClause = conditions.length > 0 ? { [Op.or]: conditions } : {};

    console.log("whereClause =", whereClause);  // Debugging

    // Fetch leads based on whereClause
    // Fetch paginated leads
    const leadDetails = await Leads.findAll({
      where: whereClause,
      offset: skip,
      limit: limit
    });
    const leadDetailsCount = await Leads.count({ where: whereClause });

    // Return result or message if no data is found
    res.status(200).json({ "leadDetails": leadDetails, "leadCount": leadDetailsCount })
  } catch (err) {
    console.error("Error details:", err);  // Log the error
    res.status(500).json({ error: err.message });
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


