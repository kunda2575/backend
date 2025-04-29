const FundSource = require('../../models/updateModels/fundSourceSchema');

// Create
exports.createFundSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { fundSource } = req.body;
    const newFundSource = await FundSource.create({ fundSource,userId});
    res.status(201).json(newFundSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getFundSources = async (req, res) => {
  try {
    const userId = req.userId;
    const fundSource = await FundSource.findAll({ where: { userId } });
    res.json(fundSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateFundSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { fundSource } = req.body;
    const fundSources = await FundSource.findOne({ where: {id, userId } });
    if (!fundSources) return res.status(404).json({ error: "FundSource not found" });

   
    fundSources.fundSource=fundSource
    await fundSources.save();

    res.json(fundSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteFundSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await FundSource.destroy({ where: { id ,userId} });
    if (!deleted) return res.status(404).json({ error: "Fund Source not found" });
    res.json({ message: "Fund Source deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
