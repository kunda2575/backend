const FundSource = require('../../models/updateModels/fundSourceSchema');

// Create
exports.createFundSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { fundSource } = req.body;
    const newFundSource = await FundSource.create({ fundSource});
    res.status(201).json(newFundSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importFundSourceData = async (req, res) => {
  try {
    const sources = req.body.source;

    if (!Array.isArray(sources) || sources.length === 0) {
      return res.status(400).json({ error: "No fund source records provided." });
    }

    const requiredField = "fundSource";
    const errors = [];
    const cleanedSources = [];

    sources.forEach((record, index) => {
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
        cleanedSources.push({
          fundSource: String(record.fundSource).trim()
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

    const created = await FundSource.bulkCreate(cleanedSources, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Fund sources imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Import error:", err);
    res.status(500).json({ error: "Internal server error during fund source import." });
  }
};


// Read all
exports.getFundSources = async (req, res) => {
  try {
    const userId = req.userId;
    const fundSource = await FundSource.findAll();
    res.json(fundSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateFundSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { fundSource } = req.body;
    const fundSources = await FundSource.findOne({ where: {id} });
    if (!fundSources) return res.status(404).json({ error: "FundSource not found" });

   
    fundSources.fundSource=fundSource
    await fundSources.save();

    res.json(fundSource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteFundSource = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await FundSource.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Fund Source not found" });
    res.json({ message: "Fund Source deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
