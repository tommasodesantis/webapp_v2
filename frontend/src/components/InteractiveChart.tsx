import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { VerticalAlignmentType } from 'recharts/types/component/DefaultLegendContent';

interface ChartConfig {
  fillColor: string;
  barWidth: number;
  opacity: number;
  legendPosition: VerticalAlignmentType;
  fontFamily: string;
  fontSize: number;
}

interface ChartData {
  category: string;
  value: number;
}

interface InteractiveChartProps {
  data: ChartData[];
  config: ChartConfig;
}

export default function InteractiveChart({ data, config }: InteractiveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="category"
          style={{
            fontFamily: config.fontFamily,
            fontSize: config.fontSize
          }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          style={{
            fontFamily: config.fontFamily,
            fontSize: config.fontSize
          }}
          label={{ 
            value: 'Annual Cost',
            angle: -90,
            position: 'insideLeft',
            style: {
              fontFamily: config.fontFamily,
              fontSize: config.fontSize
            }
          }}
        />
        <Tooltip 
          contentStyle={{
            fontFamily: config.fontFamily,
            fontSize: config.fontSize
          }}
          formatter={(value: number) => [`${value.toLocaleString()} €`, 'Cost']}
        />
        <Legend 
          verticalAlign={config.legendPosition}
          wrapperStyle={{
            fontFamily: config.fontFamily,
            fontSize: config.fontSize
          }}
        />
        <Bar 
          name="Annual Cost"
          dataKey="value"
          fill={config.fillColor}
          fillOpacity={config.opacity}
          barSize={config.barWidth}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
