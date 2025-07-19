const express = require("express");
const router = express.Router();
const expenseCategorysController = require('../../controllers/updateControllers/expenseCategoryMasterController');
const verifyToken = require("../../middleware/verfiyToken");

router.post('/',verifyToken, expenseCategorysController.createExpenseCategory);
router.post('/import',verifyToken, expenseCategorysController.importExpenseCategoryData);
router.get('/', verifyToken,expenseCategorysController.getExpenseCategorys);
router.put('/:id',verifyToken, expenseCategorysController.updateExpenseCategory);
router.delete('/:id', verifyToken,expenseCategorysController.deleteExpenseCategory);

module.exports = router;
