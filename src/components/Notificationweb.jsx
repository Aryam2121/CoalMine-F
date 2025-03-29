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
import { useMemo } from 'react';  
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from '@mui/icons-material/Delete';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Delete, MarkAsUnread, MarkEmailRead } from "@mui/icons-material";
import { Search, Trash2, CheckCircle, Bell, MailOpen } from "lucide-react";

// Generate random notification messages
const randomMessages = [
  "⚠️ Gas leakage detected in Section B. Immediate action required!",
  "🚧 Shift handover completed. Check logs for updates.",
  "🔄 System update applied to safety monitoring dashboard.",
  "⛑️ New safety drill scheduled for tomorrow at 10 AM.",
  "⚠️ High methane levels detected in Shaft 3. Evacuate the area!",
  "🛠️ Maintenance team deployed to conveyor belt failure at Pit 4.",
  "📊 Daily safety report is available for review.",
  "🔔 Fire suppression system activated in Tunnel 2.",
  "🆘 Emergency alert: Worker distress signal received near Exit C!",
  "📢 DGMS safety inspection scheduled for next week.",
  "🔍 PPE compliance audit starts in 30 minutes.",
  "📡 Communication failure detected in underground radio system.",
  "⚠️ Seismic activity detected! Check structural integrity of tunnels.",
  "🔧 Equipment failure reported on drilling machine #7.",
  "🚑 Medical emergency reported in Zone A. First responders alerted!",
  "📝 Incident report submitted for electrical fault in control room.",
  "✅ Safety compliance checklist updated successfully.",
  "🚨 Unauthorized personnel detected in restricted area!",
  "🕒 Next shift reminder: Ensure proper safety gear before entry.",
  "🔄 Real-time air quality monitoring updated for all sections."
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
        prevNotifications.map((notification) =>
          selectedNotifications.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );
    } else if (action === 'unread') {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          selectedNotifications.includes(notification.id)
            ? { ...notification, read: false }
            : notification
        )
      );
    } else if (action === 'delete') {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => !selectedNotifications.includes(notification.id))
      );
      setSelectedNotifications([]); // Clear selection after delete
    }
  };
  
  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === 'read' && !notification.read) return false;
      if (filter === 'unread' && notification.read) return false;
      if (searchQuery && !notification.message.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    });
  }, [notifications, filter, searchQuery]);
  
  
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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <h2 className="text-3xl font-bold mb-6 text-center tracking-wide">
          🔔 Notifications
        </h2>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex space-x-2">
            {["all", "unread", "read"].map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 transition ${
                  filter === type ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
              
            ))}
             <Button
  className="to-blue-600 text-white px-4 py-2 hover:bg-blue-500 transition"
  onClick={() => setNotifications([])}
>
  Clear All
</Button>
          </div>
         

          {/* Animated Search Input */}
          <motion.div
            initial={{ width: "3rem" }}
            animate={{ width: searchQuery ? "100%" : "3rem" }}
            transition={{ duration: 0.3 }}
            className="relative flex items-center bg-gray-800 px-3 py-2 rounded-lg"
          >
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 bg-transparent text-white focus:outline-none w-full transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 mb-4 bg-gray-800 p-3 rounded-lg"
            >
              <Button
  variant="outline"
  className="bg-red-500 text-white hover:bg-red-600"
  onClick={() => handleBulkAction("delete")}
>
  <Trash2 size={18} className="mr-2" />
  Delete Selected
</Button>
<Button
  variant="outline"
  className="bg-green-500 text-white hover:bg-green-600"
  onClick={() => handleBulkAction("read")}
>
  <CheckCircle size={18} className="mr-2" />
  Mark as Read
</Button>
<Button
  variant="outline"
  className="bg-yellow-500 text-white hover:bg-yellow-600"
  onClick={() => handleBulkAction("unread")}
>
  <MailOpen size={18} className="mr-2" />
  Mark as Unread
</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center"
              >
                No notifications available
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gray-800 p-4 rounded-xl shadow-lg flex items-center justify-between transition hover:bg-gray-700"
                >
                  {/* Checkbox & Message */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="text-white"
                    />
                    <Badge
                      color="secondary"
                      variant="dot"
                      invisible={notification.read}
                    >
                      <div>
                        <p className="font-medium text-lg">
                          {notification.message}
                        </p>
                        <span className="text-sm text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                  <Tooltip title={notification.read ? "Mark as Unread" : "Mark as Read"}>
  <IconButton
    onClick={() =>
      notification.read
        ? markAsUnread(notification.id)
        : markAsRead(notification.id)
    }
  >
    {notification.read ? (
      <MailOpen className="text-blue-400" />
    ) : (
      <Bell className="text-green-400" />
    )}
  </IconButton>
</Tooltip>

<Tooltip title="Delete">
  <IconButton onClick={() => deleteNotification(notification.id)}>
    <Trash2 className="text-red-400" />
  </IconButton>
</Tooltip>

                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notifications;