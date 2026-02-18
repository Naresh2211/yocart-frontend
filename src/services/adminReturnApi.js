import api from "./api";

// GET all return / replacement requests
export const getAllReturnRequests = () =>
  api.get("/admin/returns");

// COMPLETE return or replacement
export const completeReturnRequest = (requestId) =>
  api.put(`/admin/returns/${requestId}/complete`);
