const MaterialMaster = require('../models/materialMasterSchema');

// Create
exports.createMaterialMaster = async (req, res) => {
  try {
    const userId = req.userId;
    const { materialName,material_id } = req.body;
    const newMaterialMaster = await MaterialMaster.create({ material_id, materialName,userId});
    res.status(201).json(newMaterialMaster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getMaterialMasters = async (req, res) => {
  try {
    const userId = req.userId;
    const materialName = await MaterialMaster.findAll({ where: { userId } });
    res.json(materialName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateMaterialMaster = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {material_id, materialName } = req.body;
    const materialNames = await MaterialMaster.findOne({ where: {id, userId } });
    if (!materialNames) return res.status(404).json({ error: "Material Master not found" });

   
    materialNames. material_id= material_id
    materialNames.materialName=materialName
    await materialNames.save();

    res.json(materialName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteMaterialMaster = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await MaterialMaster.destroy({ where: { id,userId } });
    if (!deleted) return res.status(404).json({ error: "material masternot found" });
    res.json({ message: "material masterdeleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
