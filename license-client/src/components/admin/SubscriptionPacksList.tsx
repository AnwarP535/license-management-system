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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { subscriptionPacksApi, SubscriptionPack } from '../../api/subscriptionPacks';

const SubscriptionPacksList: React.FC = () => {
  const [packs, setPacks] = useState<SubscriptionPack[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    validity_months: 1,
  });

  useEffect(() => {
    fetchPacks();
  }, [page]);

  const fetchPacks = async () => {
    try {
      const response = await subscriptionPacksApi.list(page, 10);
      setPacks(response.packs);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch packs:', error);
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', sku: '', price: 0, validity_months: 1 });
    setOpen(true);
  };

  const handleEdit = (pack: SubscriptionPack) => {
    setEditing(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      sku: pack.sku,
      price: pack.price,
      validity_months: pack.validity_months,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await subscriptionPacksApi.update(editing.id, formData);
      } else {
        await subscriptionPacksApi.create(formData);
      }
      setOpen(false);
      fetchPacks();
    } catch (error) {
      console.error('Failed to save pack:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this pack?')) {
      try {
        await subscriptionPacksApi.delete(id);
        fetchPacks();
      } catch (error) {
        console.error('Failed to delete pack:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Subscription Packs</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
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
                <TableCell>${pack.price}</TableCell>
                <TableCell>{pack.validity_months}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(pack)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(pack.id)}>
                    <Delete />
                  </IconButton>
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
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Pack' : 'Create Pack'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            margin="normal"
            disabled={!!editing}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Validity (Months)"
            type="number"
            value={formData.validity_months}
            onChange={(e) =>
              setFormData({ ...formData, validity_months: parseInt(e.target.value) })
            }
            margin="normal"
            inputProps={{ min: 1, max: 12 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPacksList;
