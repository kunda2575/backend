// Required models
const User = require('./signUpSchema');
const ProjectMaster = require('./projectMasterSchema');

User.belongsToMany(ProjectMaster, {
  through: 'UserProjects',
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'projects',
});

ProjectMaster.belongsToMany(User, {
  through: 'UserProjects',
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'users',
});

module.exports = {
  User,
  ProjectMaster,
};