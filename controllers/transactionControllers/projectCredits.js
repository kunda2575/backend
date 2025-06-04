const { Op } = require('sequelize');
const ProjectCredit = require('../../models/transactionModels/projectCreditsModel');
const Source = require('../../models/updateModels/fundSourceSchema');
const Purpose = require('../../models/updateModels/fundPurposeSchema');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const depositBank = require('../../models/updateModels/bankMasterSchema');

// ✅ Create projectCredits
exports.createProjectCredits = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID is required." });

        const {
            date,
            source,
            deposit_bank,
            purpose,
            amount_inr,
            payment_mode,

        } = req.body;

        const newProjectCredits = await ProjectCredit.create({
            date,
            source,
            deposit_bank,
            purpose,
            amount_inr,
            payment_mode,
            userId
        });

        return res.status(201).json(newProjectCredits);
    } catch (err) {
        console.error("Error creating project Credits:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getProjectCreditsDetails = async (req, res) => {
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
        if (req.query.source && req.query.source !== "") {
            filters.push({ source: { [Op.in]: parseArray(req.query.source) } });
            console.log("Source name filter applied:", req.query.source);
        }
        if (req.query.purpose && req.query.purpose !== "") {
            filters.push({ purpose: { [Op.in]: parseArray(req.query.purpose) } });
            console.log("Purpose  filter applied:", req.query.purpose);
        }
        if (req.query.deposit_bank && req.query.deposit_bank !== "") {
            filters.push({ deposit_bank: { [Op.in]: parseArray(req.query.deposit_bank) } });
            console.log("Deposit Bank filter applied:", req.query.deposit_bank);
        }
        if (req.query.payment_mode && req.query.payment_mode !== "") {
            filters.push({ payment_mode: { [Op.in]: parseArray(req.query.payment_mode) } });
            console.log("Payment mode filter applied:", req.query.payment_mode);
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

        const projectCreditsDetails = await ProjectCredit.findAll({
            where: whereClause,
            offset: skip,
            limit: limit,
            logging: console.log
        });

        if (!projectCreditsDetails.length) {
            return res.status(404).json({ error: "No projectCreditss found." });
        }

        const projectCreditsDetailsCount = await ProjectCredit.count({
            where: whereClause
        });

        return res.status(200).json({
            projectCreditsDetails,
            projectCreditsDetailsCount
        });
    } catch (err) {
        console.error("Error fetching projectCredits details:", err.message, err.stack);
        return res.status(500).json({ error: "Failed to fetch projectCredits details." });
    }
};

// GET /api/projectCreditss/:id
exports.getProjectCreditsById = async (req, res) => {

    try {
        const userId = req.userId;
        const { id } = req.params;


        const projectCredits = await ProjectCredit.findOne({ where: { id, userId } });

        if (!projectCredits) {
            return res.status(404).json({ error: "ProjectCredits not found" });
        }

        res.json(projectCredits);
    } catch (error) {
        console.error("Error fetching projectCredits:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateProjectCredits = async (req, res) => {
    try {
        console.log("Update projectCredits called");
        console.log("req.user:", req.user);
        console.log("req.params.id:", req.params.id);
        console.log("req.body:", req.body);

        // if (!req.user || !req.user.userId) {
        //   return res.status(401).json({ error: "Unauthorized: Missing user information" });
        // }
        const userId = req.userId;
        const { id } = req.params;

        // if (!/^\d+$/.test(id)) {
        //   return res.status(400).json({ error: "Invalid projectCredits ID" });
        // }

        const {
            date,
            source,
            deposit_bank,
            purpose,
            amount_inr,
            invoice_number,
            payment_mode,

        } = req.body;

        const projectCreditsToUpdate = await ProjectCredit.findOne({ where: { id, userId } });

        if (!projectCreditsToUpdate) {
            return res.status(404).json({ error: "ProjectCredits not found or unauthorized access." });
        }

        await projectCreditsToUpdate.update({
            date,
            source,
            deposit_bank,
            purpose,
            amount_inr,
            invoice_number,
            payment_mode,

        });

        return res.status(200).json({ message: "ProjectCredits updated successfully.", data: projectCreditsToUpdate });

    } catch (err) {
        console.error("Error updating projectCredits:", err.message, err.stack);
        return res.status(500).json({ error: err.message });
    }
};


// ✅ Delete projectCredits
exports.deleteProjectCredits = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const deleted = await ProjectCredit.destroy({ where: { id, userId } });

        if (!deleted) {
            return res.status(404).json({ error: "Project Credits not found or unauthorized access." });
        }

        return res.status(200).json({ message: "Project Credits deleted successfully." });
    } catch (err) {
        console.error("Error deleting project Credits:", err);
        return res.status(500).json({ error: err.message });
    }
};

// ✅ Get source details (user-specific)
exports.getSourceDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const sourceDetails = await Source.findAll({ where: { userId } });
        res.json(sourceDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get purpose details (user-specific)
exports.getPurposeDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const purposeDetails = await Purpose.findAll({ where: { userId } });
        res.json(purposeDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get  deposit_bank  details (user-specific)
exports.getDepositeBankDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const depositeBankDetails = await depositBank.findAll({ where: { userId } });
        res.json(depositeBankDetails);
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


