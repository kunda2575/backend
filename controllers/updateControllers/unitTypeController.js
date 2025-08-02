const UnitType = require('../../models/updateModels/unitTypeSchema');

// Create
exports.createUnitType = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { unit } = req.body;
    const newUnitType = await UnitType.create({ unit,projectId});
    res.status(201).json(newUnitType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importUnitTypesExcelData = async (req, res) => {
  try {
    const unitTypes = req.body.unittypes;
const projectId = req.projectId
    if (!Array.isArray(unitTypes) || unitTypes.length === 0) {
      return res.status(400).json({ error: "No unit type records provided." });
    }

    const requiredFields = ["unit"];
    const errors = [];
    const cleanedUnitTypes = [];

    unitTypes.forEach((record, index) => {
      const rowErrors = [];

      requiredFields.forEach((field) => {
        if (
          record[field] === undefined ||
          record[field] === null ||
          String(record[field]).trim() === ""
        ) {
          rowErrors.push({
            row: index + 1,
            field,
            error: `${field} is required`
          });
        }
      });

      if (rowErrors.length === 0) {
        cleanedUnitTypes.push({
          unit: String(record.unit).trim(),
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

    const created = await UnitType.bulkCreate(cleanedUnitTypes, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Unit types imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Unit type import error:", err);
    res.status(500).json({ error: "Internal server error during import." });
  }
};


//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getUnitTypes = async (req, res) => {
  try {
    const projectId = req.projectId;
    const unitType = await UnitType.findAll({where:{projectId}});
    res.json(unitType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Update
exports.updateUnitType = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { id } = req.params;
    const { unit } = req.body;
    const unitTypes = await UnitType.findOne({ where: {id } });
    if (!unitTypes) return res.status(404).json({ error: "Unit Types not found" });

   
    unitTypes.unitType=unit
    await unitTypes.save();

    res.json(unitTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Delete
exports.deleteUnitType = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { id } = req.params;
    const deleted = await UnitType.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Unit Types not found" });
    res.json({ message: "Unit Types deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
