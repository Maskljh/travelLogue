const jwt = require("jsonwebtoken");

const JWT_SECRET = "travelAudit";

// 生成 JWT token
const generateToken = (adminInfo) => {
  return jwt.sign(adminInfo, JWT_SECRET, { expiresIn: "24h" });
};

// 验证 JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 验证管理员权限的中间件
const authMiddleware = (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ message: "未登录" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "登录已过期" });
  }

  req.adminInfo = decoded;
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
};
