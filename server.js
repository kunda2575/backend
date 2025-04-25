const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sqlDb } = require("./config/db");

// masters
const blocksRoutes = require('./routes/blockRoutes');
const builderRoutes = require('./routes/builderRoutes');
const bankRoutes = require('./routes/bankRoutes');
const customerRoutes = require("./routes/customerRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const employeeRoutes = require('./routes/employeeRoutes');
const expenseCategoryRoutes = require('./routes/expenseCategoryRoutes');
const fundPurposeRoutes = require('./routes/fundPurposeRoutes');
const fundSourceRoutes = require('./routes/fundSourceRoutes');
const leadSourceRoutes = require('./routes/leadSourceRoutes');
const leadStageRoutes = require('./routes/leadStageRoutes');
const lostReasonRoutes = require('./routes/lostReasonsRoutes');
const materialMasterRoutes = require('./routes/materialMasterRoutes');
const paymentModeRoutes = require('./routes/paymentModeRoutes');
const paymentTypeRoutes = require('./routes/paymentTypeRoutes');
const rolesMasterRoutes = require('./routes/rolesMasterRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamMemberRoutes = require('./routes/teamMemberRoutes');
const unitTypeRoutes = require('./routes/unitTypeRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const userMasterRoutes = require('./routes/userRoutes')


// Schemas
const { leadStage } = require('./models/leadStageSchema');
const { leadSource } = require('./models/leadSourceSchema');
const { teamMember } = require('./models/teamMembersSchema');
const { vendorMaster } = require('./models/vendorMasterSchema');
const { materialMaster } = require('./models/materialMasterSchema');
const { customerMaster } = require('./models/customerMasterSchema');
const { userMaster } = require('./models/userMasterSchema');
const { rolesMaster } = require('./models/rolesMasterSchema');
const { builderMaster } = require('./models/builderMasterSchema');
const { projectMaster } = require('./models/projectMasterSchema');
const { blocksMaster } = require('./models/blocksMasterSchema');
const { paymentModeMaster } = require('./models/paymentModeMasterSchema');
const { paymentTypeMaster } = require('./models/paymentTypeMasterSchema');
const { unitType } = require('./models/unitTypeSchema');
const { employeeMaster } = require('./models/employeeMasterSchema');
const { expenseCategoryMaster } = require('./models/expenseCategoryMasterSchema');
const { departmentMaster } = require('./models/departmentMasterSchema');
const { lostReasons } = require('./models/lostReasonsSchema');
const { bankMaster } = require('./models/bankMasterSchema');
const { fundSource } = require('./models/fundSourceSchema');
const { fundPurpose } = require('./models/fundPurposeSchema');

// Routes
const userRoutes = require("./routes/signUpRoutes");

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

    // ✅ Start Server
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start due to database error:", err);
    process.exit(1);
  });
