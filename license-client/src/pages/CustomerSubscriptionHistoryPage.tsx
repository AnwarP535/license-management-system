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
  Typography,
  Pagination,
  Chip,
  Box,
} from '@mui/material';
import { subscriptionsApi } from '../api/subscriptions.api';

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  requested: 'warning',
  approved: 'primary',
  active: 'success',
  inactive: 'default',
  expired: 'error',
};

export const CustomerSubscriptionHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getHistory(page, 10, 'desc');
      setHistory(response.history);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch subscription history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Subscription History
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : history.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No subscription history found.
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Pack Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell>Expires At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.pack_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={statusColors[item.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.assigned_at)}</TableCell>
                    <TableCell>{formatDate(item.expires_at)}</TableCell>
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
        </>
      )}
    </Container>
  );
};
