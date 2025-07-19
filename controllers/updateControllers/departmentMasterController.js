const { ValidationError } = require('sequelize');
const DepartmentMaster = require("../../models/updateModels/departmentMasterSchema");

// Create 

exports.createDepartmentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { departmentMaster, departmentID } = req.body;
        const newDepartment = await DepartmentMaster.create({ departmentMaster, departmentID });
        res.status(201).json(newDepartment);
    } catch (error) {
        if (err instanceof ValidationError) {
            const messages = err.errors.map((e) => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }

    }
};

//Read All

exports.getDepartmentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const departments = await DepartmentMaster.findAll();
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
        const { departmentMaster, departmentID } = req.body;
        const department = await DepartmentMaster.findOne({ where: { id } });
        if (!department) return res.status(404).json({ error: "Department not found" });

        department.departmentMaster = departmentMaster;
        department.departmentID = departmentID;

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
        const deleted = await DepartmentMaster.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: "Department not found" });
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.importDepartmentFromExcel = async (req, res) => {
    try {
        const departments = req.body.department;

        if (!Array.isArray(departments) || departments.length === 0) {
            return res.status(400).json({ error: "No department records provided." });
        }

        const requiredFields = ["departmentMaster"];
        const errors = [];
        const cleanedDepartments = [];

        departments.forEach((record, index) => {
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

            // Removed any date validation here

            if (rowErrors.length === 0) {
                cleanedDepartments.push({
                    departmentMaster: String(record.departmentMaster).trim(),
                    departmentID: String(record.departmentID).trim(),
                    // No date fields included here
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

        const created = await DepartmentMaster.bulkCreate(cleanedDepartments, {
            validate: true,
            individualHooks: true
        });

        res.status(201).json({
            message: "Departments imported successfully.",
            count: created.length
        });

    } catch (err) {
        if (err instanceof ValidationError) {
            const messages = err.errors.map((e) => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        console.error("Department import error:", err);
        res.status(500).json({ error: "Internal server error during department import." });
    }
};