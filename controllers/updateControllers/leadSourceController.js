const LeadSource = require('../../models/updateModels/leadSourceSchema');

// Create
exports.createLeadSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { leadSource } = req.body;
    const newLeadSource = await LeadSource.create({ leadSource,userId});
    res.status(201).json(newLeadSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getLeadSources = async (req, res) => {
  try {
    const userId = req.userId;
    const leadSource = await LeadSource.findAll({ where: { userId } });
    res.json(leadSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateLeadSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { leadSource } = req.body;
    const leadSources = await LeadSource.findOne({ where: {id, userId } });
    if (!leadSources) return res.status(404).json({ error: "LeadSource not found" });

   
    leadSources.leadSource=leadSource
    await leadSources.save();

    res.json(leadSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteLeadSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await LeadSource.destroy({ where: { id,userId } });
    if (!deleted) return res.status(404).json({ error: "Lead Source not found" });
    res.json({ message: "Lead Source deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
