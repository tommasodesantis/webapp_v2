import { Box, Slider, Select, MenuItem, TextField, Typography } from '@mui/material';
import { VerticalAlignmentType } from 'recharts/types/component/DefaultLegendContent';

interface ChartConfig {
  fillColor: string;
  barWidth: number;
  opacity: number;
  legendPosition: VerticalAlignmentType;
  fontFamily: string;
  fontSize: number;
}

interface ChartStyleControlsProps {
  chartConfig: ChartConfig;
  setChartConfig: (config: ChartConfig) => void;
}

export default function ChartStyleControls({ chartConfig, setChartConfig }: ChartStyleControlsProps) {
  const handleConfigChange = <K extends keyof ChartConfig>(key: K, value: ChartConfig[K]) => {
    setChartConfig({ ...chartConfig, [key]: value });
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Chart Customization</Typography>
      
      {/* Color Control */}
      <Box>
        <Typography gutterBottom>Fill Color</Typography>
        <input
          type="color"
          value={chartConfig.fillColor}
          onChange={(e) => handleConfigChange('fillColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </Box>

      {/* Bar Width Control */}
      <Box>
        <Typography gutterBottom>Bar Width</Typography>
        <Slider
          value={chartConfig.barWidth}
          onChange={(_, value) => handleConfigChange('barWidth', value as number)}
          min={1}
          max={50}
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Opacity Control */}
      <Box>
        <Typography gutterBottom>Opacity</Typography>
        <Slider
          value={chartConfig.opacity}
          onChange={(_, value) => handleConfigChange('opacity', value as number)}
          min={0}
          max={1}
          step={0.1}
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Legend Position Control */}
      <Box>
        <Typography gutterBottom>Legend Position</Typography>
        <Select
          fullWidth
          value={chartConfig.legendPosition}
          onChange={(e) => handleConfigChange('legendPosition', e.target.value as VerticalAlignmentType)}
        >
          <MenuItem value="top">Top</MenuItem>
          <MenuItem value="bottom">Bottom</MenuItem>
        </Select>
      </Box>

      {/* Font Family Control */}
      <Box>
        <Typography gutterBottom>Font Family</Typography>
        <Select
          fullWidth
          value={chartConfig.fontFamily}
          onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
        >
          <MenuItem value="Arial">Arial</MenuItem>
          <MenuItem value="Helvetica">Helvetica</MenuItem>
          <MenuItem value="Times New Roman">Times New Roman</MenuItem>
          <MenuItem value="sans-serif">Sans-serif</MenuItem>
        </Select>
      </Box>

      {/* Font Size Control */}
      <Box>
        <Typography gutterBottom>Font Size</Typography>
        <Slider
          value={chartConfig.fontSize}
          onChange={(_, value) => handleConfigChange('fontSize', value as number)}
          min={8}
          max={24}
          step={1}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
}
