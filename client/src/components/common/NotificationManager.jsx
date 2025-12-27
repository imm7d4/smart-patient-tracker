import React, {useEffect, useRef, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import chatService from '../../services/chatService';

// Wait, I saw Alert in ChatPage, but not Snackbar context globally.
// I'll implement a simple Snackbar here with MUI or use a global one if it existed.
// Given the context, I'll use a local Snackbar but "Manager" usually implies it's mounted in App.
// Actually, `App.jsx` doesn't wrap with SnackbarProvider.
// I will use `alert` or native `Notification` API for now as user requested "notifications".
// Better: Add a simple MUI Snackbar state here.

import {Snackbar, Alert} from '@mui/material';
import {useState} from 'react';

const NotificationManager = () => {
  const {user} = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState({message: '', title: ''});

  // Polling State
  const lastCheckRef = useRef(Date.now());
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Request Browser Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    startPolling();

    return () => stopPolling();
  }, [user]);

  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = setInterval(checkForNewMessages, 30000); // Check every 30s
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
  };

  const checkForNewMessages = async () => {
    try {
      // Get conversations sorted by lastMessage
      const res = await chatService.getConversations();
      const conversations = res.data.data;

      if (conversations.length === 0) return;

      // Find any conversation with new message since last check
      // AND last message sender is NOT me
      // AND last message is newer than my read status (if implemented) or just simpler check against time

      const lastCheck = lastCheckRef.current;
      let newestMsgTime = lastCheck;
      let hasNew = false;
      let latestConv = null;

      for (const conv of conversations) {
        const msgTime = new Date(conv.lastMessageAt).getTime();

        // If message is newer than my last check
        if (msgTime > lastCheck) {
          // Check if I am the sender
          if (conv.lastMessageSender !== user._id) {
            hasNew = true;
            latestConv = conv;
            if (msgTime > newestMsgTime) newestMsgTime = msgTime;
            break; // Just notify for one for now to avoid spam
          }
        }
      }

      if (hasNew && latestConv) {
        // Trigger Notification
        const senderName = getOtherParticipantName(latestConv, user._id);
        const text = `New message from ${senderName}: ${latestConv.lastMessageContent || 'Sent a message'}`;

        triggerNotification(text);

        // Update reference
        lastCheckRef.current = newestMsgTime;
      }
    } catch (err) {
      console.error('Notification Poll Error:', err);
    }
  };

  const getOtherParticipantName = (conv, myId) => {
    const other = conv.participants.find((p) => p._id !== myId);
    return other ? other.name : 'System';
  };

  const triggerNotification = (message) => {
    // 1. In-App Snackbar
    setNotification({message});
    setOpen(true);

    // 2. Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Smart Patient Tracker', {
        body: message,
        icon: '/logo192.png', // Default react logo if exists
      });
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{vertical: 'top', horizontal: 'right'}}
    >
      <Alert
        onClose={handleClose}
        severity="info"
        sx={{width: '100%', cursor: 'pointer'}}
        onClick={() => {
          navigate('/chat');
          handleClose();
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationManager;
