import React, { useState, useEffect } from 'react';
import { get, del } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    TablePagination,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';

const EventLog = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await get(`/api/customUser/event-logs/?page=${page + 1}&page_size=${rowsPerPage}`);
            if (response.code === 200) {
                setLogs(response.data.results);
                setTotalCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching event logs:', error);
            showToast.error(t('failedToFetchEventLogs'));
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDownload = async () => {
        try {
            const response = await get('/api/customUser/event-logs/download-csv/', {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'event-logs.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast.success(t('eventLogDownloaded'));
        } catch (error) {
            console.error('Error downloading event logs:', error);
            showToast.error(t('failedToDownloadEventLogs'));
        }
    };

    const handleDeleteConfirm = () => {
        setOpenDialog(true);
    };

    const handleDeleteCancel = () => {
        setOpenDialog(false);
    };

    const handleDeleteConfirmed = async () => {
        try {
            await del('/api/customUser/event-logs/clear/');
            showToast.success(t('eventLogsCleared'));
            fetchLogs();
        } catch (error) {
            console.error('Error clearing event logs:', error);
            showToast.error(t('failedToClearEventLogs'));
        } finally {
            setOpenDialog(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8 mt-8">
                <h1 className="text-3xl font-bold text-gray-800 text-center flex-grow">{t('eventLog')}</h1>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
                    onClick={handleDownload}
                >
                    {t('downloadEventLog')}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<TrashIcon className="h-5 w-5" />}
                    onClick={handleDeleteConfirm}
                >
                    {t('deleteEventLog')}
                </Button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <TableContainer>
                    <Table>
                        <TableHead className="bg-gray-50">
                            <TableRow>
                                <TableCell className="font-medium text-gray-500">{t('caseId')}</TableCell>
                                <TableCell className="font-medium text-gray-500">{t('activity')}</TableCell>
                                <TableCell className="font-medium text-gray-500">{t('startTime')}</TableCell>
                                <TableCell className="font-medium text-gray-500">{t('endTime')}</TableCell>
                                <TableCell className="font-medium text-gray-500">{t('userId')}</TableCell>
                                <TableCell className="font-medium text-gray-500">{t('userName')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={`${log.case_id}-${log.start_time}`} className="hover:bg-gray-50">
                                    <TableCell className="text-sm text-gray-900">{log.case_id}</TableCell>
                                    <TableCell className="text-sm text-gray-900">{log.activity}</TableCell>
                                    <TableCell className="text-sm text-gray-900">{new Date(log.start_time).toLocaleString()}</TableCell>
                                    <TableCell className="text-sm text-gray-900">{new Date(log.end_time).toLocaleString()}</TableCell>
                                    <TableCell className="text-sm text-gray-900">{log.user_id || '-'}</TableCell>
                                    <TableCell className="text-sm text-gray-900">{log.user_name || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            <Dialog
                open={openDialog}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{t('confirmDeleteEventLogs')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('deleteEventLogsWarning')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleDeleteConfirmed} color="error" autoFocus>
                        {t('confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EventLog;
