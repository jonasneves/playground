import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface RegionData {
  organ: string;
  score: number;
  modality: string;
}

interface Scenario {
  title: string;
  description: string;
  regions: RegionData[];
}

const scenarios: Record<string, Scenario> = {
  sepsis: {
    title: "Sepsis - Source Unknown",
    description: "Multi-system evaluation for septic patient with unknown primary source",
    regions: [
      { organ: "lung", score: 9, modality: "CT Chest w/ contrast" },
      { organ: "liver", score: 9, modality: "CT Abdomen/Pelvis w/ contrast" },
      { organ: "heart", score: 6, modality: "CT Head w/o contrast" },
      { organ: "kidney", score: 5, modality: "MRI Spine w/ contrast" }
    ]
  },
  trauma: {
    title: "Polytrauma - MVA",
    description: "Motor vehicle accident with multiple injuries requiring comprehensive imaging",
    regions: [
      { organ: "heart", score: 9, modality: "CT Head w/o contrast" },
      { organ: "lung", score: 9, modality: "CT Chest w/ contrast" },
      { organ: "large-intestine", score: 9, modality: "CT Abdomen/Pelvis w/ contrast" },
      { organ: "kidney", score: 8, modality: "CT C-spine" }
    ]
  },
  cancer: {
    title: "Cancer Staging - Lung CA",
    description: "Initial staging workup for newly diagnosed lung cancer",
    regions: [
      { organ: "lung", score: 9, modality: "CT Chest w/ contrast" },
      { organ: "liver", score: 8, modality: "CT Abdomen w/ contrast" },
      { organ: "heart", score: 7, modality: "MRI Brain w/ contrast" },
      { organ: "small-intestine", score: 6, modality: "PET/CT whole body" }
    ]
  },
  autoimmune: {
    title: "Systemic Lupus - Flare",
    description: "SLE patient with multi-organ involvement during disease flare",
    regions: [
      { organ: "heart", score: 7, modality: "MRI Brain w/o contrast" },
      { organ: "lung", score: 6, modality: "CT Chest High-Res" },
      { organ: "liver", score: 7, modality: "MRI Abdomen w/ contrast" },
      { organ: "spleen", score: 5, modality: "US Pelvis" }
    ]
  },
  metastatic: {
    title: "Metastatic Disease - New Pain",
    description: "Known cancer patient with new multifocal pain concerning for metastases",
    regions: [
      { organ: "heart", score: 8, modality: "MRI Brain w/ contrast" },
      { organ: "lung", score: 7, modality: "CT Chest w/ contrast" },
      { organ: "liver", score: 7, modality: "CT Abdomen w/ contrast" },
      { organ: "kidney", score: 9, modality: "MRI Spine w/ contrast" }
    ]
  }
};

function getScoreColor(score: number): string {
  if (score >= 7) return '#16a34a';
  if (score >= 4) return '#ea580c';
  return '#dc2626';
}

export default function MultiRegionView() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('sepsis');
  const [svgLoaded, setSvgLoaded] = useState(false);

  useEffect(() => {
    fetch('/assets/veins-medical-diagram.svg')
      .then(response => response.text())
      .then(svgText => {
        echarts.registerMap('organ_diagram', { svg: svgText });
        setSvgLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load SVG:', err);
      });
  }, []);

  useEffect(() => {
    if (!chartRef.current || !svgLoaded) return;

    chartInstance.current = echarts.init(chartRef.current);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [svgLoaded]);

  useEffect(() => {
    if (!chartInstance.current || !svgLoaded) return;

    const scenario = scenarios[selectedScenario];

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#e5e5e5',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#171717',
          fontSize: 13
        },
        formatter: (params: any) => {
          return `<div style="font-weight: 500; margin-bottom: 4px;">${params.data.modality}</div>
                  <div style="font-size: 12px; color: #737373;">Score: ${params.data.value}</div>`;
        }
      },
      geo: ({
        map: 'organ_diagram',
        left: '2%',
        right: '55%',
        top: '5%',
        bottom: '5%',
        aspectScale: 0.85,
        roam: false,
        selectedMode: 'multiple',
        emphasis: {
          focus: 'self',
          itemStyle: {
            color: null
          },
          label: {
            position: 'bottom',
            distance: 0,
            textBorderColor: '#fff',
            textBorderWidth: 2
          }
        },
        blur: {},
        select: {
          itemStyle: {
            color: '#b50205'
          },
          label: {
            show: false,
            textBorderColor: '#fff',
            textBorderWidth: 2
          }
        }
      }) as any,
      grid: {
        left: '50%',
        right: '3%',
        top: '8%',
        bottom: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: scenario.regions.map(r => r.organ.charAt(0).toUpperCase() + r.organ.slice(1).replace('-', ' ')),
        axisLabel: {
          fontSize: 13,
          color: '#404040'
        },
        axisLine: {
          lineStyle: {
            color: '#e5e5e5'
          }
        }
      },
      yAxis: {
        type: 'value',
        max: 9,
        axisLabel: {
          fontSize: 12,
          color: '#737373'
        },
        name: 'ACR Score',
        nameTextStyle: {
          fontSize: 13,
          color: '#737373'
        },
        axisLine: {
          lineStyle: {
            color: '#e5e5e5'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f5f5f5'
          }
        }
      },
      series: [{
        type: 'bar',
        data: scenario.regions.map(r => ({
          value: r.score,
          organ: r.organ,
          modality: r.modality,
          itemStyle: {
            color: getScoreColor(r.score)
          }
        })),
        barMaxWidth: 40,
        emphasis: {
          focus: 'self'
        }
      }]
    };

    chartInstance.current.setOption(option);

    chartInstance.current.off('mouseover');
    chartInstance.current.off('mouseout');

    chartInstance.current.on('mouseover', { seriesIndex: 0 }, function(params: any) {
      const organ = params.data.organ;
      if (organ) {
        chartInstance.current?.dispatchAction({
          type: 'highlight',
          geoIndex: 0,
          name: organ
        });
      }
    });

    chartInstance.current.on('mouseout', { seriesIndex: 0 }, function(params: any) {
      const organ = params.data.organ;
      if (organ) {
        chartInstance.current?.dispatchAction({
          type: 'downplay',
          geoIndex: 0,
          name: organ
        });
      }
    });
  }, [selectedScenario, svgLoaded]);

  const scenario = scenarios[selectedScenario];

  return (
    <div className="border border-neutral-200 rounded-lg bg-white">
      <div className="border-b border-neutral-200 p-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Clinical Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="sepsis">Sepsis - Source Unknown</option>
          <option value="trauma">Polytrauma - MVA</option>
          <option value="cancer">Cancer Staging - Lung CA</option>
          <option value="autoimmune">Systemic Lupus - Flare</option>
          <option value="metastatic">Metastatic Disease - New Pain</option>
        </select>
      </div>

      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="font-medium text-neutral-900 text-sm mb-1">{scenario.title}</div>
        <div className="text-xs text-neutral-600">{scenario.description}</div>
      </div>

      <div>
        {svgLoaded ? (
          <div ref={chartRef} style={{ width: '100%', height: '600px' }} />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-sm text-neutral-500">Loading diagram...</div>
          </div>
        )}
      </div>

      <div className="p-4 bg-neutral-50 border-t border-neutral-200">
        <div className="space-y-2">
          {scenario.regions.map((region, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-neutral-200">
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 capitalize">
                  {region.organ.replace('-', ' ')}
                </div>
                <div className="text-xs text-neutral-600">{region.modality}</div>
              </div>
              <div
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: getScoreColor(region.score) }}
              >
                {region.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
