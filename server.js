const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sqlDb } = require("./config/db");
const blocksRoutes = require('./routes/blockRoutes');

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
const { paymentModeMaster } = require('./models/paymentMoseMasterSchema');
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
    app.use('/api/blocks', blocksRoutes);

    // ✅ Start Server
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start due to database error:", err);
    process.exit(1);
  });
