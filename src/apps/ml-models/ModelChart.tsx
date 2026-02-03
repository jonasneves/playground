import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ModelData } from './types';

interface ModelChartProps {
  models: ModelData[];
  metric: 'params' | 'accuracy' | 'age';
}

export function ModelChart({ models, metric }: ModelChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const getMetricData = () => {
      const currentYear = 2026;
      switch (metric) {
        case 'params':
          return {
            title: 'Model Parameters (Millions)',
            getValue: (m: ModelData) => m.params,
            unit: 'M',
            yAxisMin: 0
          };
        case 'accuracy':
          return {
            title: 'Top-1 Accuracy (%)',
            getValue: (m: ModelData) => m.topAccuracy,
            unit: '%',
            yAxisMin: 50
          };
        case 'age':
          return {
            title: 'Model Age (Years)',
            getValue: (m: ModelData) => currentYear - m.year,
            unit: ' years',
            yAxisMin: 0
          };
      }
    };

    const { title, getValue, unit, yAxisMin } = getMetricData();

    const sortedModels = [...models].sort((a, b) => getValue(b) - getValue(a));
    const sortedData = sortedModels.map(m => getValue(m));
    const sortedNames = sortedModels.map(m => m.name);

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#171717'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const value = params[0].value;
          return `${params[0].name}: ${value}${unit}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedNames,
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: yAxisMin,
        axisLabel: {
          formatter: `{value}${unit}`
        }
      },
      series: [
        {
          data: sortedData,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: '#2563eb'
            }
          }
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [models, metric]);

  return <div ref={chartRef} className="w-full h-80" />;
}
