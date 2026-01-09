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
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Pagination,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customersApi } from '../api/customers.api';
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from '../api/customers.api';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});

type CustomerForm = z.infer<typeof customerSchema>;

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.getAll(page, 10, search || undefined);
      setCustomers(response.customers);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.reset({ name: customer.name, email: customer.email, phone: customer.phone });
    } else {
      setEditingCustomer(null);
      form.reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
    form.reset();
  };

  const onSubmit = async (data: CustomerForm) => {
    try {
      if (editingCustomer) {
        const updateData: CustomerUpdateRequest = {
          name: data.name,
          phone: data.phone,
        };
        await customersApi.update(editingCustomer.id, updateData);
      } else {
        const createData: CustomerCreateRequest = data;
        await customersApi.create(createData);
      }
      handleClose();
      fetchCustomers();
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersApi.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Customer
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(customer)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(customer.id)}>
                    <Delete />
                  </IconButton>
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogContent>
            <TextField
              {...form.register('name')}
              label="Name"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
            />
            <TextField
              {...form.register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              disabled={!!editingCustomer}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
            />
            <TextField
              {...form.register('phone')}
              label="Phone"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.phone}
              helperText={form.formState.errors.phone?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
