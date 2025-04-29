const ExpenseCategoryMaster = require('../../models/updateModels/expenseCategoryMasterSchema');

// Create
exports.createExpenseCategory= async (req, res) => {
  try {
    const userId = req.userId;
    const { expenseCategory, expenseHead } = req.body;
    const newExpenseCategory= await ExpenseCategoryMaster.create({ expenseCategory, expenseHead,userId });
    res.status(201).json(newExpenseCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getExpenseCategorys = async (req, res) => {
  try {
    const userId = req.userId;
    const expenseCategorys = await ExpenseCategoryMaster.findAll({ where: { userId } });
    res.json(expenseCategorys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateExpenseCategory= async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { expenseCategory, expenseHead } = req.body;
    const expenseCategorys = await ExpenseCategoryMaster.findOne({ where: {id, userId } });
    if (!expenseCategorys) return res.status(404).json({ error: "ExpenseCategorynot found" });

    expenseCategorys.expenseCategory = expenseCategory;
    expenseCategorys.expenseHead = expenseHead;
    await expenseCategorys.save();

    res.json(expenseCategorys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteExpenseCategory= async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await ExpenseCategoryMaster.destroy({ where: { id,userId } });
    if (!deleted) return res.status(404).json({ error: "ExpenseCategorynot found" });
    res.json({ message: "ExpenseCategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
