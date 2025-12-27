import React, {useState, useEffect, useRef, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar,
  Divider, TextField, IconButton, Badge, CircularProgress, Alert, Fab, Dialog, DialogTitle,
  List as MuiList, ListItemButton, useTheme, Tooltip, Fade, Popover, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AuthContext from '../../context/AuthContext';
import chatService from '../../services/chatService';

const ChatPage = () => {
  const {user} = useContext(AuthContext);
  const theme = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (activeConversation) {
      setMessages([]);
      lastSyncRef.current = null;
      fetchMessages(activeConversation._id);
      startPolling(activeConversation._id);
    } else {
      stopPolling();
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
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
  };

  const startPolling = (conversationId) => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current && conversationId) {
        fetchMessages(conversationId);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

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
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  const getOtherParticipant = (conv) => {
    return conv.participants.find((p) => p._id !== user._id) || {};
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
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
    const CACHE_duration = 60 * 1000; // 1 minute cache

    // Clear any closing timeout to prevent flickering if moving quickly between elements
    if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);

    hoverDelayRef.current = setTimeout(async () => {
      setAnchorEl(target);

      // Check Cache
      const cached = summaryCache.current[patientId];
      if (cached && (Date.now() - cached.timestamp < CACHE_duration)) {
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
    if (user.role === 'DOCTOR' && activeConversation) {
      const patientId = getOtherParticipant(activeConversation)._id;
      navigate(`/doctor/treatment-plan/${patientId}`);
    }
  };

  return (
    <Box sx={{flexGrow: 1, height: 'calc(100vh - 100px)', p: 3, overflow: 'hidden', bgcolor: '#f0f2f5'}}>
      <Paper
        elevation={6}
        sx={{
          height: '100%',
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'white',
        }}
      >
        {/* Sidebar */}
        <Box sx={{
          width: 350,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
        }}>
          <Box
            p={3}
            borderBottom={1}
            borderColor="divider"
            sx={{bgcolor: theme.palette.primary.main, color: 'white'}}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Messages</Typography>
              <Tooltip title="Start New Chat">
                <IconButton
                  size="small"
                  onClick={() => setOpenNewChat(true)}
                  sx={{'bgcolor': 'rgba(255,255,255,0.2)', 'color': 'white', '&:hover': {bgcolor: 'rgba(255,255,255,0.3)'}}}
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
                'bgcolor': 'rgba(255,255,255,0.15)',
                'borderRadius': 1,
                '& .MuiOutlinedInput-root': {
                  'color': 'white',
                  '& fieldset': {border: 'none'},
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1,
                },
              }}
            />
          </Box>
          <List sx={{overflowY: 'auto', flexGrow: 1, py: 0}}>
            {conversations
                .filter((conv) => {
                  const other = getOtherParticipant(conv);
                  return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .length === 0 ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" p={3} textAlign="center" color="text.secondary">
                              <ChatBubbleOutlineIcon sx={{fontSize: 40, mb: 1, opacity: 0.5}} />
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
                                        'borderLeft': isSelected ? 4 : 0,
                                        'borderColor': 'primary.main',
                                        // Explicit background for selection to ensure contrast
                                        'bgcolor': isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                        'transition': 'all 0.2s',
                                        '&:hover': {bgcolor: 'rgba(0,0,0,0.04)'},
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar
                                          alt={other.name}
                                          src="/static/images/avatar/1.jpg"
                                          sx={{
                                            bgcolor: isSelected ? 'primary.main' : 'grey.300',
                                            color: isSelected ? '#fff' : 'grey.700',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          {other.name?.[0]}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography fontWeight={isSelected ? 700 : 500} color="#2c3e50">
                                            {other.name}
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
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
        <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa'}}>
          {activeConversation ? (
                        <>
                          {/* Chat Header */}
                          <Box
                            p={2}
                            px={3}
                            borderBottom={1}
                            borderColor="divider"
                            bgcolor="white"
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{boxShadow: '0 2px 4px rgba(0,0,0,0.02)', zIndex: 1}}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{bgcolor: theme.palette.secondary.main}}>
                                {getOtherParticipant(activeConversation).name?.[0]}
                              </Avatar>
                              <Box
                                onMouseEnter={(e) => handleProfileHover(e, getOtherParticipant(activeConversation)._id)}
                                onMouseLeave={handleProfileLeave}
                                sx={{cursor: user.role === 'DOCTOR' ? 'pointer' : 'default'}}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  onClick={(e) => {
                                    if (user.role === 'DOCTOR') {
                                      e.stopPropagation();
                                      handleHeaderClick();
                                    }
                                  }}
                                  sx={{
                                    'color': '#000000',
                                    '&:hover': {textDecoration: user.role === 'DOCTOR' ? 'underline' : 'none'},
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
                                  <Typography variant="caption" color="text.secondary">
                                    {activeConversation.isActive ? 'Active Session' : 'Session Closed'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            {!activeConversation.isActive && (
                              <Alert severity="error" icon={false} sx={{py: 0, px: 2}}>
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
                            backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                          }}>
                            {messages
                                .filter((msg) => !(user.role === 'PATIENT' && msg.type === 'ALERT'))
                                .map((msg, index) => {
                                  const isMe = msg.sender === user._id;
                                  const isSystem = msg.type === 'SYSTEM';


                                  const isAlert = msg.type === 'ALERT';
                                  const isMilestone = msg.type === 'MILESTONE';

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
                                        elevation={isMe ? 4 : 1}
                                        sx={{
                                          p: 2,
                                          maxWidth: '70%',
                                          borderRadius: 3,
                                          borderBottomRightRadius: isMe ? 0 : 3,
                                          borderBottomLeftRadius: isMe ? 3 : 0,
                                          // Improved contrast: Darker text for incoming, White for outgoing
                                          bgcolor: isMe ? theme.palette.primary.main : '#ffffff',
                                          color: isMe ? '#ffffff' : '#1a1a1a',
                                          // Subtle border for incoming to stand out against white bg
                                          border: isMe ? 'none' : '1px solid #e0e0e0',
                                          background: isMe ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` : '#ffffff',
                                        }}
                                      >
                                        <Typography variant="body1" sx={{wordBreak: 'break-word', lineHeight: 1.5, fontWeight: 500}}>
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
                            bgcolor="white"
                            borderTop={1}
                            borderColor="divider"
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                'display': 'flex',
                                'alignItems': 'center',
                                'p': '2px 4px',
                                'bgcolor': 'grey.100',
                                'borderRadius': 3,
                                'border': 1,
                                'borderColor': 'transparent',
                                '&:focus-within': {borderColor: 'primary.main', bgcolor: 'white'},
                                'transition': 'all 0.2s',
                              }}
                            >
                              <TextField
                                fullWidth
                                placeholder={activeConversation.isActive ? 'Type your message...' : 'Chat is disabled'}
                                variant="standard"
                                InputProps={{
                                  disableUnderline: true,
                                  sx: {px: 2, py: 1, color: '#000000'}, // Pure black for input
                                }}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!activeConversation.isActive}
                              />
                              <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!activeConversation.isActive || !newMessage.trim()}
                                sx={{
                                  'm': 1,
                                  'bgcolor': 'primary.main',
                                  'color': 'white',
                                  '&:hover': {bgcolor: 'primary.dark'},
                                  '&.Mui-disabled': {bgcolor: 'action.disabledBackground'},
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
                            <ChatBubbleOutlineIcon sx={{fontSize: 60, opacity: 0.3}} />
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
        PaperProps={{sx: {borderRadius: 3}}}
      >
        <DialogTitle sx={{borderBottom: 1, borderColor: 'divider', pb: 2}}>
                    Start New Conversation
        </DialogTitle>
        <MuiList sx={{py: 0}}>
          {contacts.length === 0 ? (
                        <Box p={4} textAlign="center" color="text.secondary">
                          <Typography>No active treatment plans found.</Typography>
                        </Box>
                    ) : (
                        contacts.map((contact) => (
                          <ListItemButton
                            key={contact._id}
                            onClick={() => handleStartChat(contact._id)}
                            sx={{py: 2}}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{bgcolor: 'primary.light', color: 'primary.contrastText'}}>{contact.name[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography fontWeight="500">{contact.name}</Typography>}
                              secondary={contact.role}
                            />
                          </ListItemButton>
                        ))
                    )}
        </MuiList>
      </Dialog>

      {/* Patient Summary Popover */}
      <Popover
        sx={{pointerEvents: 'none'}}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus
      >
        <Paper sx={{p: 2.5, maxWidth: 350, bgcolor: 'background.paper', borderRadius: 3}}>
          {hoverLoading ? (
                        <Box p={2} display="flex" justifyContent="center"><CircularProgress size={20} /></Box>
                    ) : hoverData && hoverData.treatment ? (
                        <Box>
                          {/* Header */}
                          <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{width: 48, height: 48, bgcolor: 'primary.main', mr: 2}}>
                              {hoverData.patient.name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {hoverData.patient.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {/* Fallback as schema lacks age/gender */}
                                        Patient Details
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{mb: 2}} />

                          {/* Active Treatment Section */}
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                        Active Treatment
                              </Typography>
                              <Chip
                                label={hoverData.treatment.status}
                                size="small"
                                color={hoverData.treatment.status === 'ACTIVE' ? 'success' : 'default'}
                                sx={{height: 20, fontSize: '0.65rem'}}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Diagnosis:</strong> {hoverData.treatment.diagnosis}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Started:</strong> {new Date(hoverData.treatment.startDate).toLocaleDateString()}
                            </Typography>
                          </Box>

                          {/* Medications */}
                          <Box>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{display: 'block', mb: 1}}>
                                    MEDICATIONS
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {hoverData.treatment.medications.slice(0, 3).map((med, idx) => (
                                <Chip
                                  key={idx}
                                  label={med}
                                  size="small"
                                  variant="outlined"
                                  sx={{borderRadius: 1}}
                                />
                              ))}
                              {hoverData.treatment.medications.length > 3 && (
                                <Chip
                                  label={`+${hoverData.treatment.medications.length - 3} more`}
                                  size="small"
                                  variant="outlined"
                                  sx={{borderRadius: 1, bgcolor: 'action.hover'}}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No active treatment data available.</Typography>
                    )}
        </Paper>
      </Popover>
    </Box>
  );
};

export default ChatPage;
