import { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardOverview from '../components/admin/DashboardOverview';
import CustomersList from '../components/admin/CustomersList';
import SubscriptionPacksList from '../components/admin/SubscriptionPacksList';
import SubscriptionsList from '../components/admin/SubscriptionsList';

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard' },
    { text: 'Customers', icon: <PeopleIcon />, path: 'customers' },
    { text: 'Subscription Packs', icon: <InventoryIcon />, path: 'packs' },
    { text: 'Subscriptions', icon: <AssignmentIcon />, path: 'subscriptions' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            License Management - Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
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
                  selected={selectedMenu === item.path}
                  onClick={() => {
                    setSelectedMenu(item.path);
                    navigate(`/admin/${item.path}`);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="packs" element={<SubscriptionPacksList />} />
            <Route path="subscriptions" element={<SubscriptionsList />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
