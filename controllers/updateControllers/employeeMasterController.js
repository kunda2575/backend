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

//--------------------------------------------------------------------------------------------------------------

exports.createEmployeeDetails = async (req, res) => {
  try {
     const projectId = req.projectId;
       const projectName = req.projectName;
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

    const uploadedFiles = await uploadToR2(projectName,filesWithDocTypes, "employee_master", "employee_upload");
  // const uploadedFiles = await uploadToR2(filesWithDocTypes, "documents_master", "system_upload");
  const uploadedUrls = uploadedFiles.map(file => file.url.replace(/^public_url\s*=\s*/, ''));
const idProof1 = uploadedUrls.join(',');


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
      projectId
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


//--------------------------------------------------------------------------------------------------------------


exports.importEmployeeExcelData = async (req, res) => {
  try {
    const employees = req.body.employee;
const projectId = req.projectId
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: "No employee records provided." });
    }

    const requiredFields = [
      "employeeID",
      "employeeName",
      "employeePhone",
      "employeeEmail",
      "idType",
      "employeeSalary",
      "department"
    ];

    const errors = [];
    const cleanedEmployees = [];

    // Step 1: Validate each row
    employees.forEach((record, index) => {
      const rowErrors = [];

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
        cleanedEmployees.push({
          employeeID: String(record.employeeID).trim(),
          employeeName: String(record.employeeName).trim(),
          employeePhone: String(record.employeePhone).trim(),
          employeeEmail: String(record.employeeEmail).trim(),
          idType: String(record.idType).trim(),
          employeeSalary: Number(record.employeeSalary),
          department: String(record.department).trim(),
          emp_address: record.emp_address ? String(record.emp_address).trim() : null,
          idProof1: null, // No documents in Excel import
          projectId
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

    // Step 2: Check for duplicates in DB
    const duplicateConditions = cleanedEmployees.flatMap((emp) => ([
      { employeeID: emp.employeeID },
      { employeeEmail: emp.employeeEmail },
      { employeePhone: emp.employeePhone }
    ]));

    const existingEmployees = await EmployeeMaster.findAll({
      where: {
        [Op.or]: duplicateConditions
      },
      attributes: ['employeeID', 'employeeEmail', 'employeePhone']
    });

    if (existingEmployees.length > 0) {
      return res.status(400).json({
        error: 'Duplicate entries found in the database.',
        duplicates: existingEmployees
      });
    }

    // Step 3: Bulk insert
    const created = await EmployeeMaster.bulkCreate(cleanedEmployees, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Employees imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Employee import error:", err);
    res.status(500).json({ error: "Internal server error during employee import." });
  }
};


//--------------------------------------------------------------------------------------------------------------

//  Read
exports.getEmployeeDetails = async (req, res) => {
  try {
     const projectId = req.projectId;
    const employeeDetails = await EmployeeMaster.findAll({where:{projectId}});

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

//--------------------------------------------------------------------------------------------------------------

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

    // Parse retainedFiles JSON string or array
    let retainedKeys = [];
    try {
      retainedKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : retainedFiles || [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    // Normalize retained keys to just keys (remove full URLs)
    // Because keys are needed for deleteObjects call
    // Remove the public URL prefix if present
    const oldKeys = employee.idProof1 ? employee.idProof1.split(',') : [];
    const keysToDelete = oldKeys.filter(k => {
      // Normalize retainedKeys to keys to compare correctly
      const normalizedRetained = retainedKeys.map(url => {
        if (url.startsWith('http')) {
          return url.replace(`${PUBLIC_R2_BASE_URL}/`, '');
        }
        return url;
      });
      return !normalizedRetained.includes(k);
    });

    // Delete removed files from R2 bucket
    if (keysToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: keysToDelete.map(k => ({ Key: k })),
          Quiet: true
        }
      }).promise();
    }

    // Support files under req.files (assuming multer.any() or multer.array('documents'))
    const files = Array.isArray(req.files) ? req.files : [];

    let newUploadedUrls = [];

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

      // Call uploadToR2 with correct parameters (projectName can be added if needed)
      const uploadedFiles = await uploadToR2('employee_master_edit', filesWithDocTypes, "employee_edit", "employee_edit");

    
      newUploadedUrls = uploadedFiles.map(file => (file.url || '').replace(/^public_url\s*=\s*/, ''));
    }

    // Normalize retained keys to full URLs (if any are just keys)
    const normalizedRetainedUrls = retainedKeys.map(url => url.startsWith('http') ? url : `${PUBLIC_R2_BASE_URL}/${url}`);

    // Final combined URLs
    const finalUrls = [...normalizedRetainedUrls, ...newUploadedUrls];

    // Update employee record
    employee.employeeName = employeeName;
    employee.employeePhone = employeePhone;
    employee.employeeEmail = employeeEmail;
    employee.idType = idType;
    employee.employeeSalary = employeeSalary;
    employee.department = department;
    employee.emp_address = emp_address;
    employee.idProof1 = finalUrls.join(',');

    await employee.save();
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//--------------------------------------------------------------------------------------------------------------

//  Delete
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
