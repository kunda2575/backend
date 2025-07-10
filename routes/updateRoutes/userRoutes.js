const express = require('express');
const router = express.Router();

const userMaster = require('../../controllers/updateControllers/userMasterController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,userMaster.createUser);
router.get('/project', userMaster.getProjectDetails);
router.get('/', verifyToken,userMaster.getUsers);
router.put('/:id', verifyToken,userMaster.updateUser);
router.delete('/:id', verifyToken,userMaster.deleteUser);

module.exports = router;
