const requireAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
};

const requireSuperadmin = (req, res, next) => {
  if (req.user?.role === 'SUPERADMIN') {
    return next();
  }
  return res.status(403).json({ error: 'Superadmin access required' });
};

module.exports = {
  requireAdmin,
  requireSuperadmin,
};
