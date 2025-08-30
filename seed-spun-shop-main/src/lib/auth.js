import { api } from "./api";

export const register      = (payload)        => api.post("/api/auth/register", payload).then(r => r.data);
export const login         = (payload)        => api.post("/api/auth/login", payload).then(r => r.data);
export const logout        = ()               => api.post("/api/auth/logout").then(r => r.data);
export const isAuth        = ()               => api.get ("/api/auth/is-auth").then(r => r.data).catch(()=>({success:false}));
export const sendVerifyOTP = ()               => api.post("/api/auth/send-verify-otp").then(r => r.data);
export const verifyEmail   = (otp)            => api.post("/api/auth/verify-email", { otp }).then(r => r.data);
export const me            = ()               => api.get ("/api/user/data").then(r => r.data);
export const upgradeSeller = (payload)        => api.post("/api/user/upgrade-seller", payload).then(r => r.data);
