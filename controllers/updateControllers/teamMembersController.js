const { ValidationError } = require('sequelize');

const TeamMembers =require('../../models/updateModels/teamMembersSchema');

// create
exports.createTeamMemberDetails = async (req,res) =>{
    try {
            const userId = req.userId;
        const{team_name,team_phone,team_email,team_address,team_designation}=req.body
        const newTeamMembersDetails =await TeamMembers.create({
            team_name,team_phone,team_email,team_address,team_designation})
        res.status(201).json(newTeamMembersDetails)

    } catch (err) {
         if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
    }
}

exports.importTeamMembersExcelData = async (req, res) => {
  try {
    const teamMembers = req.body.teamMembers;

    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return res.status(400).json({ error: "No team member records provided." });
    }

    const requiredFields = ["team_name", "team_phone", "team_email"];
    const errors = [];
    const cleanedTeamMembers = [];

    teamMembers.forEach((record, index) => {
      const rowErrors = [];

      requiredFields.forEach(field => {
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
        cleanedTeamMembers.push({
          team_name: String(record.team_name).trim(),
          team_phone: String(record.team_phone).trim(),
          team_email: String(record.team_email).trim(),
          team_address: record.team_address ? String(record.team_address).trim() : null,
          team_designation: record.team_designation ? String(record.team_designation).trim() : null,
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded data.",
        errors
      });
    }

    const created = await TeamMembers.bulkCreate(cleanedTeamMembers, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Team members imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Team member import error:", err);
    res.status(500).json({ error: "Internal server error during import." });
  }
};

// read
exports.getTeamMemberDetails = async(req,res)=>{
 try {
    const userId = req.userId;
    const teamMemberDetails = await TeamMembers.findAll()
    res.status(201).json(teamMemberDetails)
 } catch (err) {
    res.status(500).json({ error: err.message });
 }
}

// update
exports.updateTeamMemberDetails = async (req,res)=>{
    try {
            const userId = req.userId; 
        const{id}=req.params;
        const{team_name,team_phone,team_email,team_address,team_designation}=req.body
       const teamMemberDetails =  await TeamMembers.findOne({ where: {id } })
       if(!teamMemberDetails)
        return res.status(404).json({ error: "Team Members not found" });

       teamMemberDetails.team_name=team_name;
       teamMemberDetails.team_phone = team_phone;
       teamMemberDetails.team_email = team_email;
       teamMemberDetails.team_address = team_address;
       teamMemberDetails.team_designation= team_designation;
        await teamMemberDetails.save()
        res.status(201).json(teamMemberDetails)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//delete

exports.deleteTeamMemberDetails = async(req,res)=>{
    try {
        const userId = req.userId;
        const {id}=req.params;
        const deleted = await TeamMembers.destroy({where:{id}})
        if (!deleted) return res.status(404).json({ error: "Team Member Details not found" });
        res.json({ message: "Team Member Details deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};