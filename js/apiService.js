// import axios from 'axios'
const apiClient = axios.create({
  baseURL: `http://localhost:3000`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default {
  fetchEvents() {
    return apiClient.get('/events')
  },
  fetchEvent(id) {
    return apiClient.get(`/events/${id}`)
  },
  fetchEventMembers(eventId) {
    return apiClient.get(`/members?eventId=${eventId}`)
  },
  fetchEventGifts(eventId) {
    return apiClient.get(`/gifts?eventId=${eventId}`)
  },
}

