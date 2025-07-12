const moment = require('moment');
const { Op } = require('sequelize');

const Leads = require("../../models/transactionModels/leadsModel");
const LeadSource = require("../../models/updateModels/leadSourceSchema");
const LeadStage = require("../../models/updateModels/leadStageSchema");
const TeamMember = require("../../models/updateModels/teamMembersSchema");
// At the top of your controller file
const { ValidationError } = require('sequelize');


// ✅ Create Leads Details
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

    // Send success response
    return res.status(201).json(newLeadDetails);

  } catch (err) {
    // ✅ Sequelize validation error
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    // 🧨 General server error
    return res.status(500).json({ error: 'Internal server error' });
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




function excelDateToJSDate(serial) {
  // Excel's base date is 1899-12-30
  const excelEpoch = new Date(1899, 11, 30);
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
  return jsDate;
}

exports.importLeadsFromExcel = async (req, res) => {
  try {
    const leadsArray = req.body.leads;

    if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
      return res.status(400).json({ error: "No leads provided." });
    }

    const requiredFields = ["contact_name", "contact_email"];
    const dateFields = [
      "creation_date",
      "expected_date",
      "last_interacted_on",
      "next_interacted_date"
    ];

    const cleanedLeads = [];
    const errors = [];

    leadsArray.forEach((record, index) => {
      let recordErrors = [];

      // Trim required fields
      requiredFields.forEach(field => {
        if (record[field]) {
          record[field] = String(record[field]).trim();
        } else {
          recordErrors.push({ field, error: `${field} is empty`, row: index + 1 });
        }
      });

      // Convert and validate date fields
      dateFields.forEach(field => {
        const value = record[field];

        if (value !== undefined && value !== null) {
          let date;

          // Detect Excel serial number (numeric)
          if (typeof value === 'number') {
            date = excelDateToJSDate(value);
          }
          // Try parsing DD-MM-YYYY
          else if (typeof value === 'string') {
            const parsed = moment(value, 'DD-MM-YYYY', true);
            if (parsed.isValid()) {
              date = parsed.toDate();
            }
          }

          if (date instanceof Date && !isNaN(date)) {
            record[field] = date;
          } else {
            recordErrors.push({
              field,
              error: `${field} is not a valid date format or Excel serial.`,
              value,
              row: index + 1
            });
          }
        } else {
          recordErrors.push({
            field,
            error: `${field} is missing or empty.`,
            row: index + 1
          });
        }
      });

      if (recordErrors.length > 0) {
        errors.push(...recordErrors);
      } else {
        cleanedLeads.push(record);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Faulty data found in input.",
        errors
      });
    }

    const createdLeads = await Leads.bulkCreate(cleanedLeads, {
      validate: true,
      individualHooks: true
    });

    return res.status(201).json({
      message: "Leads imported successfully.",
      count: createdLeads.length
    });

  } catch (err) {
    console.error("Bulk import error:", err);

    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    return res.status(500).json({ error: "Internal server error during import." });
  }
};
