const { ValidationError } = require('sequelize');
const EmployeeMaster = require('../../models/updateModels/employeeMasterSchema');
const { Op } = require("sequelize");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');


// 🔐 Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${uuidv4()}${ext}`; // ✅ use uuid
    cb(null, uniqueName);
  },
});

exports.upload = multer({ storage });

// ✅ Create
exports.createEmployeeDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      employeeID,
      employeeName,
      employeePhone,
      employeeEmail,
      idType,
      employeeSalary,
      department,
      emp_address
    } = req.body;

    const files = req.files || [];
    const idProof1 = files.map(file => file.filename).join(',');

    const existing = await EmployeeMaster.findOne({
      where: {
        [Op.or]: [
          { employeeID },
          { employeeEmail },
          { employeePhone }
        ],
        
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Duplicate Employee ID, Email, or Phone' });
    }

    const newEmployee = await EmployeeMaster.create({
      employeeID,
      employeeName,
      employeePhone,
      employeeEmail,
      idType,
      idProof1,
      employeeSalary,
      department,
      emp_address,
      
    });

    res.status(201).json(newEmployee);
  } catch (err) {
     if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};

// ✅ Read
exports.getEmployeeDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const employeeDetails = await EmployeeMaster.findAll();

    const updatedDetails = employeeDetails.map(emp => ({
      ...emp.toJSON(),
      idProofs1: emp.idProof1
         ? emp.idProof1.split(",").map(img => `http://localhost:2026/uploads/${img}`)
        : []

    }));

    res.status(200).json(updatedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update
exports.updateEmployeesDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      employeeName,
      employeePhone,
      employeeEmail,
      address,
      idType,
      employeeSalary,
      department,
      emp_address
    } = req.body;

    const employee = await EmployeeMaster.findOne({ where: { id } });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const files = req.files || [];
    let idProof1;

    if (files.length > 0) {
      // Delete old files
      const oldFiles = employee.idProof1 ? employee.idProof1.split(',') : [];
      oldFiles.forEach(file => {
        const filePath = path.join(__dirname, "../../uploads", file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      idProof1 = files.map(file => file.filename).join(',');
    } else {
      idProof1 = employee.idProof1; // Keep old
    }

    employee.employeeName = employeeName;
    employee.employeePhone = employeePhone;
    employee.employeeEmail = employeeEmail;
    employee.address = address;
    employee.idType = idType;
    employee.idProof1 = idProof1;
    employee.employeeSalary = employeeSalary;
    employee.department = department;
    employee.emp_address = emp_address;

    await employee.save();
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
exports.deleteEmployeesDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const employee = await EmployeeMaster.findOne({ where: { id } });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Delete associated files
    const oldFiles = employee.idProof1 ? employee.idProof1.split(',') : [];
    oldFiles.forEach(file => {
      const filePath = path.join(__dirname, "../../uploads", file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await EmployeeMaster.destroy({ where: { id} });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
