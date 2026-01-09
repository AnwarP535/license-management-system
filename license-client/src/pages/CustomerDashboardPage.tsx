import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionsApi } from '../api/subscriptions.api';
import { useNavigate } from 'react-router-dom';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getCurrent();
      setSubscription(response.subscription);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSubscription(null);
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load subscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    requested: 'warning',
    approved: 'primary',
    active: 'success',
    inactive: 'default',
    expired: 'error',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || user?.email}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {subscription ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5">Current Subscription</Typography>
                  <Chip
                    label={subscription.status}
                    color={statusColors[subscription.status] || 'default'}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Subscription Plan
                    </Typography>
                    <Typography variant="h6">{subscription.pack.name}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="h6">${subscription.pack.price.toFixed(2)}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Validity
                    </Typography>
                    <Typography variant="h6">{subscription.pack.validity_months} months</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="h6">
                      {subscription.is_valid ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive/Expired" color="error" size="small" />
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned At
                    </Typography>
                    <Typography variant="body1">{formatDate(subscription.assigned_at)}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Expires At
                    </Typography>
                    <Typography variant="body1">{formatDate(subscription.expires_at)}</Typography>
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/subscription')}
                  >
                    Manage Subscription
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/subscription-history')}
                  >
                    View History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Active Subscription
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You don't have an active subscription yet. Request a subscription to get started.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/subscription')}
            >
              Request Subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};
