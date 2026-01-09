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
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subscriptionPacksApi } from '../api/subscription-packs.api';
import type {
  SubscriptionPack,
  SubscriptionPackCreateRequest,
  SubscriptionPackUpdateRequest,
} from '../api/subscription-packs.api';

const subscriptionPackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  price: z.number().min(0, 'Price must be positive'),
  validity_months: z.number().min(1).max(12, 'Validity must be between 1 and 12 months'),
});

type SubscriptionPackForm = z.infer<typeof subscriptionPackSchema>;

export const SubscriptionPacksPage: React.FC = () => {
  const [packs, setPacks] = useState<SubscriptionPack[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<SubscriptionPack | null>(null);

  const form = useForm<SubscriptionPackForm>({
    resolver: zodResolver(subscriptionPackSchema),
  });

  const fetchPacks = async () => {
    try {
      const response = await subscriptionPacksApi.getAll(page, 10);
      setPacks(response.packs);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch subscription packs:', error);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [page]);

  const handleOpen = (pack?: SubscriptionPack) => {
    if (pack) {
      setEditingPack(pack);
      form.reset({
        name: pack.name,
        description: pack.description,
        sku: pack.sku,
        price: pack.price,
        validity_months: pack.validity_months,
      });
    } else {
      setEditingPack(null);
      form.reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPack(null);
    form.reset();
  };

  const onSubmit = async (data: SubscriptionPackForm) => {
    try {
      if (editingPack) {
        const updateData: SubscriptionPackUpdateRequest = data;
        await subscriptionPacksApi.update(editingPack.id, updateData);
      } else {
        const createData: SubscriptionPackCreateRequest = data;
        await subscriptionPacksApi.create(createData);
      }
      handleClose();
      fetchPacks();
    } catch (error: any) {
      console.error('Failed to save subscription pack:', error);
      alert(error.response?.data?.message || 'Failed to save subscription pack');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subscription pack?')) {
      try {
        await subscriptionPacksApi.delete(id);
        fetchPacks();
      } catch (error) {
        console.error('Failed to delete subscription pack:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Subscription Packs</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Pack
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Validity (Months)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packs.map((pack) => (
              <TableRow key={pack.id}>
                <TableCell>{pack.id}</TableCell>
                <TableCell>{pack.name}</TableCell>
                <TableCell>{pack.sku}</TableCell>
                <TableCell>{pack.description}</TableCell>
                <TableCell>${pack.price.toFixed(2)}</TableCell>
                <TableCell>{pack.validity_months}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(pack)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(pack.id)}>
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
          <DialogTitle>{editingPack ? 'Edit Subscription Pack' : 'Add Subscription Pack'}</DialogTitle>
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
              {...form.register('description')}
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
            />
            <TextField
              {...form.register('sku')}
              label="SKU"
              fullWidth
              margin="normal"
              disabled={!!editingPack}
              error={!!form.formState.errors.sku}
              helperText={form.formState.errors.sku?.message}
            />
            <TextField
              {...form.register('price', { valueAsNumber: true })}
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ step: '0.01', min: 0 }}
              error={!!form.formState.errors.price}
              helperText={form.formState.errors.price?.message}
            />
            <TextField
              {...form.register('validity_months', { valueAsNumber: true })}
              label="Validity (Months)"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 1, max: 12 }}
              error={!!form.formState.errors.validity_months}
              helperText={form.formState.errors.validity_months?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingPack ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
