import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import { CloudUpload, Clear, Delete } from '@mui/icons-material';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [chartUrls, setChartUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setFiles(Array.from(selectedFiles));
    
    // Reset the input value to ensure onChange fires even if same file is selected again
    event.target.value = '';
  };

  const handleClearFiles = () => {
    setFiles([]);
    setChartUrls([]);
    setError('');
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const processFiles = async () => {
    if (!files.length) {
      setError('Please select files to process');
      return;
    }

    setUploading(true);
    setError('');
    const processedFiles = [];

    try {
      // Upload and process each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:5000/api/upload', formData);
        processedFiles.push(response.data.json_path);
      }

      // Generate charts from processed files
      const chartResponse = await axios.post('http://localhost:5000/api/generate-charts', {
        files: processedFiles,
        scenarios: files.map(f => f.name.replace(/\.[^/.]+$/, ''))
      });

      setChartUrls(chartResponse.data.chart_urls);
    } catch (err) {
      console.error(err);
      setError('Error processing files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth={false}>
      <Grid container justifyContent="center" sx={{ py: 4 }}>
        <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Excel File Processor
            </Typography>

            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              Upload one or multiple Excel files to generate comparative charts. This feature allows you to visualize and compare multiple processes simultaneously.
            </Alert>

            <input
              accept=".xls,.xlsx"
              style={{ display: 'none' }}
              id="file-upload"
              multiple
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
              >
                Select Excel File(s)
              </Button>
            </label>

            {files.length > 0 && (
              <Box sx={{ width: '100%' }}>
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearFiles}
                    startIcon={<Clear />}
                    sx={{ mr: 2 }}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={processFiles}
                    disabled={uploading || !files.length}
                  >
                    {uploading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Processing...
                      </>
                    ) : (
                      'Process Files'
                    )}
                  </Button>
                </Box>
              </Box>
            )}

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Paper>

        {chartUrls.length > 0 && (
          <Paper sx={{ p: 3, mt: 3, width: '100%' }}>
            <Typography variant="h5" gutterBottom align="center">
              Generated Charts
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {chartUrls.map((url, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={url}
                      alt={`Chart ${index + 1}`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/error-image-placeholder.svg';
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
        </Grid>
      </Grid>
    </Container>
  );
}
