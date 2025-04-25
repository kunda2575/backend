const DepartmentMaster = require("../models/departmentMasterSchema");

// Create 

exports.createDepartmentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { departmentName, departmentID } = req.body;
        const newDepartment = await DepartmentMaster.create({ departmentName,userId,departmentID });
        res.status(201).json(newDepartment);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

//Read All

exports.getDepartmentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const departments = await DepartmentMaster.findAll({ where: { userId } });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update

exports.updateDepartmentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { departmentName } = req.body;
        const department = await DepartmentMaster.findOne({ where: {id, userId } });
        if (!department) return res.status(404).json({ error: "Department not found" });

        department.departmentName = departmentName;

        await department.save();
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete

exports.deleteDepartmentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const deleted = await DepartmentMaster.destroy({ where: { id,userId } });
        if (!deleted) return res.status(404).json({ error: "Department not found" });
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}