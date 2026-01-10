import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { subscriptionsApi, Subscription } from '../../api/subscriptions';
import { customersApi, Customer } from '../../api/customers';
import { subscriptionPacksApi, SubscriptionPack } from '../../api/subscriptionPacks';

const SubscriptionsList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packs, setPacks] = useState<SubscriptionPack[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedPackId, setSelectedPackId] = useState<number | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptions();
    if (assignOpen) {
      fetchCustomers();
      fetchPacks();
    }
  }, [page, status, assignOpen]);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionsApi.list(page, 10, status || undefined);
      setSubscriptions(response.subscriptions);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.list(1, 100);
      setCustomers(response.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await subscriptionPacksApi.list(1, 100);
      setPacks(response.packs);
    } catch (error) {
      console.error('Failed to fetch packs:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await subscriptionsApi.approve(id);
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to approve subscription:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedCustomerId || !selectedPackId) {
      setError('Please select both customer and pack');
      return;
    }
    try {
      setError('');
      await subscriptionsApi.assign(Number(selectedCustomerId), { pack_id: Number(selectedPackId) });
      setAssignOpen(false);
      setSelectedCustomerId('');
      setSelectedPackId('');
      fetchSubscriptions();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign subscription');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Subscriptions</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAssignOpen(true)}
        >
          Assign Subscription
        </Button>
      </Box>
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Filter by Status</InputLabel>
        <Select
          value={status}
          label="Filter by Status"
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="requested">Requested</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Pack Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.id}</TableCell>
                <TableCell>{sub.customer_id}</TableCell>
                <TableCell>{sub.pack_name}</TableCell>
                <TableCell>{sub.status}</TableCell>
                <TableCell>${sub.price}</TableCell>
                <TableCell>
                  {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  {sub.status === 'requested' && (
                    <Button size="small" onClick={() => handleApprove(sub.id)}>
                      Approve
                    </Button>
                  )}
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
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Subscription to Customer</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Customer</InputLabel>
            <Select
              value={selectedCustomerId}
              label="Select Customer"
              onChange={(e) => setSelectedCustomerId(e.target.value as number)}
            >
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Subscription Pack</InputLabel>
            <Select
              value={selectedPackId}
              label="Select Subscription Pack"
              onChange={(e) => setSelectedPackId(e.target.value as number)}
            >
              {packs.map((pack) => (
                <MenuItem key={pack.id} value={pack.id}>
                  {pack.name} - ${pack.price} ({pack.validity_months} months)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAssignOpen(false);
            setSelectedCustomerId('');
            setSelectedPackId('');
            setError('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained" disabled={!selectedCustomerId || !selectedPackId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionsList;
