import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Checkbox,
  
} from '@mui/material';
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from '@mui/icons-material/Delete';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

// Generate random notification messages
const randomMessages = [
  'New message received!',
  'System update completed.',
  'New comment on your post.',
  'Warning: Server overload detected!',
  'User X joined the system.',
  'Your password will expire soon.',
  'Critical error: Database connection lost.',
  'Maintenance scheduled for tomorrow.',
  'Low disk space on server.',
  'New friend request from John.',
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    // Simulate random notifications arriving every 3 seconds
    const intervalId = setInterval(() => {
      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      const newNotification = {
        id: Date.now() + Math.random(), // Unique ID
        message: randomMessage,
        read: false,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }, 3000); // New notification every 3 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const handleBulkAction = (action) => {
    if (action === 'read') {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );
    } else if (action === 'unread') {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: false }))
      );
    } else if (action === 'delete') {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'read') return notification.read;
    if (filter === 'unread') return !notification.read;
    return true;
  });

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      {/* Filter and Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "contained" : "outlined"}
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          <Button
            variant={filter === "read" ? "contained" : "outlined"}
            onClick={() => setFilter("read")}
          >
            Read
          </Button>
        </div>
        <TextField
          placeholder="Search notifications..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="mb-4">
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleBulkAction("delete")}
          >
            Delete Selected
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleBulkAction("markAsRead")}
            style={{ marginLeft: "10px" }}
          >
            Mark Selected as Read
          </Button>
        </div>
      )}

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <Alert severity="info">No notifications available</Alert>
      ) : (
        <List>
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem
                  style={{
                    backgroundColor: notification.read ? "#f5f5f5" : "#fff",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelectNotification(notification.id)}
                  />
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={notification.read}
                  >
                    <ListItemText
                      primary={notification.message}
                      secondary={`Received: ${new Date(
                        notification.timestamp
                      ).toLocaleString()}`}
                    />
                  </Badge>
                  <Tooltip title="Mark as Read">
                    <IconButton
                      onClick={() =>
                        notification.read
                          ? markAsUnread(notification.id)
                          : markAsRead(notification.id)
                      }
                    >
                      {notification.read ? (
                        <MarkAsUnreadIcon color="primary" />
                      ) : (
                        <MarkEmailReadIcon color="secondary" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Notification">
                    <IconButton
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </ListItem>
                <Divider />
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}
    </Container>
  );
};

export default Notifications;