const { ValidationError } = require('sequelize');
const EmployeeMaster = require('../../models/updateModels/employeeMasterSchema');
const { Op } = require("sequelize");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const s3 = require('../../config/r2config');

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;

// ✅ Multer with memory storage for direct buffer access
const storage = multer({ storage: multer.memoryStorage() });
exports.upload = storage;
exports.createEmployeeDetails = async (req, res) => {
  try {
    const {
      employeeID,
      employeeName,
      employeePhone,
      employeeEmail,
      idType,
      employeeSalary,
      department,
      emp_address,
      documentTypes
    } = req.body;

    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const existing = await EmployeeMaster.findOne({
      where: {
        [Op.or]: [
          { employeeID },
          { employeeEmail },
          { employeePhone }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Duplicate Employee ID, Email, or Phone' });
    }

    let parsedDocTypes = [];
    try {
      parsedDocTypes = typeof documentTypes === 'string' ? JSON.parse(documentTypes) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid documentTypes format' });
    }

    const filesWithDocTypes = files.map((file, i) => ({
      ...file,
      documentType: parsedDocTypes[i] || 'unknown'
    }));

    const uploadedFiles = await uploadToR2(filesWithDocTypes, "employee_master", "employee_upload");
  // const uploadedFiles = await uploadToR2(filesWithDocTypes, "documents_master", "system_upload");
    const uploadedKeys = uploadedFiles.map(file => file.key);
   
    const idProof1 = uploadedKeys.join(',');

    const newEmployee = await EmployeeMaster.create({
      employeeID,
      employeeName,
      employeePhone,
      employeeEmail,
      idType,
      idProof1,
      employeeSalary,
      department,
      emp_address
    });

    res.status(201).json(newEmployee);
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};


// ✅ Read
exports.getEmployeeDetails = async (req, res) => {
  try {
    const employeeDetails = await EmployeeMaster.findAll();

    const updatedDetails = employeeDetails.map(emp => ({
      ...emp.toJSON(),
      idProofs1: emp.idProof1
        ? emp.idProof1.split(",").map(getR2FileUrl)
        : []
    }));

    res.status(200).json(updatedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEmployeesDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeName,
      employeePhone,
      employeeEmail,
      idType,
      employeeSalary,
      department,
      emp_address,
      documentTypes,
      retainedFiles
    } = req.body;

    const employee = await EmployeeMaster.findOne({ where: { id } });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    let retainedKeys = [];
    try {
      retainedKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldKeys = employee.idProof1 ? employee.idProof1.split(',') : [];
    const keysToDelete = oldKeys.filter(k => !retainedKeys.includes(k));

    if (keysToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: keysToDelete.map(k => ({ Key: k })),
          Quiet: true
        }
      }).promise();
    }

    const files = req.files || [];
    let newUploadedKeys = [];

    if (files.length > 0) {
      let parsedDocTypes = [];
      try {
        parsedDocTypes = typeof documentTypes === 'string' ? JSON.parse(documentTypes) : [];
      } catch (err) {
        return res.status(400).json({ error: 'Invalid documentTypes format' });
      }

      const filesWithDocTypes = files.map((file, i) => ({
        ...file,
        documentType: parsedDocTypes[i] || 'unknown'
      }));

        const uploadedFiles = await uploadToR2(filesWithDocTypes, "employee_master_edit", "employee_edit");
    
      newUploadedKeys = uploadedFiles.map(file => file.key); // 🔧 Extract keys only
    }

    const finalKeys = [...retainedKeys, ...newUploadedKeys];

    employee.employeeName = employeeName;
    employee.employeePhone = employeePhone;
    employee.employeeEmail = employeeEmail;
    employee.idType = idType;
    employee.employeeSalary = employeeSalary;
    employee.department = department;
    employee.emp_address = emp_address;
    employee.idProof1 = finalKeys.join(',');

    await employee.save();
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
exports.deleteEmployeesDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeMaster.findOne({ where: { id } });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const keys = employee.idProof1 ? employee.idProof1.split(',') : [];
    if (keys.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: keys.map(k => ({ Key: k })),
          Quiet: true
        }
      }).promise();
    }

    await EmployeeMaster.destroy({ where: { id } });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
