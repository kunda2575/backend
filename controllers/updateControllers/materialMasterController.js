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
exports.importMaterialMasterData = async (req, res) => {
  try {
    const materials = req.body.materials;

    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ error: "No material records provided." });
    }

    const requiredFields = ["material_id", "materialName"];
    const errors = [];
    const cleanedMaterials = [];

    materials.forEach((record, index) => {
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
        cleanedMaterials.push({
          material_id: String(record.material_id).trim(),
          materialName: String(record.materialName).trim()
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded material data.",
        errors
      });
    }

    const created = await MaterialMaster.bulkCreate(cleanedMaterials, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Materials imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Material import error:", err);
    res.status(500).json({ error: "Internal server error during material import." });
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
