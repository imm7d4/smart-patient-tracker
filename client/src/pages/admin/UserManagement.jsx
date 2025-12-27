import {useState, useEffect} from 'react';
import {Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Switch} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import adminService from '../../services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({open: false, id: null, action: ''});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers();
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmDialog.id) return;
    try {
      const res = await adminService.toggleUserStatus(confirmDialog.id);
      setUsers(users.map((u) => u._id === confirmDialog.id ? res.data.data : u));
      setConfirmDialog({open: false, id: null, action: ''});
    } catch (error) {
      console.error('Error toggling user status', error);
    }
  };

  const openDialog = (user) => {
    const isCurrentlyDeleted = user.isDeleted;
    setConfirmDialog({
      open: true,
      id: user._id,
      action: isCurrentlyDeleted ? 'Activate' : 'Deactivate',
    });
  };

  return (
    <Container maxWidth="lg" sx={{mt: 4}}>
      <Typography variant="h4" gutterBottom align="center">User Management</Typography>
      <TableContainer component={Paper} elevation={3} sx={{mt: 3, borderRadius: 2}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Role</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Joined</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} sx={{bgcolor: user.isDeleted ? 'rgba(0,0,0,0.04)' : 'inherit'}}>
                <TableCell sx={{color: user.isDeleted ? 'text.secondary' : 'text.primary'}}>{user.name}</TableCell>
                <TableCell sx={{color: user.isDeleted ? 'text.secondary' : 'text.primary'}}>{user.email}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.role}
                    color={user.role === 'ADMIN' ? 'error' : user.role === 'DOCTOR' ? 'primary' : 'default'}
                    size="small"
                    variant={user.isDeleted ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.isDeleted ? 'Inactive' : 'Active'}
                    color={user.isDeleted ? 'default' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center" sx={{color: user.isDeleted ? 'text.secondary' : 'text.primary'}}>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  {user.role !== 'ADMIN' && (
                    <Tooltip title={user.isDeleted ? 'Activate User' : 'Deactivate User'}>
                      <IconButton
                        color={user.isDeleted ? 'success' : 'error'}
                        onClick={() => openDialog(user)}
                      >
                        {user.isDeleted ? <RestoreFromTrashIcon /> : <DeleteIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({...confirmDialog, open: false})}>
        <DialogTitle>Confirm {confirmDialog.action}</DialogTitle>
        <DialogContent>
                    Are you sure you want to {confirmDialog.action.toLowerCase()} this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({...confirmDialog, open: false})}>Cancel</Button>
          <Button onClick={handleToggleStatus} color={confirmDialog.action === 'Activate' ? 'success' : 'error'} variant="contained">
            {confirmDialog.action}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
