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
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [charts, setCharts] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setFiles(Array.from(selectedFiles));
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

      setCharts(chartResponse.data.chart_paths);
    } catch (err) {
      console.error(err);
      setError('Error processing files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Paper sx={{ p: 3 }}>
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
                Select Excel Files
              </Button>
            </label>

            {files.length > 0 && (
              <Typography align="center">
                Selected files: {files.map(f => f.name).join(', ')}
              </Typography>
            )}

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

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Paper>

        {charts.length > 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom align="center">
              Generated Charts
            </Typography>
            <Grid container spacing={3}>
              {charts.map((chart, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={`http://localhost:5000/charts/${chart.split('/').pop()}`}
                      alt={`Chart ${index + 1}`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
}