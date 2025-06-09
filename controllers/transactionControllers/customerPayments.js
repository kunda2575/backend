const { Op } = require('sequelize');
const customerPayment = require('../../models/transactionModels/customerPaymentsModel');

const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const paymentType = require('../../models/updateModels/paymentTypeMasterSchema')
const verifiedBy = require('../../models/updateModels/employeeMasterSchema')
const fundingBank  = require('../../models/updateModels/bankMasterSchema')
const customer  = require('../../models/updateModels/customerMasterSchema')

// ✅ Create customerPayments
exports.createcustomerPayments = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID is required." });

        const {
            customer_id,
            customer_name,
            contact_number,
            email,
            profession,
            native_language,
            project_name,
            block_name,
            flat_no,
            agreed_price,
            installment_no,
            amount_received,
            payment_mode,
            payment_type,
            verified_by,
            funding_bank,
            documents,
            flat_hand_over_date,
            flat_area,
            no_of_bhk,
        } = req.body;

        const newcustomerPayments = await customerPayment.create({
           customer_id,
            customer_name,
            contact_number,
            email,
            profession,
            native_language,
            project_name,
            block_name,
            flat_no,
            agreed_price,
            installment_no,
            amount_received,
            payment_mode,
            payment_type,
            verified_by,
            funding_bank,
            documents,
            flat_hand_over_date,
            flat_area,
            no_of_bhk,
            userId
        });

        return res.status(201).json(newcustomerPayments);
    } catch (err) {
        console.error("Error creating customer payments:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getcustomerPaymentsDetails = async (req, res) => {
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
        if (req.query.payment_type && req.query.payment_type !== "") {
            filters.push({ payment_type: { [Op.in]: parseArray(req.query.payment_type) } });
            console.log("payment type name filter applied:", req.query.payment_type);
        }
        if (req.query.verified_by && req.query.verified_by !== "") {
            filters.push({ verified_by: { [Op.in]: parseArray(req.query.verified_by) } });
            console.log("verified by filter applied:", req.query.verified_by);
        }
        if (req.query.payment_mode && req.query.payment_mode !== "") {
            filters.push({ payment_mode: { [Op.in]: parseArray(req.query.payment_mode) } });
            console.log("Payment mode filter applied:", req.query.payment_mode);
        }
        if (req.query.funding_bank && req.query.funding_bank !== "") {
            filters.push({ funding_bank: { [Op.in]: parseArray(req.query.funding_bank) } });
            console.log(" funding bank filter applied:", req.query.funding_bank);
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

        const customerPaymentsDetails = await customerPayment.findAll({
            where: whereClause,
            offset: skip,
            limit: limit,
            logging: console.log
        });

        if (!customerPaymentsDetails.length) {
            return res.status(404).json({ error: "No customer payments not found." });
        }

        const customerPaymentsDetailsCount = await customerPayment.count({
            where: whereClause
        });

        return res.status(200).json({
            customerPaymentsDetails,
            customerPaymentsDetailsCount
        });
    } catch (err) {
        console.error("Error fetching customer Paymentss details:", err.message, err.stack);
        return res.status(500).json({ error: "Failed to fetch customer Paymentss details." });
    }
};
// GET /api/customerPaymentss/:id
exports.getcustomerPaymentsById = async (req, res) => {

    try {
        const userId = req.userId;
        const { id } = req.params;


        const customerPayments = await customerPayment.findOne({ where: { id, userId } });

        if (!customerPayments) {
            return res.status(404).json({ error: "customer Payments not found" });
        }

        res.json(customerPayments);
    } catch (error) {
        console.error("Error fetching customer Payments:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.updatecustomerPayments = async (req, res) => {
    try {
        console.log("Update customerPayments called");
        console.log("req.user:", req.user);
        console.log("req.params.id:", req.params.id);
        console.log("req.body:", req.body);

        // if (!req.user || !req.user.userId) {
        //   return res.status(401).json({ error: "Unauthorized: Missing user information" });
        // }
        const userId = req.userId;
        const { id } = req.params;

        // if (!/^\d+$/.test(id)) {
        //   return res.status(400).json({ error: "Invalid customerPayments ID" });
        // }

        const {
           customer_id,
            customer_name,
            contact_number,
            email,
            profession,
            native_language,
            project_name,
            block_name,
            flat_no,
            agreed_price,
            installment_no,
            amount_received,
            payment_mode,
            payment_type,
            verified_by,
            funding_bank,
            documents,
            flat_hand_over_date,
            flat_area,
            no_of_bhk,

        } = req.body;

        const customerPaymentsToUpdate = await customerPayment.findOne({ where: { id, userId } });

        if (!customerPaymentsToUpdate) {
            return res.status(404).json({ error: "customerPayments not found or unauthorized access." });
        }

        await customerPaymentsToUpdate.update({
           customer_id,
            customer_name,
            contact_number,
            email,
            profession,
            native_language,
            project_name,
            block_name,
            flat_no,
            agreed_price,
            installment_no,
            amount_received,
            payment_mode,
            payment_type,
            verified_by,
            funding_bank,
            documents,
            flat_hand_over_date,
            flat_area,
            no_of_bhk,

        });

        return res.status(200).json({ message: "customer Payments updated successfully.", data: customerPaymentsToUpdate });

    } catch (err) {
        console.error("Error updating customerPayments:", err.message, err.stack);
        return res.status(500).json({ error: err.message });
    }
};


// ✅ Delete customerPayments
exports.deletecustomerPayments = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const deleted = await customerPayment.destroy({ where: { id, userId } });

        if (!deleted) {
            return res.status(404).json({ error: "customer Payments not found or unauthorized access." });
        }

        return res.status(200).json({ message: "customer Payments deleted successfully." });
    } catch (err) {
        console.error("Error deleting customerPayments:", err);
        return res.status(500).json({ error: err.message });
    }
};

// ✅ Get payment_type details (user-specific)
exports.getpaymentTypeDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const paymentTypes = await paymentType.findAll({ where: { userId } });
        res.json(paymentTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get purpose details (user-specific)
exports.getVerifiedByDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const verifiedByDetails = await verifiedBy.findAll({ where: { userId } });
        res.json(verifiedByDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get purpose details (user-specific)
exports.getfundingBankDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const fundingByDetails = await fundingBank.findAll({ where: { userId } });
        res.json(fundingByDetails);
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

// ✅ Get payment mode details (user-specific)
exports.getCustomerDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: "User ID not found" });

        const customerDetails = await customer.findAll({ where: { userId } });
        res.json(customerDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


