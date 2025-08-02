const BankMaster = require('../../models/updateModels/bankMasterSchema');
const { ValidationError } = require('sequelize');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createBankDetails = async (req, res) => {
  try {
    // const projectId = req.projectId;
    const { bankName, ifscCode, branch } = req.body;
  
    const newBankDetails = await BankMaster.create({ bankName, ifscCode, branch,projectId });
    res.status(201).json(newBankDetails);
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};

//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getBankDetails = async (req, res) => {
  try {
    // const projectId = req.projectId;
    const bankDetails = await BankMaster.findAll();
    console.log(" ank details",bankDetails)
    res.json(bankDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

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

//--------------------------------------------------------------------------------------------------------------

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


//--------------------------------------------------------------------------------------------------------------

// Excel serial date conversion
function excelDateToJSDate(serial) {
  const excelEpoch = new Date(1899, 11, 30);
  const days = Math.floor(serial);
  return new Date(excelEpoch.getTime() + days * 86400000);
}

// Import from Excel
exports.importBankFromExcel = async (req, res) => {
  try {
    const banks = req.body.banks;
// const projectId = req.projectId
    if (!Array.isArray(banks) || banks.length === 0) {
      return res.status(400).json({ error: "No bank records provided." });
    }

    const requiredFields = ["bankName", "ifscCode", "branch"];
    const errors = [];
    const cleanedBanks = [];

    banks.forEach((record, index) => {
      const rowErrors = [];

      // Validate required fields
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

      // Optional: Validate date if present
      let parsedDate = null;
      if (record.date !== undefined && record.date !== null) {
        if (typeof record.date === "number") {
          parsedDate = excelDateToJSDate(record.date);
        } else {
          const dateMoment = moment(record.date, ['DD-MM-YYYY', 'YYYY-MM-DD'], true);
          if (dateMoment.isValid()) {
            parsedDate = dateMoment.toDate();
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          rowErrors.push({
            row: index + 1,
            field: "date",
            error: "Invalid date format. Use DD-MM-YYYY or Excel serial number."
          });
        }
      }

      if (rowErrors.length === 0) {
        cleanedBanks.push({
          bankName: String(record.bankName).trim(),
          ifscCode: String(record.ifscCode).trim(),
          branch: String(record.branch).trim(), // Changed from Number() to String()
        //  projectId
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded Excel data.",
        errors
      });
    }

    const created = await BankMaster.bulkCreate(cleanedBanks, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Banks imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Bank import error:", err);
    res.status(500).json({ error: "Internal server error during bank import." });
  }
};

