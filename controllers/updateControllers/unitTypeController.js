const UnitType = require('../../models/updateModels/unitTypeSchema');

// Create
exports.createUnitType = async (req, res) => {
  try {
    const userId = req.userId;
    const { unit } = req.body;
    const newUnitType = await UnitType.create({ unit,userId});
    res.status(201).json(newUnitType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getUnitTypes = async (req, res) => {
  try {
    const userId = req.userId;
    const unitType = await UnitType.findAll({ where: { userId } });
    res.json(unitType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateUnitType = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { unit } = req.body;
    const unitTypes = await UnitType.findOne({ where: {id, userId } });
    if (!unitTypes) return res.status(404).json({ error: "Unit Types not found" });

   
    unitTypes.unitType=unit
    await unitTypes.save();

    res.json(unitTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteUnitType = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await UnitType.destroy({ where: { id,userId } });
    if (!deleted) return res.status(404).json({ error: "Unit Types not found" });
    res.json({ message: "Unit Types deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
