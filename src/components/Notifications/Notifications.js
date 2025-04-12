import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Notifications as NotificationsIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import { selectNotifications, markNotificationAsRead } from '../../store/gameSlice';

const Notifications = ({ onClose }) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          <NotificationsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Notifications
        </Typography>
        <IconButton onClick={onClose}>
          <ClearIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {notifications.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
          No notifications yet.
        </Typography>
      ) : (
        <List sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {notifications.slice().reverse().map((notification) => (
            <ListItem 
              key={notification.id}
              alignItems="flex-start"
              sx={{
                opacity: notification.read ? 0.7 : 1,
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                borderLeft: `4px solid`,
                borderColor: `${notification.type}.main`,
                mb: 1,
                borderRadius: 1,
              }}
              secondaryAction={
                !notification.read && (
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {notification.message}
                    </Typography>
                    {!notification.read && (
                      <Chip 
                        label="New" 
                        size="small" 
                        color="primary" 
                        sx={{ height: 20 }} 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="textSecondary">
                    {new Date(notification.timestamp).toLocaleString()}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {notifications.some(n => !n.read) && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="outlined"
            onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id))}
          >
            Mark all as read
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Notifications;
