import {useState, useEffect, useCallback} from 'react';
import {Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, TextField, MenuItem, Select, FormControl, InputLabel, Grid, TablePagination} from '@mui/material';
import adminService from '@/services/adminService';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    method: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchLogs = useCallback(async () => {
    try {
      const params = {
        page: page + 1, // API is 1-indexed
        limit: rowsPerPage,
        ...filters,
      };
      // Clean empty filters
      Object.keys(params).forEach((key) => params[key] === '' && delete params[key]);

      const res = await adminService.getAuditLogs(params);
      setLogs(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Error fetching logs', error);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // Fetch whenever these change

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(0); // Reset to first page on filter change
  };

  const formatAction = (method, url) => {
    if (url.includes('/login')) return 'User Login';
    if (url.includes('/register')) return 'User Registration';
    if (url.includes('/checkins') && method === 'POST') return 'Submit Check-in';
    if (url.includes('/checkins') && method === 'GET') return 'View Check-ins';
    if (url.includes('/toggle-status')) return 'Update User Status';
    if (url.includes('/users') && method === 'GET') return 'View User List';
    if (url.includes('/users') && method === 'DELETE') return 'Delete User';
    if (url.includes('/admin/stats')) return 'View Admin Stats';
    if (url.includes('/admin/audit-logs')) return 'View Audit Logs';

    // Fallback
    const map = {
      'GET': 'View',
      'POST': 'Create',
      'PUT': 'Update',
      'PATCH': 'Update',
      'DELETE': 'Delete',
    };
    return `${map[method] || method} (${url})`;
  };

  return (
    <Container maxWidth="xl" sx={{mt: 4, mb: 4}}>
      <Typography variant="h4" gutterBottom align="center">System Audit Logs</Typography>

      {/* Filters */}
      <Paper elevation={3} sx={{p: 2, mb: 3, borderRadius: 2}}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search (User, IP, URL)"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Action Type</InputLabel>
              <Select
                name="method"
                value={filters.method}
                label="Action Type"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="GET">View (GET)</MenuItem>
                <MenuItem value="POST">Create (POST)</MenuItem>
                <MenuItem value="PUT">Update (PUT)</MenuItem>
                <MenuItem value="PATCH">Update (PATCH)</MenuItem>
                <MenuItem value="DELETE">Delete (DELETE)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{shrink: true}}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{shrink: true}}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{width: '100%', mb: 2, borderRadius: 2}}>
        <TableContainer sx={{maxHeight: '65vh'}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details (JSON)</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.userId ? log.userId.name : (log.userEmail || 'Guest')}
                    <Typography variant="caption" display="block" color="textSecondary">
                      {log.userId ? log.userId.email : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {log.userId ? log.userId.role : '-'}
                  </TableCell>
                  <TableCell>
                    <Box component="span" sx={{
                      fontWeight: 'bold',
                      color: log.method === 'DELETE' ? 'error.main' : log.method === 'POST' ? 'success.main' : 'text.primary',
                    }}>
                      {formatAction(log.method, log.url)}
                    </Box>
                    {log.targetId && (
                      <Typography variant="caption" display="block" color="primary">
                        Target: {log.targetId.name} ({log.targetId.email})
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {log.method} {log.url}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{maxWidth: 300, fontFamily: 'monospace', fontSize: '0.75rem'}}>
                    <Box sx={{maxHeight: 50, overflow: 'auto'}}>
                      {JSON.stringify(log.details)}
                    </Box>
                  </TableCell>
                  <TableCell>{log.ip}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No logs found matching filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default AuditLogsPage;
