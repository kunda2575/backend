const { Op } = require('sequelize');
const Expenditure = require('../../models/transactionModels/expenditureModel');
const Vendor = require('../../models/updateModels/vendorMasterSchema');
const Expense = require('../../models/updateModels/expenseCategoryMasterSchema');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const PaymentBank = require('../../models/updateModels/bankMasterSchema');

// ✅ Create expenditure
exports.createExpenditure = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID is required." });

        const {
            date,
            vendor_name,
            expense_head,
            amount_inr,
            invoice_number,
            payment_mode,
            payment_bank,
            payment_reference,
            payment_evidence
        } = req.body;

        const newExpenditure = await Expenditure.create({
            date,
            expense_head,
            amount_inr,
            vendor_name,
            invoice_number,
            payment_mode,
            payment_bank,
            payment_reference,
            payment_evidence,
            userId
        });

        return res.status(201).json(newExpenditure);
    } catch (err) {
        console.error("Error creating expenditure:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getExpenditureDetails = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("Decoded JWT payload:", req.userId);  // Ensure userId is present

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        console.log("Pagination params - skip:", skip, "limit:", limit);

        const filters = [];
        const parseArray = (value) => value ? value.split(',') : [];

        // Log the filters applied
        if (req.query.vendor_name && req.query.vendor_name !== "") {
            filters.push({ vendor_name: { [Op.in]: parseArray(req.query.vendor_name) } });
            console.log("Vendor name filter applied:", req.query.vendor_name);
        }
        if (req.query.expense_head && req.query.expense_head !== "") {
            filters.push({ expense_head: { [Op.in]: parseArray(req.query.expense_head) } });
            console.log("Expense head filter applied:", req.query.expense_head);
        }
        if (req.query.payment_mode && req.query.payment_mode !== "") {
            filters.push({ payment_mode: { [Op.in]: parseArray(req.query.payment_mode) } });
            console.log("Payment mode filter applied:", req.query.payment_mode);
        }
        if (req.query.payment_bank && req.query.payment_bank !== "") {
            filters.push({ payment_bank: { [Op.in]: parseArray(req.query.payment_bank) } });
            console.log("Payment bank filter applied:", req.query.payment_bank);
        }

        console.log("Filters applied:", filters);

        let whereClause = { userId };
        if (filters.length > 0) {
            whereClause = {
                [Op.and]: [
                    { userId },
                    { [Op.or]: filters }
                ]
            };
        }

        console.log("Final where clause:", whereClause);

        const expenditureDetails = await Expenditure.findAll({
            where: whereClause,
            offset: skip,
            limit: limit,
            logging: console.log
        });

        if (!expenditureDetails.length) {
            return res.status(404).json({ error: "No expenditures found." });
        }

        const expenditureDetailsCount = await Expenditure.count({
            where: whereClause
        });

        return res.status(200).json({
            expenditureDetails,
            expenditureDetailsCount
        });
    } catch (err) {
        console.error("Error fetching expenditure details:", err.message, err.stack);
        return res.status(500).json({ error: "Failed to fetch expenditure details." });
    }
};
// GET /api/expenditures/:id
exports.getExpenditureById = async (req, res) => {
  const { id } = req.params;

  // Ensure id is a valid number
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Expenditure ID is invalid or missing" });
  }

  try {
    const expenditure = await Expenditure.findOne({
      where: {
        id: parseInt(id, 10),
        userId: req.user.userId, // ensure you're using user from JWT
      }
    });

    if (!expenditure) {
      return res.status(404).json({ error: "Expenditure not found" });
    }

    res.json(expenditure);
  } catch (error) {
    console.error("Error fetching expenditure:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.updateExpenditure = async (req, res) => {
  try {
    console.log("Update expenditure called");
    console.log("req.user:", req.user);
    console.log("req.params.id:", req.params.id);
    console.log("req.body:", req.body);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized: Missing user information" });
    }
    const userId = req.user.userId;
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid expenditure ID" });
    }

    const {
      date,
      vendor_name,
      expense_head,
      amount_inr,
      invoice_number,
      payment_mode,
      payment_bank,
      payment_reference,
      payment_evidence
    } = req.body;

    const expenditureToUpdate = await Expenditure.findOne({ where: { id, userId } });

    if (!expenditureToUpdate) {
      return res.status(404).json({ error: "Expenditure not found or unauthorized access." });
    }

    await expenditureToUpdate.update({
      date,
      vendor_name,
      expense_head,
      amount_inr,
      invoice_number,
      payment_mode,
      payment_bank,
      payment_reference,
      payment_evidence
    });

    return res.status(200).json({ message: "Expenditure updated successfully.", data: expenditureToUpdate });

  } catch (err) {
    console.error("Error updating expenditure:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Delete expenditure
exports.deleteExpenditure = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const deleted = await Expenditure.destroy({ where: { id, userId } });

        if (!deleted) {
            return res.status(404).json({ error: "Expenditure not found or unauthorized access." });
        }

        return res.status(200).json({ message: "Expenditure deleted successfully." });
    } catch (err) {
        console.error("Error deleting expenditure:", err);
        return res.status(500).json({ error: err.message });
    }
};

// ✅ Get vendor details (user-specific)
exports.getVendorDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const vendorDetails = await Vendor.findAll({ where: { userId } });
        res.json(vendorDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get expense details (user-specific)
exports.getExpenseDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const expenseDetails = await Expense.findAll({ where: { userId } });
        res.json(expenseDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get payment mode details (user-specific)
exports.getPaymentModeDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const paymentModeDetails = await PaymentMode.findAll({ where: { userId } });
        res.json(paymentModeDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get payment bank details (user-specific)
exports.getPaymentBankDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const paymentBankDetails = await PaymentBank.findAll({ where: { userId } });
        res.json(paymentBankDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
