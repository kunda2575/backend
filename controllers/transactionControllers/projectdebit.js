const { Op } = require('sequelize');
const ProjectDebit = require('../../models/transactionModels/projectDebitModel');
const Vendor = require('../../models/updateModels/vendorMasterSchema');
const PayedTo = require('../../models/updateModels/vendorMasterSchema');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const PaymentBank = require('../../models/updateModels/bankMasterSchema');

// ✅ Create projectDebit
exports.createProjectDebit = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID is required." });

        const {
            date,
            payed_to,
            vendor_name,
           
            amount_inr,
            invoice_number,
            payment_mode,
            payment_bank,
          
        } = req.body;

        const newProjectDebit = await ProjectDebit.create({
            date,
            payed_to,
            vendor_name,
            amount_inr,
            invoice_number,
            payment_mode,
            payment_bank,
          
        
        });

        return res.status(201).json(newProjectDebit);
    } catch (err) {
        console.error("Error creating projectDebit:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getProjectDebitDetails = async (req, res) => {
    try {
        const userId = req.userId;
        // console.log("Decoded JWT payload:", req.userId);  // Ensure userId is present

        // if (!userId) {
        //     return res.status(400).json({ error: "User ID is required." });
        // }

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
        if (req.query.vendor_name && req.query.vendor_name !== "") {
            filters.push({ vendor_name: { [Op.in]: parseArray(req.query.vendor_name) } });
            console.log("Vendor name filter applied:", req.query.vendor_name);
        }
        if (req.query.payed_to && req.query.payed_to !== "") {
            filters.push({ payed_to: { [Op.in]: parseArray(req.query.payed_to) } });
            console.log("PayedTo head filter applied:", req.query.payed_to);
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

       
    let whereClause = {};
    if (filters.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: filters }]
      };
    }
        console.log("Final where clause:", whereClause);

        const projectDebitDetails = await ProjectDebit.findAll({
            where: whereClause,
            offset: skip,
            limit: limit,
            logging: console.log
        });

        if (!projectDebitDetails.length) {
            return res.status(404).json({ error: "No project Debits found." });
        }

        const projectDebitDetailsCount = await ProjectDebit.count({
            where: whereClause
        });

        return res.status(200).json({
            projectDebitDetails,
            projectDebitDetailsCount
        });
    } catch (err) {
        console.error("Error fetching projectDebit details:", err.message, err.stack);
        return res.status(500).json({ error: "Failed to fetch projectDebit details." });
    }
};
// GET /api/projectDebits/:id
exports.getProjectDebitById = async (req, res) => {
  
  try {
    const userId = req.userId;
    const { id } = req.params;


    const projectDebit = await ProjectDebit.findOne({ where:{id}});

    if (!projectDebit) {
      return res.status(404).json({ error: "ProjectDebit not found" });
    }

    res.json(projectDebit);
  } catch (error) {
    console.error("Error fetching projectDebit:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.updateProjectDebit = async (req, res) => {
  try {
    console.log("Update projectDebit called");
    console.log("req.user:", req.user);
    console.log("req.params.id:", req.params.id);
    console.log("req.body:", req.body);

    // if (!req.user || !req.user.userId) {
    //   return res.status(401).json({ error: "Unauthorized: Missing user information" });
    // }
    const userId = req.userId;
    const { id } = req.params;

    // if (!/^\d+$/.test(id)) {
    //   return res.status(400).json({ error: "Invalid projectDebit ID" });
    // }

    const {
      date,
            payed_to,
            vendor_name,
           
            amount_inr,
            invoice_number,
            payment_mode,
            payment_bank,
    } = req.body;

    const projectDebitToUpdate = await ProjectDebit.findOne({ where: { id } });

    if (!projectDebitToUpdate) {
      return res.status(404).json({ error: "ProjectDebit not found or unauthorized access." });
    }

    await projectDebitToUpdate.update({
      date,
            payed_to,
            vendor_name,
           
            amount_inr,
            invoice_number,
            payment_mode,
            payment_bank,
    });

    return res.status(200).json({ message: "ProjectDebit updated successfully.", data: projectDebitToUpdate });

  } catch (err) {
    console.error("Error updating projectDebit:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Delete projectDebit
exports.deleteProjectDebit = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const deleted = await ProjectDebit.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ error: "ProjectDebit not found or unauthorized access." });
        }

        return res.status(200).json({ message: "ProjectDebit deleted successfully." });
    } catch (err) {
        console.error("Error deleting projectDebit:", err);
        return res.status(500).json({ error: err.message });
    }
};

// ✅ Get vendor details (user-specific)
exports.getPayTo = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const payedDetails = await PayedTo.findAll();
        res.json(payedDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getVendorDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const vendorDetails = await Vendor.findAll();
        res.json(vendorDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get expense details (user-specific)
exports.getPayedToDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const expenseDetails = await PayedTo.findAll();
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

        const paymentModeDetails = await PaymentMode.findAll();
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

        const paymentBankDetails = await PaymentBank.findAll();
        res.json(paymentBankDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
