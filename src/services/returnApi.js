import api from "./api"; // your existing axios instance

export const requestReturnOrReplacement = (orderId, type, reason) => {
  return api.post("/api/returns/request", null, {
    params: {
      orderId,
      type,     // RETURN | REPLACEMENT
      reason,   // Damaged item | Accessory missing
    },
  });
};
