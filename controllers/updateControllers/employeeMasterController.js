
const EmployeeMaster =require('../../models/updateModels/employeeMasterSchema');
const { Op } = require("sequelize");

exports.createEmployeeDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      employeeID,
      employeeName,
      employeePhone,
      employeeEmail,
      idType,
      idProof1,
      employeeSalary,
      department,
      emp_address
    } = req.body;

    // Check for duplicates (optional but recommended)
    const existing = await EmployeeMaster.findOne({
      where: {
        [Op.or]: [
          { employeeID },
          { employeeEmail },
          { employeePhone }
        ],
        userId
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
      userId
    });

    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: err.message });
  }
};

// read
exports.getEmployeeDetails = async(req,res)=>{
 try {
    const userId = req.userId;
    const employeeDetails = await EmployeeMaster.findAll({ where: { userId } })
    res.status(201).json(employeeDetails)
 } catch (err) {
    res.status(500).json({ error: err.message });
 }
}

// update
exports.updateEmployeesDetails = async (req,res)=>{
    try {
        const userId = req.userId; 
        const{id}=req.params;
        const{employeeName,employeePhone,employeeEmail,address,idType,idProof1,employeeSalary,department,emp_address}=req.body
       const employeeDetails =  await EmployeeMaster.findOne({ where: {id, userId } })
       if(!employeeDetails)
        return res.status(404).json({ error: "Employees not found" });

       employeeDetails.employeeName=employeeName;
       employeeDetails.employeePhone = employeePhone;
       employeeDetails.employeeEmail = employeeEmail;
       employeeDetails.address = address;
       employeeDetails. idType= idType;
       employeeDetails.idProof1 = idProof1;
       employeeDetails.employeeSalary =employeeSalary ;
       employeeDetails.department = department;
       employeeDetails.department = department;
       employeeDetails.emp_address = emp_address;
            await employeeDetails.save()
            res.status(201).json(employeeDetails)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//delete

exports.deleteEmployeesDetails = async(req,res)=>{
    try {
        const userId = req.userId;
        const {id}=req.params;
        const deleted = await EmployeeMaster.destroy({where:{id,userId}})
        if (!deleted) return res.status(404).json({ error: "Employee Details not found" });
        res.json({ message: "Employee Details deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
    