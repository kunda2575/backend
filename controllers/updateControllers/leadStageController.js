
const LeadStage = require('../../models/updateModels/leadStageSchema');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createLeadStage = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { leadStage } = req.body;
    const newLeadStage = await LeadStage.create({ leadStage,projectId});
    res.status(201).json(newLeadStage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.importLeadStageData = async (req, res) => {
  try {
    const stages = req.body.stages;
const projectId = req.projectId
    if (!Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({ error: "No lead stage records provided." });
    }

    const requiredField = "leadStage";
    const errors = [];
    const cleanedStages = [];

    stages.forEach((record, index) => {
      const rowErrors = [];

      if (
        record[requiredField] === undefined ||
        record[requiredField] === null ||
        String(record[requiredField]).trim() === ""
      ) {
        rowErrors.push({
          row: index + 1,
          field: requiredField,
          error: `${requiredField} is required`
        });
      }

      if (rowErrors.length === 0) {
        cleanedStages.push({
          leadStage: String(record.leadStage).trim(),
          projectId
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded data.",
        errors
      });
    }

    const created = await LeadStage.bulkCreate(cleanedStages, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Lead stages imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Lead stage import error:", err);
    res.status(500).json({ error: "Internal server error during lead stage import." });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getLeadStages = async (req, res) => {
  try {
  const projectId = req.projectId;
    const leadStage = await LeadStage.findAll({where:{projectId}});
    res.json(leadStage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

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

//--------------------------------------------------------------------------------------------------------------

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
