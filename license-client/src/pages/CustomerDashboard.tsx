import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import CustomerSubscriptionView from '../components/customer/CustomerSubscriptionView';

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            License Management - Customer Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name || user?.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <CustomerSubscriptionView />
      </Container>
    </Box>
  );
};

export default CustomerDashboard;
