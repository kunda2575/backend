const { Op } = require('sequelize');

const Leads = require("../../models/transactionModels/leadsModel");
const LeadSource = require("../../models/updateModels/leadSourceSchema");
const LeadStage = require("../../models/updateModels/leadStageSchema");
const TeamMember = require("../../models/updateModels/teamMembersSchema");

// ✅ Create
exports.createLeadsDetails = async (req, res) => {
  try {
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
    });
    res.status(201).json(newLeadDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Read
exports.getLeadDetails = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || null;

    const parseArray = value =>
      value && value !== '[]' ? value.split(',').map(item => item.trim()) : [];

    const conditions = [];
    if (req.query.leadStage) conditions.push({ lead_stage: { [Op.in]: parseArray(req.query.leadStage) } });
    if (req.query.leadSource) conditions.push({ lead_source: { [Op.in]: parseArray(req.query.leadSource) } });
    if (req.query.teamMember) conditions.push({ team_member: { [Op.in]: parseArray(req.query.teamMember) } });

    let whereClause = {};
    if (conditions.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: conditions }]
      };
    }

    const leadDetails = await Leads.findAll({
      where: whereClause,
      offset: skip,
      limit: limit,
    });

    const leadDetailsCount = await Leads.count({ where: whereClause });

    res.status(200).json({
      leadDetails,
      leadCount: leadDetailsCount,
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get by ID
exports.getLeadDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const leadDetails = await Leads.findOne({ where: { id } });
    if (!leadDetails) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    return res.status(200).json(leadDetails);
  } catch (err) {
    console.error("Error fetching material by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Update
exports.updateLeadDetails = async (req, res) => {
  try {
    const { id } = req.params;
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

    const leadDetails = await Leads.findOne({ where: { id } });
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


// ✅ Delete
exports.deleteLeadDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Leads.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    return res.status(200).json({ message: "Material deleted successfully." });
  } catch (err) {
    console.error("Error deleting material:", err);
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Get Lead Source Details
exports.getLeadSourceDetails = async (req, res) => {
  try {
    const leadSourceDetails = await LeadSource.findAll();
    res.json(leadSourceDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get Lead Stage Details
exports.getLeadStageDetails = async (req, res) => {
  try {
    const leadStageDetails = await LeadStage.findAll();
    res.json(leadStageDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get Team Member Details
exports.getTeamMemberDetails = async (req, res) => {
  try {
    const teamMemberDetails = await TeamMember.findAll();
    res.json(teamMemberDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
