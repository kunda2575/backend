const LeadSource = require('../../models/updateModels/leadSourceSchema');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createLeadSource = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { leadSource } = req.body;
    const newLeadSource = await LeadSource.create({ leadSource,projectId});
    res.status(201).json(newLeadSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.importLeadSourceData = async (req, res) => {
  try {
    const sources = req.body.sources;
const projectId = req.projectId
    if (!Array.isArray(sources) || sources.length === 0) {
      return res.status(400).json({ error: "No lead source records provided." });
    }

    const requiredField = "leadSource";
    const errors = [];
    const cleanedSources = [];

    sources.forEach((record, index) => {
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
        cleanedSources.push({
          leadSource: String(record.leadSource).trim(),
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

    const created = await LeadSource.bulkCreate(cleanedSources, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Lead sources imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Import error:", err);
    res.status(500).json({ error: "Internal server error during lead source import." });
  }
};


//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getLeadSources = async (req, res) => {
  try {
   const projectId = req.projectId;
    const leadSource = await LeadSource.findAll({where:{projectId}});
    res.json(leadSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Update
exports.updateLeadSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { leadSource } = req.body;
    const leadSources = await LeadSource.findOne({ where: {id } });
    if (!leadSources) return res.status(404).json({ error: "LeadSource not found" });

   
    leadSources.leadSource=leadSource
    await leadSources.save();

    res.json(leadSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Delete
exports.deleteLeadSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await LeadSource.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Lead Source not found" });
    res.json({ message: "Lead Source deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
