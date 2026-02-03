import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface ImagingData {
  name: string;
  score: number;
  organ: string;
}

interface Scenario {
  title: string;
  data: ImagingData[];
}

const scenarios: Record<string, Scenario> = {
  pe: {
    title: "Suspected Pulmonary Embolism",
    data: [
      { name: "CTA Chest", score: 9, organ: "lung" },
      { name: "V/Q Scan", score: 7, organ: "lung" },
      { name: "D-dimer + CTA", score: 8, organ: "lung" },
      { name: "Chest X-ray", score: 3, organ: "lung" },
      { name: "MRA Chest", score: 4, organ: "lung" }
    ]
  },
  chestPain: {
    title: "Acute Chest Pain - Suspected ACS",
    data: [
      { name: "Coronary CTA", score: 8, organ: "heart" },
      { name: "Stress Echo", score: 7, organ: "heart" },
      { name: "Nuclear Stress", score: 7, organ: "heart" },
      { name: "Chest X-ray", score: 6, organ: "heart" },
      { name: "Cardiac MRI", score: 5, organ: "heart" }
    ]
  },
  headache: {
    title: "Headache - Acute, Severe",
    data: [
      { name: "CT Head w/o contrast", score: 9, organ: "heart" },
      { name: "MRI Brain w/o contrast", score: 7, organ: "heart" },
      { name: "CTA Head/Neck", score: 6, organ: "heart" },
      { name: "MRA Head", score: 6, organ: "heart" },
      { name: "Skull X-ray", score: 1, organ: "heart" }
    ]
  },
  backPain: {
    title: "Low Back Pain - Acute (<6 weeks)",
    data: [
      { name: "MRI Lumbar Spine", score: 3, organ: "kidney" },
      { name: "CT Lumbar Spine", score: 2, organ: "kidney" },
      { name: "X-ray Lumbar Spine", score: 3, organ: "kidney" },
      { name: "Bone Scan", score: 1, organ: "kidney" }
    ]
  },
  abdominalPain: {
    title: "RUQ Pain - Suspected Cholecystitis",
    data: [
      { name: "US Abdomen", score: 9, organ: "liver" },
      { name: "HIDA Scan", score: 7, organ: "liver" },
      { name: "CT Abdomen w/ contrast", score: 6, organ: "liver" },
      { name: "MRI Abdomen", score: 5, organ: "liver" },
      { name: "X-ray Abdomen", score: 2, organ: "spleen" }
    ]
  },
  trauma: {
    title: "Blunt Trauma - Polytrauma",
    data: [
      { name: "CT Head w/o contrast", score: 9, organ: "heart" },
      { name: "CT Chest w/ contrast", score: 9, organ: "lung" },
      { name: "CT Abdomen/Pelvis", score: 9, organ: "large-intestine" },
      { name: "CT C-spine", score: 8, organ: "kidney" },
      { name: "FAST Ultrasound", score: 7, organ: "liver" }
    ]
  }
};

function getScoreColor(score: number): string {
  if (score >= 7) return '#16a34a';
  if (score >= 4) return '#ea580c';
  return '#dc2626';
}

export default function ACRDashboardView() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('pe');
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
          const score = data.value;
          let category = '';
          if (score >= 7) category = 'Usually Appropriate';
          else if (score >= 4) category = 'May Be Appropriate';
          else category = 'Usually Not Appropriate';

          return `<div style="font-weight: 500; margin-bottom: 4px;">${data.name}</div>
                  <div style="font-size: 12px; color: #737373;">Score: ${score} · ${category}</div>`;
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
        type: 'value',
        max: 9,
        axisLabel: {
          fontSize: 12,
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
      yAxis: {
        type: 'category',
        data: scenario.data.map(d => d.name),
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
      series: [{
        type: 'bar',
        data: scenario.data.map(d => ({
          value: d.score,
          itemStyle: {
            color: getScoreColor(d.score)
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
          <option value="pe">Suspected Pulmonary Embolism</option>
          <option value="chestPain">Acute Chest Pain - Suspected ACS</option>
          <option value="headache">Headache - Acute, Severe</option>
          <option value="backPain">Low Back Pain - Acute (&lt;6 weeks)</option>
          <option value="abdominalPain">Abdominal Pain - RUQ</option>
          <option value="trauma">Blunt Trauma - Polytrauma</option>
        </select>
      </div>

      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="font-medium text-neutral-900 text-sm mb-1">{scenarios[selectedScenario].title}</div>
        <div className="text-xs text-neutral-600">Hover over imaging modalities to highlight anatomy</div>
      </div>

      <div>
        {svgLoaded ? (
          <div ref={chartRef} style={{ width: '100%', height: '650px' }} />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-sm text-neutral-500">Loading diagram...</div>
          </div>
        )}
      </div>

      <div className="p-4 bg-neutral-50 border-t border-neutral-200">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-600" />
            <span className="text-neutral-600">Usually Appropriate (7-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-600" />
            <span className="text-neutral-600">May Be Appropriate (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-600" />
            <span className="text-neutral-600">Usually Not Appropriate (1-3)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
