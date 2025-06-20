const PaymentType = require('../../models/updateModels/paymentTypeMasterSchema');

// Create
exports.createPaymentType = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentType } = req.body;
    const newPaymentType = await PaymentType.create({ paymentType});
    res.status(201).json(newPaymentType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getPaymentTypes = async (req, res) => {
  try {
    const userId = req.userId;
    const paymentType = await PaymentType.findAll();
    res.json(paymentType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updatePaymentType = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { paymentType } = req.body;
    const paymentTypes = await PaymentType.findOne({ where: {id } });
    if (!paymentTypes) return res.status(404).json({ error: "Payment Type not found" });

   
    paymentTypes.paymentType=paymentType
    await paymentTypes.save();

    res.json(paymentType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deletePaymentType = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await PaymentType.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "payment Type not found" });
    res.json({ message: "payment Type deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
