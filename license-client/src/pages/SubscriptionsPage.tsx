import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { CheckCircle, PersonAdd, PersonRemove } from '@mui/icons-material';
import { subscriptionsApi } from '../api/subscriptions.api';
import { customersApi } from '../api/customers.api';
import { subscriptionPacksApi } from '../api/subscription-packs.api';
import type { Subscription, AssignSubscriptionRequest } from '../api/subscriptions.api';
import type { Customer } from '../api/customers.api';
import type { SubscriptionPack } from '../api/subscription-packs.api';

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  requested: 'warning',
  approved: 'primary',
  active: 'success',
  inactive: 'default',
  expired: 'error',
};

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packs, setPacks] = useState<SubscriptionPack[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [selectedPackId, setSelectedPackId] = useState<number>(0);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionsApi.getAll(page, 10, statusFilter || undefined);
      setSubscriptions(response.subscriptions);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.getAll(1, 1000);
      setCustomers(response.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await subscriptionPacksApi.getAll(1, 1000);
      setPacks(response.packs);
    } catch (error) {
      console.error('Failed to fetch subscription packs:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  useEffect(() => {
    if (assignDialogOpen) {
      fetchCustomers();
      fetchPacks();
    }
  }, [assignDialogOpen]);

  const handleApprove = async (subscription: Subscription) => {
    try {
      await subscriptionsApi.approve(subscription.id);
      fetchSubscriptions();
      setApproveDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to approve subscription:', error);
      alert(error.response?.data?.message || 'Failed to approve subscription');
    }
  };

  const handleAssign = async () => {
    if (!selectedCustomerId || !selectedPackId) {
      alert('Please select both customer and pack');
      return;
    }
    try {
      const data: AssignSubscriptionRequest = { pack_id: selectedPackId };
      await subscriptionsApi.assign(selectedCustomerId, data);
      fetchSubscriptions();
      setAssignDialogOpen(false);
      setSelectedCustomerId(0);
      setSelectedPackId(0);
    } catch (error: any) {
      console.error('Failed to assign subscription:', error);
      alert(error.response?.data?.message || 'Failed to assign subscription');
    }
  };

  const handleUnassign = async () => {
    if (!selectedSubscription) return;
    try {
      await subscriptionsApi.unassign(
        selectedSubscription.customer_id,
        selectedSubscription.id
      );
      fetchSubscriptions();
      setUnassignDialogOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error('Failed to unassign subscription:', error);
      alert(error.response?.data?.message || 'Failed to unassign subscription');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Subscriptions</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => {
            setSelectedCustomerId(0);
            setSelectedPackId(0);
            setAssignDialogOpen(true);
          }}
        >
          Assign Subscription
        </Button>
      </Box>

      <Box mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="requested">Requested</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Pack Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Assigned At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.id}</TableCell>
                <TableCell>{subscription.customer_id}</TableCell>
                <TableCell>{subscription.pack_name}</TableCell>
                <TableCell>{subscription.pack_sku}</TableCell>
                <TableCell>
                  <Chip
                    label={subscription.status}
                    color={statusColors[subscription.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>${subscription.price.toFixed(2)}</TableCell>
                <TableCell>{formatDate(subscription.requested_at)}</TableCell>
                <TableCell>{formatDate(subscription.assigned_at)}</TableCell>
                <TableCell>{formatDate(subscription.expires_at)}</TableCell>
                <TableCell>
                  {subscription.status === 'requested' && (
                    <IconButton
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setApproveDialogOpen(true);
                      }}
                      color="success"
                      title="Approve"
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                  {subscription.status === 'active' && (
                    <IconButton
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setUnassignDialogOpen(true);
                      }}
                      color="error"
                      title="Unassign"
                    >
                      <PersonRemove />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(total / 10)}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
        />
      </Box>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve subscription #{selectedSubscription?.id} for pack{' '}
            {selectedSubscription?.pack_name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedSubscription && handleApprove(selectedSubscription)}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Subscription</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Customer</InputLabel>
              <Select
                value={selectedCustomerId}
                label="Customer"
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Subscription Pack</InputLabel>
              <Select
                value={selectedPackId}
                label="Subscription Pack"
                onChange={(e) => setSelectedPackId(Number(e.target.value))}
              >
                {packs.map((pack) => (
                  <MenuItem key={pack.id} value={pack.id}>
                    {pack.name} - ${pack.price.toFixed(2)} ({pack.validity_months} months)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unassign Dialog */}
      <Dialog open={unassignDialogOpen} onClose={() => setUnassignDialogOpen(false)}>
        <DialogTitle>Unassign Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unassign subscription #{selectedSubscription?.id}? This will
            deactivate the subscription.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnassignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUnassign} variant="contained" color="error">
            Unassign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
