import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ModelData } from './types';

interface AccuracyChartProps {
  models: ModelData[];
}

export function AccuracyChart({ models }: AccuracyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const familyColors: Record<string, string> = {
      'CNN': '#ef4444',
      'Residual': '#10b981',
      'Inception': '#3b82f6',
      'Dense': '#8b5cf6',
      'Efficient': '#f59e0b'
    };

    const families = [...new Set(models.map(m => m.family))];

    const option = {
      title: {
        text: 'Model Evolution: Accuracy vs Parameters',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#171717'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const model = models[params.dataIndex];
          return `<strong>${model.name}</strong><br/>Family: ${model.family}<br/>Accuracy: ${model.topAccuracy}%<br/>Parameters: ${model.params}M<br/>Year: ${model.year}`;
        }
      },
      legend: {
        data: families,
        bottom: 10,
        itemGap: 20
      },
      grid: {
        left: 60,
        right: 40,
        top: 60,
        bottom: 80
      },
      xAxis: {
        type: 'log',
        name: 'Parameters (M)',
        nameLocation: 'middle',
        nameGap: 30,
        min: 1,
        max: 200,
        axisLabel: {
          formatter: (value: number) => value >= 100 ? value.toString() : value.toString()
        }
      },
      yAxis: {
        type: 'value',
        name: 'Top-1 Accuracy (%)',
        nameLocation: 'middle',
        nameGap: 40,
        min: 55,
        max: 80
      },
      series: families.map(family => ({
        name: family,
        type: 'scatter',
        symbolSize: 16,
        data: models
          .filter(m => m.family === family)
          .map(m => [m.params, m.topAccuracy]),
        itemStyle: {
          color: familyColors[family],
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            borderColor: '#000',
            borderWidth: 2
          }
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const model = models.find(m =>
              m.params === params.value[0] &&
              m.topAccuracy === params.value[1] &&
              m.family === family
            );
            return model?.name || '';
          },
          position: 'top',
          fontSize: 11,
          color: '#171717',
          distance: 8
        }
      }))
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [models]);

  return <div ref={chartRef} className="w-full h-96" />;
}
