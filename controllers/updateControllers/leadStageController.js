
const LeadStage = require('../../models/updateModels/leadStageSchema');

// Create
exports.createLeadStage = async (req, res) => {
  try {
    const userId = req.userId;
    const { leadStage } = req.body;
    const newLeadStage = await LeadStage.create({ leadStage});
    res.status(201).json(newLeadStage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getLeadStages = async (req, res) => {
  try {
    const userId = req.userId;
    const leadStage = await LeadStage.findAll();
    res.json(leadStage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateLeadStage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { leadStage } = req.body;
    const leadStages = await LeadStage.findOne({ where: {id } });
    if (!leadStages) return res.status(404).json({ error: "LeadStage not found" });

   
    leadStages.leadStage=leadStage
    await leadStages.save();

    res.json(leadStage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteLeadStage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await LeadStage.destroy({ where: { id} });
    if (!deleted) return res.status(404).json({ error: "Lead Stage not found" });
    res.json({ message: "Lead Stage deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
