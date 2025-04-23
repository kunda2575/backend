
const ProjectMaster =require('../models/projectMasterSchema');

// create
exports.createProjectDetails = async (req,res) =>{
    try {
            const userId = req.userId;
        const{projectName,projectOwner,projectContact,projectAddress,projectBrouchers,projectStartDate,projectEndDate}=req.body
        const newProjectDetails =await ProjectMaster.create({
            userId,projectName,projectOwner,projectContact,projectAddress,projectBrouchers,projectStartDate,projectEndDate})
        res.status(201).json(newProjectDetails)

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// read
exports.getProjectDetails = async(req,res)=>{
 try {
    const userId = req.userId;
    const projectDetails = await ProjectMaster.findAll({ where: { userId } })
    res.status(201).json(projectDetails)
 } catch (err) {
    res.status(500).json({ error: err.message });
 }
}

// update
exports.updateProjectsDetails = async (req,res)=>{
    try {
            const userId = req.userId; 
        const{id}=req.params;
        const{projectName,projectOwner,projectContact,projectAddress,projectBrouchers,projectStartDate,projectEndDate}=req.body
       const projectDetails =  await ProjectMaster.findOne({ where: {id, userId } })
       if(!projectDetails)
        return res.status(404).json({ error: "Projects not found" });

       projectDetails.projectName=projectName;
       projectDetails.projectOwner = projectOwner;
       projectDetails.projectContact = projectContact;
       projectDetails.projectAddress = projectAddress;
       projectDetails.projectBrouchers= projectBrouchers;
       projectDetails.projectStartDate = projectStartDate;
       projectDetails.projectEndDate =projectEndDate ;
        await projectDetails.save()
        res.status(201).json(projectDetails)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//delete

exports.deleteProjectsDetails = async(req,res)=>{
    try {
        const userId = req.userId;
        const {id}=req.params;
        const deleted = await ProjectMaster.destroy({where:{id,userId}})
        if (!deleted) return res.status(404).json({ error: "Project Details not found" });
        res.json({ message: "Project Details deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};