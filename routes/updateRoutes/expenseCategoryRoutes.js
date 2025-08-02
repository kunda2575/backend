const express = require("express");
const router = express.Router();
const expenseCategorysController = require('../../controllers/updateControllers/expenseCategoryMasterController');
const projectFilter = require("../../middleware/projectId");

router.post('/',projectFilter, expenseCategorysController.createExpenseCategory);
router.post('/import',projectFilter, expenseCategorysController.importExpenseCategoryData);
router.get('/', projectFilter,expenseCategorysController.getExpenseCategorys);
router.put('/:id',projectFilter, expenseCategorysController.updateExpenseCategory);
router.delete('/:id', projectFilter,expenseCategorysController.deleteExpenseCategory);

module.exports = router;
