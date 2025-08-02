const projectFilter = (req, res, next) => {
  const projectId = req.headers['project-id'];
  const projectName = req.headers['project-name']; // <-- Add this line

  if (!projectId) {
    return res.status(400).json({ error: "Missing project ID in request headers" });
  }

  req.projectId = parseInt(projectId);
  req.projectName = projectName || null; // <-- Attach projectName to request
  next();
};

module.exports = projectFilter;
