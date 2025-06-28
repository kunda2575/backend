const BankMaster = require('../../models/updateModels/bankMasterSchema');
const { ValidationError } = require('sequelize');

// Create
exports.createBankDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { bankName, ifscCode, branch } = req.body;
  
    const newBankDetails = await BankMaster.create({ bankName, ifscCode, branch });
    res.status(201).json(newBankDetails);
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};

// Read all
exports.getBankDetails = async (req, res) => {
  try {
    // const userId = req.userId;
    const bankDetails = await BankMaster.findAll();
    res.json(bankDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateBankDetails = async (req, res) => {
  try {
    // const userId = req.userId;
    const { id } = req.params;
    const { bankName, ifscCode, branch } = req.body;
    const bankDetails = await BankMaster.findOne({ where: { id } });
    if (!bankDetails) return res.status(404).json({ error: "Bank not found" });

    bankDetails.bankName = bankName
    bankDetails.ifscCode = ifscCode
    bankDetails.branch = branch
    await bankDetails.save();

    res.json(bankDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteBankDetails = async (req, res) => {
  try {
    // const userId = req.userId;
    const { id } = req.params;
    const deleted = await BankMaster.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Bank Details not found" });
    res.json({ message: "Bank Details deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
