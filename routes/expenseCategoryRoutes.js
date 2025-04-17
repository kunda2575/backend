const express = require("express");
const router = express.Router();
const expenseCategorysController = require('../controllers/expenseCategoryMasterController');

router.post('/', expenseCategorysController.createExpenseCategory);
router.get('/', expenseCategorysController.getExpenseCategorys);
router.put('/:id', expenseCategorysController.updateExpenseCategory);
router.delete('/:id', expenseCategorysController.deleteExpenseCategory);

module.exports = router;
