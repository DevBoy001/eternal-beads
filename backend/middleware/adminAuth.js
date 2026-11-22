/**
 * Simple secret-key admin authentication.
 * Pass the header:  X-Admin-Key: <your ADMIN_SECRET_KEY>
 * or query param:   ?adminKey=<your ADMIN_SECRET_KEY>
 */
function adminAuth(req, res, next) {
  const key =
    req.headers['x-admin-key'] ||
    req.query.adminKey;

  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}

module.exports = adminAuth;
