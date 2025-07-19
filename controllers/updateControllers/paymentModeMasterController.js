const { ValidationError } = require('sequelize');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');

// Create
exports.createPaymentMode = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentMode } = req.body;
    const newPaymentMode = await PaymentMode.create({ paymentMode});
    res.status(201).json(newPaymentMode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importPaymentModeData = async (req, res) => {
  try {
    const paymentModes = req.body.paymentmodes;
console.log("payment mode",req.body.paymentModes)
    if (!Array.isArray(paymentModes) || paymentModes.length === 0) {
      return res.status(400).json({ error: "Nooo payment mode records provided." });
    }
    const requiredFields = ["paymentMode"];
    const errors = [];
    const cleanedModes = [];

    paymentModes.forEach((record, index) => {
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
        cleanedModes.push({
          paymentMode: String(record.paymentMode).trim()
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded payment mode data.",
        errors
      });
    }

    const created = await PaymentMode.bulkCreate(cleanedModes, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Payment modes imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Payment mode import error:", err);
    res.status(500).json({ error: "Internal server error during payment mode import." });
  }
};


// Read all
exports.getPaymentModes = async (req, res) => {
  try {
    const userId = req.userId;
    const paymentMode = await PaymentMode.findAll();
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
    const paymentModes = await PaymentMode.findOne({ where: {id} });
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
    const deleted = await PaymentMode.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "payment Mode not found" });
    res.json({ message: "payment Mode deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
