import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Pagination,
} from '@mui/material';
import { subscriptionsApi } from '../../api/subscriptions';
import { subscriptionPacksApi } from '../../api/subscriptionPacks';

const CustomerSubscriptionView: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentSubscription();
    fetchHistory();
    fetchPacks();
  }, [page]);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await subscriptionsApi.getCurrent();
      setSubscription(response.subscription);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch subscription:', error);
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await subscriptionsApi.getHistory(page, 10);
      setHistory(response.history);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await subscriptionPacksApi.listAvailable(1, 100);
      setPacks(response.packs);
    } catch (error) {
      console.error('Failed to fetch packs:', error);
      setError('Failed to load subscription packs. Please try again later.');
    }
  };

  const handleRequest = async () => {
    if (!selectedSku) return;
    try {
      await subscriptionsApi.request({ sku: selectedSku });
      setOpen(false);
      setSelectedSku('');
      fetchCurrentSubscription();
      fetchHistory();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to request subscription');
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate your subscription?')) {
      try {
        await subscriptionsApi.deactivate();
        fetchCurrentSubscription();
        fetchHistory();
      } catch (error) {
        console.error('Failed to deactivate subscription:', error);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Subscription
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {subscription ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {subscription.pack.name}
            </Typography>
            <Typography color="textSecondary">Status: {subscription.status}</Typography>
            <Typography color="textSecondary">
              Price: ${subscription.pack.price}
            </Typography>
            <Typography color="textSecondary">
              Assigned At: {subscription.assigned_at ? new Date(subscription.assigned_at).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography color="textSecondary">
              Valid until: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography color="textSecondary">
              Valid: {subscription.is_valid ? 'Yes' : 'No'}
            </Typography>
            {subscription.status === 'active' && (
              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={handleDeactivate}
              >
                Deactivate Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            No Active Subscription
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Request Subscription
          </Button>
        </Paper>
      )}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Subscription History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pack Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned At</TableCell>
              <TableCell>Expires At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.pack_name}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  {item.assigned_at ? new Date(item.assigned_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(total / 10)}
        page={page}
        onChange={(_, p) => setPage(p)}
        sx={{ mt: 2 }}
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Request Subscription</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Pack"
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a pack</option>
            {packs.map((pack) => (
              <option key={pack.id} value={pack.sku}>
                {pack.name} - ${pack.price}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleRequest} variant="contained" disabled={!selectedSku}>
            Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerSubscriptionView;
