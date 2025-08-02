const ExpenseCategoryMaster = require('../../models/updateModels/expenseCategoryMasterSchema');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createExpenseCategory= async (req, res) => {
  try {
    const projectId = req.projectId;
    const { expenseCategory, expenseHead } = req.body;
    const newExpenseCategory= await ExpenseCategoryMaster.create({ expenseCategory, expenseHead ,projectId});
    res.status(201).json(newExpenseCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.importExpenseCategoryData = async (req, res) => {
  try {
    const categories = req.body.category;
    const projectId = req.projectId

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: "No expense category records provided." });
    }

    const requiredFields = ["expenseCategory", "expenseHead"];
    const errors = [];
    const cleanedCategories = [];

    categories.forEach((record, index) => {
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

      if (rowErrors.length === 0) {
        cleanedCategories.push({
          expenseCategory: String(record.expenseCategory).trim(),
          expenseHead: String(record.expenseHead).trim(),
          projectId
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

    // Insert into database
    const created = await ExpenseCategoryMaster.bulkCreate(cleanedCategories, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Expense categories imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Import error:", err);
    res.status(500).json({ error: "Internal server error during expense category import." });
  }
};


//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getExpenseCategorys = async (req, res) => {
  try {
   const projectId = req.projectId;
    const expenseCategorys = await ExpenseCategoryMaster.findAll({where:{projectId}});
    res.json(expenseCategorys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Update
exports.updateExpenseCategory= async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { expenseCategory, expenseHead } = req.body;
    const expenseCategorys = await ExpenseCategoryMaster.findOne({ where: {id } });
    if (!expenseCategorys) return res.status(404).json({ error: "ExpenseCategorynot found" });

    expenseCategorys.expenseCategory = expenseCategory;
    expenseCategorys.expenseHead = expenseHead;
    await expenseCategorys.save();

    res.json(expenseCategorys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Delete
exports.deleteExpenseCategory= async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await ExpenseCategoryMaster.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "ExpenseCategorynot found" });
    res.json({ message: "ExpenseCategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
