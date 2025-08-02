const BlocksMaster = require('../../models/updateModels/blocksMasterSchema');
const { ValidationError } = require('sequelize');

// Create
exports.createBlock = async (req, res) => {
  try {
    // const projectId = req.projectId;
    const { blockNoOrName } = req.body;
    const newBlock = await BlocksMaster.create({ blockNoOrName });
    res.status(201).json(newBlock);
  } catch (err) {
    res.status(500).json({ error: err.message });block
  }
};

//------------------------------------------------------------------------------------------------------------

// Read all
exports.getBlocks = async (req, res) => {
  try {
//  const projectId = req.projectId;
    const blocks = await BlocksMaster.findAll();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//------------------------------------------------------------------------------------------------------------


// Update
exports.updateBlock = async (req, res) => {
  try {
    // const userId = req.userId;
    const { id } = req.params;
    const { blockNoOrName } = req.body;
    const block = await BlocksMaster.findOne({ where: {id} });
    if (!block) return res.status(404).json({ error: "Block not found" });

    block.blockNoOrName = blockNoOrName;
  
    await block.save();

    res.json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//-------------------------------------------------------------------------------------------------------------

// Delete
exports.deleteBlock = async (req, res) => {
  try {
    // const userId = req.userId;
    const { id } = req.params;
    const deleted = await BlocksMaster.destroy({ where: { id} });
    if (!deleted) return res.status(404).json({ error: "Block not found" });
    res.json({ message: "Block deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.importBlockFromExcel = async (req, res) => {
  try {
    // const projectId = req.projectId
    const blocks = req.body.block;

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return res.status(400).json({ error: "No block records provided." });
    }

    const requiredFields = ["blockNoOrName"];
    const errors = [];
    const cleanedBlocks = [];

    blocks.forEach((record, index) => {
      const rowErrors = [];

      // Validate required fields
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

      // Removed any date validation here

      if (rowErrors.length === 0) {
        cleanedBlocks.push({
          blockNoOrName: String(record.blockNoOrName).trim(),
          // projectId
          // No date fields included here
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded Excel data.",
        errors
      });
    }

    const created = await BlocksMaster.bulkCreate(cleanedBlocks, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Blocksssss imported successfully.",
      count: created.length
    });

  } catch (err) {
    console.error("Block import error:", err);
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: "Internal server error during block import." });
  }
};
