import api from '@/api/axios';

const chatService = {
  // Initialize or get existing conversation
  initConversation: async (targetUserId) => {
    return await api.post('/chat/conversations/init', {targetUserId});
  },

  // Get all active conversations
  getConversations: async () => {
    return await api.get('/chat/conversations');
  },

  // Get messages for a conversation
  getMessages: async (conversationId, since = null, limit = 50) => {
    const params = {conversationId, limit};
    if (since) params.since = since;
    return await api.get('/chat/messages', {params});
  },

  // Send a message
  sendMessage: async (conversationId, content) => {
    return await api.post('/chat/messages', {conversationId, content});
  },

  // Mark conversation as read
  markAsRead: async (conversationId, timestamp) => {
    return await api.patch('/chat/conversations/read', {conversationId, timestamp});
  },

  // Get available contacts
  getContacts: async () => {
    return await api.get('/chat/contacts');
  },
  getPatientSummary: async (patientId) => {
    // Pointing to the new specialized summary endpoint in treatments
    return await api.get(`/treatments/summary/${patientId}`);
  },
};

export default chatService;
