import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import { subscriptionsApi } from '../api/subscriptions.api';
import { subscriptionPacksApi } from '../api/subscription-packs.api';
import type { SubscriptionPack } from '../api/subscription-packs.api';
import { useNavigate } from 'react-router-dom';

export const CustomerSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [packs, setPacks] = useState<SubscriptionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedPackSku, setSelectedPackSku] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
    fetchPacks();
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

  const fetchPacks = async () => {
    try {
      const response = await subscriptionPacksApi.getAllPublic();
      setPacks(response.packs);
    } catch (err) {
      console.error('Failed to fetch subscription packs:', err);
    }
  };

  const handleRequest = async () => {
    if (!selectedPackSku) {
      setError('Please select a subscription pack');
      return;
    }
    try {
      setError(null);
      await subscriptionsApi.request(selectedPackSku);
      setSuccess('Subscription request submitted successfully!');
      setRequestDialogOpen(false);
      setSelectedPackSku('');
      fetchSubscription();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request subscription');
    }
  };

  const handleDeactivate = async () => {
    try {
      setError(null);
      await subscriptionsApi.deactivate();
      setSuccess('Subscription deactivated successfully!');
      setDeactivateDialogOpen(false);
      fetchSubscription();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate subscription');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Subscription</Typography>
        {!subscription && (
          <Button
            variant="contained"
            onClick={() => setRequestDialogOpen(true)}
          >
            Request Subscription
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {subscription ? (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Current Subscription</Typography>
              <Chip
                label={subscription.status}
                color={statusColors[subscription.status] || 'default'}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Subscription Plan
                </Typography>
                <Typography variant="h6">{subscription.pack.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  SKU: {subscription.pack.sku}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="h6">${subscription.pack.price.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Validity: {subscription.pack.validity_months} months
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
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

              <Grid item xs={12}>
                <Box display="flex" gap={2} mt={2}>
                  {subscription.status === 'active' && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setDeactivateDialogOpen(true)}
                    >
                      Deactivate Subscription
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/subscription-history')}
                  >
                    View History
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Active Subscription
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You don't have an active subscription. Select a subscription pack below to request one.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setRequestDialogOpen(true)}
            >
              Request Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Request Subscription Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Subscription</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Subscription Pack</InputLabel>
            <Select
              value={selectedPackSku}
              label="Select Subscription Pack"
              onChange={(e) => setSelectedPackSku(e.target.value)}
            >
              {packs.map((pack) => (
                <MenuItem key={pack.id} value={pack.sku}>
                  {pack.name} - ${pack.price.toFixed(2)} ({pack.validity_months} months)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRequest} variant="contained">
            Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialogOpen} onClose={() => setDeactivateDialogOpen(false)}>
        <DialogTitle>Deactivate Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate your current subscription? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeactivate} variant="contained" color="error">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
