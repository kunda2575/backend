const PaymentMode = require('../models/paymentModeMasterSchema');

// Create
exports.createPaymentMode = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentMode } = req.body;
    const newPaymentMode = await PaymentMode.create({ paymentMode,userId});
    res.status(201).json(newPaymentMode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getPaymentModes = async (req, res) => {
  try {
    const userId = req.userId;
    const paymentMode = await PaymentMode.findAll({ where: { userId } });
    res.json(paymentMode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updatePaymentMode = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { paymentMode } = req.body;
    const paymentModes = await PaymentMode.findOne({ where: {id, userId } });
    if (!paymentModes) return res.status(404).json({ error: "Payment Mode not found" });

   
    paymentModes.paymentMode=paymentMode
    await paymentModes.save();

    res.json(paymentMode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deletePaymentMode = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await PaymentMode.destroy({ where: { id,userId } });
    if (!deleted) return res.status(404).json({ error: "payment Mode not found" });
    res.json({ message: "payment Mode deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
