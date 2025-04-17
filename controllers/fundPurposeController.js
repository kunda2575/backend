const FundPurpose = require('../models/fundPurposeSchema');

// Create
exports.createFundPurpose = async (req, res) => {
  try {
    const { fundPurpose } = req.body;
    const newFundPurpose = await FundPurpose.create({ fundPurpose});
    res.status(201).json(newFundPurpose);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getFundPurposes = async (req, res) => {
  try {
    const fundPurpose = await FundPurpose.findAll();
    res.json(fundPurpose);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateFundPurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const { fundPurpose } = req.body;
    const fundPurposes = await FundPurpose.findByPk(id);
    if (!fundPurposes) return res.status(404).json({ error: "FundPurpose not found" });

   
    fundPurposes.fundPurpose=fundPurpose
    await fundPurposes.save();

    res.json(fundPurpose);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteFundPurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FundPurpose.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Fund Purpose not found" });
    res.json({ message: "Fund Purpose deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
