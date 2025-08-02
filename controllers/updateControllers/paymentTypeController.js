const { ValidationError } = require('sequelize');
const PaymentType = require('../../models/updateModels/paymentTypeMasterSchema');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createPaymentType = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { paymentType } = req.body;
    const newPaymentType = await PaymentType.create({ paymentType,projectId});
    res.status(201).json(newPaymentType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------


exports.importPaymentTypeData = async (req, res) => {
  try {
    const paymentTypes = req.body.paymenttypes;
    const projectId = req.projectId
    if (!Array.isArray(paymentTypes) || paymentTypes.length === 0) {
      return res.status(400).json({ error: "No payment type records provided." });
    }

    const requiredFields = ["paymentType"];
    const errors = [];
    const cleanedTypes = [];

    paymentTypes.forEach((record, index) => {
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
        cleanedTypes.push({
          paymentType: String(record.paymentType).trim(),
          projectId
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded payment type data.",
        errors
      });
    }

    const created = await PaymentType.bulkCreate(cleanedTypes, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Payment types imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Payment type import error:", err);
    res.status(500).json({ error: "Internal server error during payment type import." });
  }
};

//--------------------------------------------------------------------------------------------------------------


// Read all
exports.getPaymentTypes = async (req, res) => {
  try {
     const projectId = req.projectId;
    const paymentType = await PaymentType.findAll({where:{projectId}});
    res.json(paymentType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

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

//--------------------------------------------------------------------------------------------------------------

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
