import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success:false, message:"Not Authorized. Login Again" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ success:false, message:"Token invalid" });
    req.user = { _id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message:"Unauthorized: " + e.message });
  }
};
export default userAuth;
