const BlocksMaster = require('../../models/updateModels/blocksMasterSchema');

// Create
exports.createBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { blockNoOrName } = req.body;
    const newBlock = await BlocksMaster.create({ blockNoOrName,  userId });
    res.status(201).json(newBlock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getBlocks = async (req, res) => {
  try {
    const userId = req.userId;
    const blocks = await BlocksMaster.findAll({ where: { userId } });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { blockNoOrName } = req.body;
    const block = await BlocksMaster.findOne({ where: {id, userId } });
    if (!block) return res.status(404).json({ error: "Block not found" });

    block.blockNoOrName = blockNoOrName;
  
    await block.save();

    res.json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await BlocksMaster.destroy({ where: { id, userId } });
    if (!deleted) return res.status(404).json({ error: "Block not found" });
    res.json({ message: "Block deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
