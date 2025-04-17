const BlocksMaster = require('../models/blocksMasterSchema');

// Create
exports.createBlock = async (req, res) => {
  try {
    const { blockNO, blockName } = req.body;
    const newBlock = await BlocksMaster.create({ blockNO, blockName });
    res.status(201).json(newBlock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getBlocks = async (req, res) => {
  try {
    const blocks = await BlocksMaster.findAll();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockNO, blockName } = req.body;
    const block = await BlocksMaster.findByPk(id);
    if (!block) return res.status(404).json({ error: "Block not found" });

    block.blockNO = blockNO;
    block.blockName = blockName;
    await block.save();

    res.json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BlocksMaster.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Block not found" });
    res.json({ message: "Block deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
