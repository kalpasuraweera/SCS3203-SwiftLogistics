
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { io } from 'socket.io-client';
import { Button, TextField, Typography, Box, Paper, List, ListItem, ListItemText, Divider, Select, MenuItem } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080'; // API Gateway
const WS_BASE = process.env.REACT_APP_WS_BASE || 'ws://localhost:8084'; // Notification Service
const KEYCLOAK_URL = process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8081';
const KEYCLOAK_REALM = process.env.REACT_APP_KEYCLOAK_REALM || 'swiftlogistics';
const KEYCLOAK_CLIENT_ID = process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'driver-app';

function App() {
  const [view, setView] = useState('login');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [action, setAction] = useState('delivered');
  const [reason, setReason] = useState('');
  const [ws, setWs] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState('');

  // Login with Keycloak Resource Owner Password Grant
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: KEYCLOAK_CLIENT_ID,
          username,
          password
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      setToken(res.data.access_token);
      setView('portal');
    } catch (err) {
      setError('Login failed.');
    }
  };

  // Fetch deliveries assigned to driver
  const fetchDeliveries = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(res.data);
    } catch (err) {
      setError('Failed to fetch deliveries.');
    }
  };

  // Submit delivery action
  const handleAction = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedDelivery) {
      setError('Select a delivery.');
      return;
    }
    try {
      await axios.post(`${API_BASE}/deliveries`, {
        orderId: selectedDelivery,
        status: action,
        reason: action === 'failed' ? reason : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReason('');
      setAction('delivered');
      fetchDeliveries();
    } catch (err) {
      setError('Failed to submit action.');
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    if (token && !ws) {
      const socket = io(WS_BASE, {
        auth: { token }
      });
      socket.on('delivery.event', (data) => {
        setUpdates((prev) => [data, ...prev]);
      });
      setWs(socket);
      return () => socket.disconnect();
    }
  }, [token, ws]);

  useEffect(() => {
    if (view === 'portal') fetchDeliveries();
    // eslint-disable-next-line
  }, [view]);

  if (view === 'login') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
          <Typography variant="h5" gutterBottom>Driver Login</Typography>
          <form onSubmit={handleLogin}>
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" required />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
          </form>
        </Paper>
      </Box>
    );
  }

  // Portal view
  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, mt: 4, minWidth: 400 }}>
        <Typography variant="h5" gutterBottom>Delivery Actions</Typography>
        <form onSubmit={handleAction} style={{ marginBottom: 24 }}>
          <Select value={selectedDelivery} onChange={e => setSelectedDelivery(e.target.value)} displayEmpty fullWidth required>
            <MenuItem value="" disabled>Select Delivery</MenuItem>
            {deliveries.map(delivery => (
              <MenuItem key={delivery.id} value={delivery.orderId || delivery.id}>
                #{delivery.orderId || delivery.id}: {delivery.status}
              </MenuItem>
            ))}
          </Select>
          <Select value={action} onChange={e => setAction(e.target.value)} fullWidth required sx={{ mt: 2 }}>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
          {action === 'failed' && (
            <TextField label="Reason" value={reason} onChange={e => setReason(e.target.value)} fullWidth margin="normal" required />
          )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Submit Action</Button>
        </form>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6">Real-Time Updates</Typography>
        <List>
          {updates.map((update, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={`Order #${update.orderId}: ${update.status}`}
                secondary={update.reason ? `Reason: ${update.reason}` : null}
              />
            </ListItem>
          ))}
        </List>
        <Button variant="outlined" color="secondary" onClick={() => { setToken(''); setView('login'); }}>Logout</Button>
      </Paper>
    </Box>
  );
}

export default App;
