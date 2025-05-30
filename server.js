const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sqlDb } = require("./config/db");
const path = require('path');

//  update masters
const blocksRoutes = require('./routes/updateRoutes/blockRoutes');
const builderRoutes = require('./routes/updateRoutes/builderRoutes');
const bankRoutes = require('./routes/updateRoutes/bankRoutes');
const customerRoutes = require("./routes/updateRoutes/customerRoutes");
const departmentRoutes = require("./routes/updateRoutes/departmentRoutes");
const employeeRoutes = require('./routes/updateRoutes/employeeRoutes');
const expenseCategoryRoutes = require('./routes/updateRoutes/expenseCategoryRoutes');
const fundPurposeRoutes = require('./routes/updateRoutes/fundPurposeRoutes');
const fundSourceRoutes = require('./routes/updateRoutes/fundSourceRoutes');
const leadSourceRoutes = require('./routes/updateRoutes/leadSourceRoutes');
const leadStageRoutes = require('./routes/updateRoutes/leadStageRoutes');
const lostReasonRoutes = require("./routes/updateRoutes/lostReasonsRoutes")
const materialMasterRoutes = require('./routes/updateRoutes/materialMasterRoutes');
const paymentModeRoutes = require('./routes/updateRoutes/paymentModeRoutes');
const paymentTypeRoutes = require('./routes/updateRoutes/paymentTypeRoutes');
const rolesMasterRoutes = require('./routes/updateRoutes/rolesMasterRoutes');
const projectRoutes = require('./routes/updateRoutes/projectRoutes');
const teamMemberRoutes = require('./routes/updateRoutes/teamMemberRoutes');
const unitTypeRoutes = require('./routes/updateRoutes/unitTypeRoutes');
const vendorRoutes = require('./routes/updateRoutes/vendorRoutes');
const userMasterRoutes = require('./routes/updateRoutes/userRoutes')
 


// transaction routes
const leadTransaction = require("./routes/transactionRoutes/leadsRoutes")
const stockAvailabilityRoutes = require('./routes/transactionRoutes/stockAvailabilityRoutes')
const inventoryEntryRoutes = require('./routes/transactionRoutes/inventoryEntryRoutes');
const materialIssueRoutes = require('./routes/transactionRoutes/materialIssueRoutes');
const expenditureRoutes = require('./routes/transactionRoutes/expenditureRoutes')
const projectCreditsRoutes = require('./routes/transactionRoutes/projectCreditsRoutes')
const projectDebits = require('./routes/transactionRoutes/projectDebitRoutes')
const customerPaymentRoutes = require('./routes/transactionRoutes/customerPaymentRoutes')
// Schemas
const { leadStage } = require('./models/updateModels/leadStageSchema');
const { leadSource } = require('./models/updateModels/leadSourceSchema');
const { teamMember } = require('./models/updateModels/teamMembersSchema');
const { vendorMaster } = require('./models/updateModels/vendorMasterSchema');
const { materialMaster } = require('./models/updateModels/materialMasterSchema');
const { customerMaster } = require('./models/updateModels/customerMasterSchema');
const { userMaster } = require('./models/updateModels/userMasterSchema');
const { rolesMaster } = require('./models/updateModels/rolesMasterSchema');
const { builderMaster } = require('./models/updateModels/builderMasterSchema');
const { projectMaster } = require('./models/updateModels/projectMasterSchema');
const { blocksMaster } = require('./models/updateModels/blocksMasterSchema');
const { paymentModeMaster } = require('./models/updateModels/paymentModeMasterSchema');
const { paymentTypeMaster } = require('./models/updateModels/paymentTypeMasterSchema');
const { unitType } = require('./models/updateModels/unitTypeSchema');
const { employeeMaster } = require('./models/updateModels/employeeMasterSchema');
const { expenseCategoryMaster } = require('./models/updateModels/expenseCategoryMasterSchema');
const { departmentMaster } = require('./models/updateModels/departmentMasterSchema');
const { lostReasons } = require('./models/updateModels/lostReasonsSchema');
const { bankMaster } = require('./models/updateModels/bankMasterSchema');
const { fundSource } = require('./models/updateModels/fundSourceSchema');
const { fundPurpose } = require('./models/updateModels/fundPurposeSchema');


// tranaction models 
const {leads}= require('./models/transactionModels/leadsModel')
const {Material} =require('./models/transactionModels/stockAvailabilityModel')
const {inventory_entry} = require('./models/transactionModels/inventoryEntryModel')
const {expenditure}=require('./models/transactionModels/expenditureModel')
const {projectCredits}=require('./models/transactionModels/projectCreditsModel')
const {projectDebit}=require('./models/transactionModels/projectDebitModel')
const{customerPayments}=require('./models/transactionModels/customerPaymentsModel')
// Routes
const userRoutes = require("./routes/SignUpRoutes/signUpRoutes");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:5173", // Adjust based on your frontend URL
  credentials: true               // Important for cookies/auth headers
}));
app.use(express.json());

// ✅ Preflight requests handler (optional but helpful)
app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ Connect to DB and Start Server Only If Successful
sqlDb()
  .then(() => {
    // ✅ Routes
    app.use("/user", userRoutes);

    // masters
    app.use('/api/blocks', blocksRoutes);
    app.use('/api/builders',builderRoutes, );
    app.use('/api/banks',bankRoutes);
    app.use('/api/customers',customerRoutes);
    app.use('/api/departments', departmentRoutes);
    app.use('/api/employees',employeeRoutes);
    app.use('/api/expenseCategorys',expenseCategoryRoutes);
    app.use('/api/fundPurposes',fundPurposeRoutes);
    app.use('/api/fundSources',fundSourceRoutes);
    app.use('/api/leadSources',leadSourceRoutes);
    app.use('/api/leadStages',leadStageRoutes);
    app.use('/api/lostReasons',lostReasonRoutes);
    app.use('/api/materialMaster',materialMasterRoutes);
    app.use('/api/paymentModes',paymentModeRoutes);
    app.use('/api/paymentType',paymentTypeRoutes);
    app.use('/api/roles',rolesMasterRoutes);
    app.use('/api/projects',projectRoutes);
    app.use('/api/teamMembers',teamMemberRoutes);
    app.use('/api/unitTypes',unitTypeRoutes);
    app.use('/api/userMaster',userMasterRoutes);
    app.use('/api/vendors',vendorRoutes);

    //transaction
    app.use('/api/leads',leadTransaction)
    app.use('/api/stocks',stockAvailabilityRoutes)
    app.use('/api/inventory',inventoryEntryRoutes)
    app.use('/api/materialIssue',materialIssueRoutes)
    app.use('/api/expenditure',expenditureRoutes)
    app.use('/api/projectCredit',projectCreditsRoutes)
    app.use('/api/projectDebit',projectDebits)
    app.use('/api/customerPayments',customerPaymentRoutes)
    

// Make sure body parser is added
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the uploads folder statically at /uploads URL path

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Serve static files (like PDFs/images) from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline'); // 👈 Important: show in browser
  }
}));


    // ✅ Start Server
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start due to database error:", err);
    process.exit(1);
  });
