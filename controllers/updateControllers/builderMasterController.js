const BuilderMaster = require('../../models/updateModels/builderMasterSchema');

// Create
exports.createBuilder = async (req, res) => {
  try {
    // const userId = req.userId;
    const { builderMaster } = req.body;
    const newBuilder = await BuilderMaster.create({ builderMaster});
    res.status(201).json(newBuilder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getBuilders = async (req, res) => {
  try {
    const userId = req.userId;
    const builders = await BuilderMaster.findAll();
    res.json(builders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateBuilder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { builderMaster } = req.body;
    const builder = await BuilderMaster.findOne({ where: {id} });
    if (!builder) return res.status(404).json({ error: "Builder not found" });

   
    builder.builderMaster=builderMaster
    await builder.save();

    res.json(builder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteBuilder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await BuilderMaster.destroy({ where: { id} });
    if (!deleted) return res.status(404).json({ error: "Builder not found" });
    res.json({ message: "Builder deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
