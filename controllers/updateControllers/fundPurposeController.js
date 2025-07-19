const FundPurpose = require('../../models/updateModels/fundPurposeSchema');

// Create
exports.createFundPurpose = async (req, res) => {
  try {
    const userId = req.userId;
    const { fundPurpose } = req.body;
    const newFundPurpose = await FundPurpose.create({ fundPurpose});
    res.status(201).json(newFundPurpose);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importFundPurposeData = async (req, res) => {
  try {
    const purposes = req.body.purposes;

    if (!Array.isArray(purposes) || purposes.length === 0) {
      return res.status(400).json({ error: "No fund purpose records provided." });
    }

    const requiredField = "fundPurpose";
    const errors = [];
    const cleanedPurposes = [];

    purposes.forEach((record, index) => {
      const rowErrors = [];

      if (
        record[requiredField] === undefined ||
        record[requiredField] === null ||
        String(record[requiredField]).trim() === ""
      ) {
        rowErrors.push({
          row: index + 1,
          field: requiredField,
          error: `${requiredField} is required`
        });
      }

      if (rowErrors.length === 0) {
        cleanedPurposes.push({
          fundPurpose: String(record.fundPurpose).trim()
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded data.",
        errors
      });
    }

    const created = await FundPurpose.bulkCreate(cleanedPurposes, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Fund purposes imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Import error:", err);
    res.status(500).json({ error: "Internal server error during fund purpose import." });
  }
};


// Read all
exports.getFundPurposes = async (req, res) => {
  try {
    const userId = req.userId;
    const fundPurpose = await FundPurpose.findAll();
    res.json(fundPurpose);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateFundPurpose = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { fundPurpose } = req.body;
    const fundPurposes = await FundPurpose.findOne({ where: {id } });
    if (!fundPurposes) return res.status(404).json({ error: "FundPurpose not found" });

   
    fundPurposes.fundPurpose=fundPurpose
    await fundPurposes.save();

    res.json(fundPurpose);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteFundPurpose = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await FundPurpose.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Fund Purpose not found" });
    res.json({ message: "Fund Purpose deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
