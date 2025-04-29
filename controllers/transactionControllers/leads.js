const Leads = require("../../models/transactionModels/leadsModel")
const LeadSource = require("../../models/updateModels/leadSourceSchema")
const LeadStage = require("../../models/updateModels/leadStageSchema")
const TeamMember =  require("../../models/updateModels/teamMembersSchema")
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
        userId });
    res.status(201).json(newLeadDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getLeadDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const leadDetails = await Leads.findAll({ where: { userId } });
    res.json(leadDetails);
  } catch (err) {
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
  

  