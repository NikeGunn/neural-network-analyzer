import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { InputData } from '../types/neural-network';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataVisualizerProps {
  data: InputData[];
}

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ data }) => {
  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
    datasets: data[0]?.values.map((_, valueIndex) => ({
      label: `Input ${valueIndex + 1}`,
      data: data.map(d => d.values[valueIndex]),
      borderColor: `hsl(${valueIndex * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${valueIndex * 60}, 70%, 50%, 0.1)`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: `hsl(${valueIndex * 60}, 70%, 50%)`,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: `hsl(${valueIndex * 60}, 70%, 50%)`,
      pointHoverBorderWidth: 2,
    })) || []
  }), [data]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: '500' as const,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Neural Network Input Patterns',
        font: {
          size: 16,
          weight: '600' as const,
        },
        padding: { bottom: 30 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: '600' as const,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y.toFixed(3);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  const calculateStats = () => {
    const stats = data[0]?.values.map((_, index) => {
      const values = data.map(d => d.values[index]);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
      );
      return { avg, min, max, stdDev };
    });
    return stats;
  };

  const generateSummary = () => {
    const summaries = stats.map((stat, index) => {
      const isLowVariation = stat.stdDev < 1;
      return `
      Input ${index + 1}:
      - The average is like the "middle value" (${stat.avg.toFixed(2)}), helping us see what most numbers look like.
      - The standard deviation is ${stat.stdDev.toFixed(2)}. ${
        isLowVariation
          ? "This means the numbers are close to each other, like classmates in a group photo."
          : "This means the numbers are spread out, like students running across a playground."
      }
      - The range (${stat.min.toFixed(2)} to ${stat.max.toFixed(2)}) shows the smallest and largest values.
      `;
    });
    return summaries;
  };

  const stats = calculateStats();
  const summaries = generateSummary();

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg">
        <Line data={chartData} options={options} className="min-h-[400px]" />
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-6 text-white/90">Analysis Results</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {stats?.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
            >
              <h4 className="font-medium mb-3 text-white/90">Input {index + 1} Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Average:</span>
                  <span className="font-mono text-white/90">{stat.avg.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Std Deviation:</span>
                  <span className="font-mono text-white/90">{stat.stdDev.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Range:</span>
                  <span className="font-mono text-white/90">
                    [{stat.min.toFixed(3)}, {stat.max.toFixed(3)}]
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Super Smart and Kid-Friendly Summary */}
        <div className="mt-6 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
          <h4 className="font-medium mb-3 text-white/90">Summary</h4>
          <div className="space-y-4 text-sm">
            {summaries.map((summary, index) => (
              <p key={index} className="text-white/70">{summary}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
