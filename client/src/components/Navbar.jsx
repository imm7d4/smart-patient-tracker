import { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import { USER_ROLES } from '@/constants';

const Navbar = () => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Smart Recovery
        </Typography>
        <Box>
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          ) : (
            <>
              {/* Common Links */}
              {user.role !== USER_ROLES.ADMIN && (
                <Button color="inherit" component={Link} to="/">Dashboard</Button>
              )}

              {/* Doctor Links */}
              {user.role === USER_ROLES.DOCTOR && (
                <Button color="inherit" component={Link} to="/doctor/create-treatment">New Plan</Button>
              )}
              {user.role === USER_ROLES.DOCTOR && (
                <Button color="inherit" component={Link} to="/doctor/alerts">Alerts</Button>
              )}
              {user.role === USER_ROLES.DOCTOR && (
                <Button color="inherit" component={Link} to="/chat">Messages</Button>
              )}

              {/* Patient Links */}
              {user.role === USER_ROLES.PATIENT && (
                <>
                  <Button color="inherit" component={Link} to="/patient/checkin">Daily Check-In</Button>
                  <Button color="inherit" component={Link} to="/patient/profile">My Profile</Button>
                  <Button color="inherit" component={Link} to="/chat">Messages</Button>
                </>
              )}

              {/* Admin Links */}
              {user.role === USER_ROLES.ADMIN && (
                <Button color="inherit" component={Link} to="/admin/dashboard">Admin Dashboard</Button>
              )}

              <Button color="inherit" onClick={handleLogoutClick} sx={{ ml: 2, border: '1px solid rgba(255,255,255,0.3)' }}>
                Logout ({user.name})
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;

