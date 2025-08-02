const LostReasons = require('../../models/updateModels/lostReasonsSchema');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createLostReasons = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { lostReason } = req.body;
    const newLostReasons = await LostReasons.create({ lostReason,projectId});
    res.status(201).json(newLostReasons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.importLostReasonsData = async (req, res) => {
  try {
    const reasons = req.body.reasons;
const projectId = req.projectId
    if (!Array.isArray(reasons) || reasons.length === 0) {
      return res.status(400).json({ error: "No lost reason records provided." });
    }

    const requiredField = "lostReason";
    const errors = [];
    const cleanedReasons = [];

    reasons.forEach((record, index) => {
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
        cleanedReasons.push({
          lostReason: String(record.lostReason).trim(),
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

    const created = await LostReasons.bulkCreate(cleanedReasons, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Lost reasons imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Lost reason import error:", err);
    res.status(500).json({ error: "Internal server error during lost reason import." });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getLostReasons = async (req, res) => {
  try {
   const projectId = req.projectId;
    const lostReason = await LostReasons.findAll({where:{projectId}});
    res.json(lostReason);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Update
exports.updateLostReasons = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { lostReason } = req.body;
    const lostReasons = await LostReasons.findOne({ where: {id } });
    if (!lostReasons) return res.status(404).json({ error: "Lost Reasons not found" });

   
    lostReasons.lostReason=lostReason
    await lostReasons.save();

    res.json(lostReason);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Delete
exports.deleteLostReasons = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await LostReasons.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Lost Reason not found" });
    res.json({ message: "Lost Reason deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
