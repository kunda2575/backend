const { ValidationError } = require('sequelize');
const MaterialMaster = require('../../models/updateModels/materialMasterSchema');

// Create
exports.createMaterialMaster = async (req, res) => {
  try {
    const userId = req.userId;
    const { materialName, material_id } = req.body;

    if (!materialName || !material_id) {
      return res.status(400).json({ error: "Material name and ID are required." });
    }

    const newMaterialMaster = await MaterialMaster.create({ material_id, materialName });
    res.status(201).json(newMaterialMaster);
  } catch (err) {
     if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};


// Read all
exports.getMaterialMasters = async (req, res) => {
  try {
    const userId = req.userId;
    const materialName = await MaterialMaster.findAll();
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
    const materialNames = await MaterialMaster.findOne({ where: {id} });
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
    const deleted = await MaterialMaster.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "material masternot found" });
    res.json({ message: "material masterdeleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
