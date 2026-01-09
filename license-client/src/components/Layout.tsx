import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Customers', path: '/customers' },
    { text: 'Subscription Packs', path: '/subscription-packs' },
    { text: 'Subscriptions', path: '/subscriptions' },
  ];

  const customerMenuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'My Subscription', path: '/subscription' },
    { text: 'History', path: '/subscription-history' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : customerMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            License Management System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name || user?.email} ({user?.role === 'admin' ? 'Admin' : 'Customer'})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
