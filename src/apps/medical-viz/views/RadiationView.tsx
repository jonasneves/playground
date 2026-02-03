import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface RadiationData {
  modality: string;
  dose: number;
  organ: string;
}

interface ComparisonScenario {
  title: string;
  description: string;
  data: RadiationData[];
}

const scenarios: Record<string, ComparisonScenario> = {
  chestImaging: {
    title: "Chest Imaging Options",
    description: "Compare radiation exposure for different chest imaging modalities",
    data: [
      { modality: "Chest X-ray", dose: 0.1, organ: "lung" },
      { modality: "CT Chest (Low Dose)", dose: 1.5, organ: "lung" },
      { modality: "CT Chest (Standard)", dose: 7, organ: "lung" },
      { modality: "CT Pulmonary Angio", dose: 15, organ: "lung" },
      { modality: "MRI Chest", dose: 0, organ: "lung" }
    ]
  },
  abdominalImaging: {
    title: "Abdominal Imaging Options",
    description: "Radiation exposure comparison for abdominal studies",
    data: [
      { modality: "Abdominal X-ray", dose: 0.7, organ: "liver" },
      { modality: "CT Abdomen/Pelvis", dose: 10, organ: "liver" },
      { modality: "CT Abdomen (Low Dose)", dose: 5, organ: "liver" },
      { modality: "Ultrasound Abdomen", dose: 0, organ: "liver" },
      { modality: "MRI Abdomen", dose: 0, organ: "liver" }
    ]
  },
  cardiac: {
    title: "Cardiac Imaging Options",
    description: "Compare radiation doses for cardiac imaging",
    data: [
      { modality: "Chest X-ray", dose: 0.1, organ: "heart" },
      { modality: "Coronary CTA", dose: 12, organ: "heart" },
      { modality: "Nuclear Stress Test", dose: 9, organ: "heart" },
      { modality: "Cardiac MRI", dose: 0, organ: "heart" },
      { modality: "Echo (Ultrasound)", dose: 0, organ: "heart" }
    ]
  },
  pediatric: {
    title: "Pediatric Considerations",
    description: "Lower radiation protocols for children (chest imaging example)",
    data: [
      { modality: "Pediatric Chest X-ray", dose: 0.02, organ: "lung" },
      { modality: "Pediatric CT Chest", dose: 2, organ: "lung" },
      { modality: "Adult CT Chest", dose: 7, organ: "lung" },
      { modality: "Ultrasound", dose: 0, organ: "lung" },
      { modality: "MRI", dose: 0, organ: "lung" }
    ]
  }
};

function getDoseColor(dose: number): string {
  if (dose === 0) return '#16a34a';
  if (dose < 3) return '#65a30d';
  if (dose < 10) return '#ea580c';
  return '#dc2626';
}

export default function RadiationView() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('chestImaging');
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
    const maxDose = Math.max(...scenario.data.map(d => d.dose));

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#e5e5e5',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#171717',
          fontSize: 13
        },
        formatter: (params: any) => {
          const data = params[0];
          const dose = data.value;
          let risk = '';
          if (dose === 0) risk = 'No radiation';
          else if (dose < 3) risk = 'Low dose';
          else if (dose < 10) risk = 'Moderate dose';
          else risk = 'Higher dose';

          return `<div style="font-weight: 500; margin-bottom: 4px;">${data.name}</div>
                  <div style="font-size: 12px; color: #737373;">Dose: ${dose} mSv · ${risk}</div>`;
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
            color: '#dc2626'
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
        type: 'value',
        max: Math.max(maxDose * 1.1, 1),
        axisLabel: {
          fontSize: 12,
          color: '#737373',
          formatter: '{value} mSv'
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
      yAxis: {
        type: 'category',
        data: scenario.data.map(d => d.modality),
        axisLabel: {
          fontSize: 12,
          color: '#404040'
        },
        axisLine: {
          lineStyle: {
            color: '#e5e5e5'
          }
        }
      },
      series: [{
        type: 'bar',
        data: scenario.data.map(d => ({
          value: d.dose,
          itemStyle: {
            color: getDoseColor(d.dose)
          },
          organ: d.organ
        })),
        barMaxWidth: 32,
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
          Imaging Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="chestImaging">Chest Imaging Options</option>
          <option value="abdominalImaging">Abdominal Imaging Options</option>
          <option value="cardiac">Cardiac Imaging Options</option>
          <option value="pediatric">Pediatric Considerations</option>
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
        <div className="flex items-center gap-6 text-xs mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-600" />
            <span className="text-neutral-600">No radiation (0 mSv)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-lime-600" />
            <span className="text-neutral-600">Low (&lt;3 mSv)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-600" />
            <span className="text-neutral-600">Moderate (3-10 mSv)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-600" />
            <span className="text-neutral-600">Higher (&gt;10 mSv)</span>
          </div>
        </div>
        <div className="text-xs text-neutral-600 space-y-1">
          <div>• Average natural background: ~3 mSv/year</div>
          <div>• Transcontinental flight: ~0.03 mSv</div>
          <div>• ALARA principle: As Low As Reasonably Achievable</div>
          {selectedScenario === 'pediatric' && (
            <div className="mt-2 pt-2 border-t border-neutral-200 font-medium text-red-700">
              ⚠️ Children are more sensitive to radiation - use lowest dose protocols
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
