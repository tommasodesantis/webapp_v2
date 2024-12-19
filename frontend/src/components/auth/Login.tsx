import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Box,
} from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs" 
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: '8px',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Welcome to SuperPro Web App
          </Typography>
          <Typography 
            component="h2" 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              letterSpacing: '0.25px',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Sign In
          </Typography>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Sign In
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/register" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}