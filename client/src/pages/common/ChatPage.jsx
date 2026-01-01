import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar,
  Divider, TextField, IconButton, Badge, CircularProgress, Alert, Fab, Dialog, DialogTitle,
  List as MuiList, ListItemButton, useTheme, Tooltip, Fade, Popover, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AuthContext from '@/context/AuthContext';
import chatService from '@/services/chatService';
import { USER_ROLES } from '@/constants/userRoles';
import { MESSAGE_TYPES } from '@/constants/messageTypes';
import { TREATMENT_STATUS } from '@/constants/treatmentStatus';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // New Chat State
  const [contacts, setContacts] = useState([]);
  const [openNewChat, setOpenNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Polling State
  const lastSyncRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  const messagesEndRef = useRef(null);

  // Hover Card State
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverData, setHoverData] = useState(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const hoverDelayRef = useRef(null);
  // Simple in-memory cache: { [patientId]: { timestamp: number, data: object } }
  const summaryCache = useRef({});

  // Initial Load
  useEffect(() => {
    fetchConversations();
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.data.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const since = lastSyncRef.current;
      const res = await chatService.getMessages(conversationId, since);
      const newMsgs = res.data.data;
      if (newMsgs.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const filtered = newMsgs.filter((m) => !existingIds.has(m._id));
          return [...prev, ...filtered];
        });
        const lastMsg = newMsgs[newMsgs.length - 1];
        lastSyncRef.current = lastMsg.createdAt;
        if (isTabActiveRef.current) {
          chatService.markAsRead(conversationId, lastMsg.createdAt);
        }
      }
    } catch (error) {
      console.error('Polling error', error);
    }
  }, []);

  const startPolling = useCallback((conversationId) => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current && conversationId) {
        fetchMessages(conversationId);
      }
    }, 3000);
  }, [fetchMessages]);

  useEffect(() => {
    if (activeConversation) {
      setMessages([]);
      lastSyncRef.current = null;
      fetchMessages(activeConversation._id);
      startPolling(activeConversation._id);
    } else {
      stopPolling();
    }
  }, [activeConversation, fetchMessages, startPolling]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    try {
      await chatService.sendMessage(activeConversation._id, newMessage);
      setNewMessage('');
      fetchMessages(activeConversation._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conv) => {
    return conv.participants.find((p) => p._id !== user._id) || {};
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const res = await chatService.initConversation(targetUserId);
      const newConv = res.data.data;
      setOpenNewChat(false);
      fetchConversations();
      setActiveConversation(newConv);
      setNewMessage('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  useEffect(() => {
    if (openNewChat) {
      const fetchContacts = async () => {
        try {
          const res = await chatService.getContacts();
          setContacts(res.data.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchContacts();
    }
  }, [openNewChat]);

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

  const handleProfileHover = (event, patientId) => {
    if (user.role !== 'DOCTOR') return;

    const target = event.currentTarget;
    const cacheDuration = 60 * 1000; // 1 minute cache

    // Clear any closing timeout to prevent flickering if moving quickly between elements
    if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);

    hoverDelayRef.current = setTimeout(async () => {
      setAnchorEl(target);

      // Check Cache
      const cached = summaryCache.current[patientId];
      if (cached && (Date.now() - cached.timestamp < cacheDuration)) {
        setHoverData(cached.data);
        return;
      }

      setHoverLoading(true);
      try {
        const res = await chatService.getPatientSummary(patientId);
        const data = res.data.data;

        // Update Cache
        summaryCache.current[patientId] = {
          timestamp: Date.now(),
          data: data,
        };

        setHoverData(data);
      } catch (err) {
        console.error('Failed to fetch summary', err);
        setHoverData(null);
      } finally {
        setHoverLoading(false);
      }
    }, 400); // 400ms delay
  };

  const handleProfileLeave = () => {
    if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    setAnchorEl(null);
    // We don't clear hoverData immediately to allow smooth transition if needed,
    // but removing anchor hides it.
  };

  // Navigation Handler
  const handleHeaderClick = () => {
    if (user.role === USER_ROLES.DOCTOR && activeConversation) {
      const patientId = getOtherParticipant(activeConversation)._id;
      navigate(`/doctor/treatment-plan/${patientId}`);
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      height: 'calc(100vh - 100px)',
      p: 3,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    }}>
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        {/* Sidebar */}
        <Box sx={{
          width: 350,
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        }}>
          <Box
            p={3}
            sx={{
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700} color="white">Messages</Typography>
              <Tooltip title="Start New Chat">
                <IconButton
                  size="small"
                  onClick={() => setOpenNewChat(true)}
                  sx={{
                    'bgcolor': 'rgba(59, 130, 246, 0.2)',
                    'color': '#60a5fa',
                    'border': '1px solid rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(59, 130, 246, 0.3)',
                      borderColor: 'rgba(59, 130, 246, 0.5)',
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                'bgcolor': 'rgba(15, 23, 42, 0.5)',
                'borderRadius': 2,
                'border': '1px solid rgba(148, 163, 184, 0.1)',
                '& .MuiOutlinedInput-root': {
                  'color': 'white',
                  '& fieldset': { border: 'none' },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(148, 163, 184, 0.6)',
                  opacity: 1,
                },
              }}
            />
          </Box>
          <List sx={{ overflowY: 'auto', flexGrow: 1, py: 0 }}>
            {conversations
              .filter((conv) => {
                const other = getOtherParticipant(conv);
                return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" p={3} textAlign="center" color="text.secondary">
                <ChatBubbleOutlineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">No conversations found.</Typography>
              </Box>
            ) : (
              conversations
                .filter((conv) => {
                  const other = getOtherParticipant(conv);
                  return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = activeConversation?._id === conv._id;
                  return (
                    <ListItemButton
                      key={conv._id}
                      selected={isSelected}
                      onClick={() => setActiveConversation(conv)}
                      sx={{
                        'py': 2,
                        'px': 3,
                        'borderLeft': isSelected ? 3 : 0,
                        'borderColor': '#60a5fa',
                        'bgcolor': isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        'transition': 'all 0.2s',
                        'borderRadius': isSelected ? '0 8px 8px 0' : 0,
                        '&:hover': {
                          bgcolor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.05)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={other.name}
                          src="/static/images/avatar/1.jpg"
                          sx={{
                            bgcolor: isSelected ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: isSelected ? '2px solid rgba(59, 130, 246, 0.3)' : 'none',
                          }}
                        >
                          {other.name?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography fontWeight={isSelected ? 700 : 500} color="white">
                            {other.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.8)' }} fontWeight={500}>
                            {other.role}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })
            )}
          </List>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)' }}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <Box
                p={2}
                px={3}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  zIndex: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#3b82f6', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                    {getOtherParticipant(activeConversation).name?.[0]}
                  </Avatar>
                  <Box
                    // eslint-disable-next-line max-len
                    onMouseEnter={(e) => handleProfileHover(e, getOtherParticipant(activeConversation)._id)}
                    onMouseLeave={handleProfileLeave}
                    sx={{ cursor: user.role === USER_ROLES.DOCTOR ? 'pointer' : 'default' }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      onClick={(e) => {
                        if (user.role === USER_ROLES.DOCTOR) {
                          e.stopPropagation();
                          handleHeaderClick();
                        }
                      }}
                      sx={{
                        'color': 'white',
                        '&:hover': { textDecoration: user.role === USER_ROLES.DOCTOR ? 'underline' : 'none' },
                      }}
                    >
                      {getOtherParticipant(activeConversation).name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: activeConversation.isActive ? 'success.main' : 'error.main',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                        {activeConversation.isActive ? 'Active Session' : 'Session Closed'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {!activeConversation.isActive && (
                  <Alert severity="error" icon={false} sx={{ py: 0, px: 2 }}>
                    Treatment Completed
                  </Alert>
                )}
              </Box>

              {/* Messages List */}
              <Box sx={{
                flexGrow: 1,
                p: 3,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}>
                {messages
                  .filter(
                    (msg) => !(
                      user.role === USER_ROLES.PATIENT &&
                      msg.type === MESSAGE_TYPES.ALERT
                    ),
                  )
                  .map((msg, index) => {
                    const isMe = msg.sender === user._id;
                    const isSystem = msg.type === MESSAGE_TYPES.SYSTEM;


                    const isAlert = msg.type === MESSAGE_TYPES.ALERT;
                    const isMilestone = msg.type === MESSAGE_TYPES.MILESTONE;

                    if (isSystem || isAlert || isMilestone) {
                      let bgcolor = 'rgba(0,0,0,0.05)';
                      let color = 'text.secondary';
                      let icon = null;

                      if (isAlert) {
                        bgcolor = '#fff4e5'; // Orange-ish
                        color = '#e65100';
                        icon = '⚠️ ';
                      } else if (isMilestone) {
                        bgcolor = '#e8f5e9'; // Green-ish
                        color = '#2e7d32';
                        icon = '🏆 ';
                      }

                      return (
                        <Box key={msg._id || index} display="flex" justifyContent="center" width="100%" my={1}>
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor,
                              px: 2,
                              py: 1,
                              borderRadius: 4,
                              color,
                              border: isAlert || isMilestone ? 1 : 0,
                              borderColor: isAlert ? '#ffcc80' : (isMilestone ? '#a5d6a7' : 'transparent'),
                              fontWeight: isAlert || isMilestone ? 600 : 400,
                            }}
                          >
                            {icon}{msg.content}
                          </Typography>
                        </Box>
                      );
                    }

                    return (
                      <Box
                        key={msg._id || index}
                        display="flex"
                        justifyContent={isMe ? 'flex-end' : 'flex-start'}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            borderRadius: 3,
                            borderBottomRightRadius: isMe ? 0 : 3,
                            borderBottomLeftRadius: isMe ? 3 : 0,
                            bgcolor: isMe ? 'transparent' : 'rgba(30, 41, 59, 0.6)',
                            color: '#ffffff',
                            border: isMe ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                            background: isMe ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.4) 100%)' : 'rgba(30, 41, 59, 0.6)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <Typography variant="body1" sx={{ wordBreak: 'break-word', lineHeight: 1.5, fontWeight: 500 }}>
                            {msg.content}
                          </Typography>
                          <Box display="flex" justifyContent="flex-end" mt={0.5}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.65rem',
                                opacity: 0.8,
                                // Explicit colors for readability
                                color: isMe ? 'rgba(255,255,255,0.9)' : '#757575',
                              }}
                            >
                              {formatDate(msg.createdAt)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    );
                  })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box
                p={3}
                sx={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    'display': 'flex',
                    'alignItems': 'center',
                    'p': '2px 4px',
                    'bgcolor': 'rgba(15, 23, 42, 0.6)',
                    'borderRadius': 3,
                    'border': '1px solid rgba(148, 163, 184, 0.2)',
                    'backdropFilter': 'blur(10px)',
                    '&:focus-within': {
                      borderColor: 'rgba(59, 130, 246, 0.5)',
                      bgcolor: 'rgba(15, 23, 42, 0.8)',
                    },
                    'transition': 'all 0.2s',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder={activeConversation.isActive ? 'Type your message...' : 'Chat is disabled'}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: { px: 2, py: 1, color: 'white' },
                    }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!activeConversation.isActive}
                  />
                  <IconButton
                    onClick={handleSend}
                    disabled={!activeConversation.isActive || !newMessage.trim()}
                    sx={{
                      'm': 1,
                      'bgcolor': '#3b82f6',
                      'color': 'white',
                      'border': '1px solid rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        bgcolor: '#2563eb',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(148, 163, 184, 0.2)',
                        borderColor: 'rgba(148, 163, 184, 0.1)',
                      },
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Box>
            </>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
              <Box
                sx={{
                  width: 120, height: 120, borderRadius: '50%',
                  bgcolor: 'action.hover', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', mb: 3,
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
              <Typography variant="h5" color="text.primary" gutterBottom>Select a Conversation</Typography>
              <Typography variant="body1">Choose a contact from the left to start chatting.</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* New Chat Dialog */}
      <Dialog
        open={openNewChat}
        onClose={() => setOpenNewChat(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', pb: 2, color: 'white' }}>
          Start New Conversation
        </DialogTitle>
        <MuiList sx={{ py: 0 }}>
          {contacts.length === 0 ? (
            <Box p={4} textAlign="center" color="text.secondary">
              <Typography>No active treatment plans found.</Typography>
            </Box>
          ) : (
            contacts.map((contact) => (
              <ListItemButton
                key={contact._id}
                onClick={() => handleStartChat(contact._id)}
                sx={{ py: 2 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#3b82f6', border: '2px solid rgba(59, 130, 246, 0.3)' }}>{contact.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography fontWeight="500" color="white">{contact.name}</Typography>}
                  secondary={<Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.8)' }}>{contact.role}</Typography>}
                />
              </ListItemButton>
            ))
          )}
        </MuiList>
      </Dialog>

      {/* Patient Summary Popover */}
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus
      >
        <Paper sx={{
          p: 2.5,
          maxWidth: 350,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: 3,
        }}>
          {hoverLoading ? (
            <Box p={2} display="flex" justifyContent="center"><CircularProgress size={20} /></Box>
          ) : hoverData && hoverData.treatment ? (
            <Box>
              {/* Header */}
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: '#3b82f6', border: '2px solid rgba(59, 130, 246, 0.3)', mr: 2 }}>
                  {hoverData.patient.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="white">
                    {hoverData.patient.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                    {/* Fallback as schema lacks age/gender */}
                    Patient Details
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Active Treatment Section */}
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontWeight="bold" color="white">
                    Active Treatment
                  </Typography>
                  <Chip
                    label={hoverData.treatment.status}

                    color={hoverData.treatment.status === TREATMENT_STATUS.ACTIVE ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.9)' }} gutterBottom>
                  <strong>Diagnosis:</strong> {hoverData.treatment.diagnosis}
                    // eslint-disable-next-line max-len
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                  <strong>Started:</strong>{' '}
                  {new Date(hoverData.treatment.startDate).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Medications */}
              <Box>
                <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1, color: 'rgba(148, 163, 184, 0.8)' }}>
                  MEDICATIONS
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {hoverData.treatment.medications.slice(0, 3).map((med, idx) => (
                    <Chip
                      key={idx}
                      label={med}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                  {hoverData.treatment.medications.length > 3 && (
                    <Chip
                      label={`+${hoverData.treatment.medications.length - 3} more`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1, bgcolor: 'action.hover' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.8)' }}>No active treatment data available.</Typography>
          )}
        </Paper>
      </Popover>
    </Box>
  );
};

export default ChatPage;
