const apiClient = axios.create({
  baseURL: `http://localhost:3000`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const fetchEvents = () => apiClient.get("/events");
export const fetchEvent = (id) => apiClient.get(`/events/${id}`);
export const fetchEventMembers = (eventId) =>
  apiClient.get(`/members?eventId=${eventId}`);
export const fetchEventGifts = (eventId) =>
  apiClient.get(`/gifts?eventId=${eventId}`);
export const fetchEventHistory = (eventId) =>
  apiClient.get(`eventHistory?eventId=${eventId}`);
export const removeEventGift = (id) => apiClient.delete(`/gifts/${id}`);
export const removeEventMember = (id) => apiClient.delete(`/members/${id}`);
export const createEventHistory = (historyObj) =>
  apiClient.post("/eventHistory", historyObj);
