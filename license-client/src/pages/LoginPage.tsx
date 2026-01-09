import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const customerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const customerSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});

const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'customer'], {
    required_error: 'Please select a role',
  }),
}).superRefine((data, ctx) => {
  // If role is customer, name and phone are required
  if (data.role === 'customer') {
    if (!data.name || data.name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name must be at least 2 characters',
        path: ['name'],
      });
    }
    if (!data.phone || data.phone.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number must be at least 10 characters',
        path: ['phone'],
      });
    }
  }
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;
type CustomerLoginForm = z.infer<typeof customerLoginSchema>;
type CustomerSignupForm = z.infer<typeof customerSignupSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export const LoginPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const adminForm = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const customerLoginForm = useForm<CustomerLoginForm>({
    resolver: zodResolver(customerLoginSchema),
  });

  const customerSignupForm = useForm<CustomerSignupForm>({
    resolver: zodResolver(customerSignupSchema),
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onAdminLogin = async (data: AdminLoginForm) => {
    try {
      setError(null);
      await login(data.email, data.password, true);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const onCustomerLogin = async (data: CustomerLoginForm) => {
    try {
      setError(null);
      await login(data.email, data.password, false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const onCustomerSignup = async (data: CustomerSignupForm) => {
    try {
      setError(null);
      await signup(data.name, data.email, data.password, data.phone, 'customer');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const onSignup = async (data: SignupForm) => {
    try {
      setError(null);
      await signup(
        data.name || '', 
        data.email, 
        data.password, 
        data.phone || '', 
        data.role
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          License Management System
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
            <Tab label="Admin Login" />
            <Tab label="Customer Login" />
            <Tab label="Sign Up" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <form onSubmit={adminForm.handleSubmit(onAdminLogin)}>
            <TextField
              {...adminForm.register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!adminForm.formState.errors.email}
              helperText={adminForm.formState.errors.email?.message}
            />
            <TextField
              {...adminForm.register('password')}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!adminForm.formState.errors.password}
              helperText={adminForm.formState.errors.password?.message}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Admin Login
            </Button>
          </form>
        )}

        {tab === 1 && (
          <form onSubmit={customerLoginForm.handleSubmit(onCustomerLogin)}>
            <TextField
              {...customerLoginForm.register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!customerLoginForm.formState.errors.email}
              helperText={customerLoginForm.formState.errors.email?.message}
            />
            <TextField
              {...customerLoginForm.register('password')}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!customerLoginForm.formState.errors.password}
              helperText={customerLoginForm.formState.errors.password?.message}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Customer Login
            </Button>
          </form>
        )}

        {tab === 2 && (
          <form onSubmit={signupForm.handleSubmit(onSignup)}>
            <FormControl fullWidth margin="normal" error={!!signupForm.formState.errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                {...signupForm.register('role')}
                label="Role"
                value={signupForm.watch('role')}
                onChange={(e) => signupForm.setValue('role', e.target.value as 'admin' | 'customer')}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              {signupForm.formState.errors.role && (
                <FormHelperText>{signupForm.formState.errors.role.message}</FormHelperText>
              )}
            </FormControl>
            {signupForm.watch('role') === 'customer' && (
              <>
                <TextField
                  {...signupForm.register('name')}
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={!!signupForm.formState.errors.name}
                  helperText={signupForm.formState.errors.name?.message}
                />
                <TextField
                  {...signupForm.register('phone')}
                  label="Phone"
                  fullWidth
                  margin="normal"
                  error={!!signupForm.formState.errors.phone}
                  helperText={signupForm.formState.errors.phone?.message}
                />
              </>
            )}
            <TextField
              {...signupForm.register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!signupForm.formState.errors.email}
              helperText={signupForm.formState.errors.email?.message}
            />
            <TextField
              {...signupForm.register('password')}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!signupForm.formState.errors.password}
              helperText={signupForm.formState.errors.password?.message}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Sign Up
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};
