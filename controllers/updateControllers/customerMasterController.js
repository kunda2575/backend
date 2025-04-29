
const CustomerMaster = require('../../models/updateModels/customerMasterSchema');

// create
exports.createCustomerDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { customerId, customerName, customerPhone, customerEmail, customerAddress, customerProfession, languagesKnown, projectNameBlock, flatNo } = req.body
        const newCustomerDetails = await CustomerMaster.create({
            customerId, customerName, customerPhone, customerEmail, customerAddress, customerProfession, languagesKnown, projectNameBlock, flatNo, userId
        })
        res.status(201).json(newCustomerDetails)

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// read
exports.getCustomerDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const customerDetails = await CustomerMaster.findAll({ where: { userId } })
        res.status(201).json(customerDetails)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// update
exports.updateCustomersDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { customerId, customerName, customerPhone, customerEmail, customerAddress, customerProfession, languagesKnown, projectNameBlock, flatNo } = req.body
        const customerDetails = await CustomerMaster.findOne({ where: { id, userId } })
        if (!customerDetails)
            return res.status(404).json({ error: "Customers not found" });

        customerDetails.customerId = customerId;
        customerDetails.customerName = customerName;
        customerDetails.customerPhone = customerPhone;
        customerDetails.customerEmail = customerEmail;
        customerDetails.customerAddress = customerAddress;
        customerDetails.customerProfession = customerProfession;
        customerDetails.languagesKnown = languagesKnown;
        customerDetails.projectNameBlock = projectNameBlock;
        customerDetails.flatNo = flatNo;
        await customerDetails.save()
        res.status(201).json(customerDetails)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//delete

exports.deleteCustomersDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const deleted = await CustomerMaster.destroy({ where: { id, userId } })
        if (!deleted) return res.status(404).json({ error: "Customer Details not found" });
        res.json({ message: "Customer Details deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
