import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface ComparisonData {
  scenario1: {
    title: string;
    description: string;
    imaging: { name: string; score: number }[];
  };
  scenario2: {
    title: string;
    description: string;
    imaging: { name: string; score: number }[];
  };
  rationale: string;
}

const comparisons: Record<string, ComparisonData> = {
  backPain: {
    scenario1: {
      title: "Acute Low Back Pain (<6 weeks)",
      description: "No red flags, mechanical pain",
      imaging: [
        { name: "MRI Spine", score: 3 },
        { name: "CT Spine", score: 2 },
        { name: "X-ray Spine", score: 3 }
      ]
    },
    scenario2: {
      title: "Chronic Low Back Pain (>6 weeks)",
      description: "With radiculopathy, failed conservative therapy",
      imaging: [
        { name: "MRI Spine", score: 8 },
        { name: "CT Myelography", score: 7 },
        { name: "X-ray Spine", score: 5 }
      ]
    },
    rationale: "Acute back pain without red flags typically resolves without imaging. Chronic pain with neurological symptoms requires imaging to guide intervention."
  },
  headache: {
    scenario1: {
      title: "Chronic Migraine",
      description: "Typical pattern, normal neuro exam",
      imaging: [
        { name: "MRI Brain", score: 3 },
        { name: "CT Head", score: 2 },
        { name: "None", score: 7 }
      ]
    },
    scenario2: {
      title: "Sudden Severe Headache",
      description: "Worst headache of life, thunderclap onset",
      imaging: [
        { name: "CT Head", score: 9 },
        { name: "CTA Head", score: 8 },
        { name: "MRI Brain", score: 7 }
      ]
    },
    rationale: "Typical migraines don't require imaging. Thunderclap headache requires urgent imaging to rule out subarachnoid hemorrhage or other life-threatening causes."
  },
  pediatricVsAdult: {
    scenario1: {
      title: "Pediatric Appendicitis",
      description: "Child with RLQ pain, suspected appendicitis",
      imaging: [
        { name: "Ultrasound", score: 9 },
        { name: "MRI Abdomen", score: 7 },
        { name: "CT Abdomen", score: 6 }
      ]
    },
    scenario2: {
      title: "Adult Appendicitis",
      description: "Adult with RLQ pain, suspected appendicitis",
      imaging: [
        { name: "CT Abdomen/Pelvis", score: 9 },
        { name: "Ultrasound", score: 6 },
        { name: "MRI Abdomen", score: 5 }
      ]
    },
    rationale: "Children are more sensitive to radiation and often have less body fat, making ultrasound more effective. Adults benefit from CT's comprehensive evaluation."
  },
  pregnancy: {
    scenario1: {
      title: "Suspected PE - Not Pregnant",
      description: "Female patient, suspected pulmonary embolism",
      imaging: [
        { name: "CTA Chest", score: 9 },
        { name: "V/Q Scan", score: 7 },
        { name: "MRA Chest", score: 4 }
      ]
    },
    scenario2: {
      title: "Suspected PE - Pregnant",
      description: "Pregnant female, suspected pulmonary embolism",
      imaging: [
        { name: "V/Q Scan", score: 8 },
        { name: "CTA Chest", score: 7 },
        { name: "Bilateral LE US", score: 7 }
      ]
    },
    rationale: "Pregnancy requires balancing maternal benefit vs fetal radiation risk. V/Q scan delivers less fetal dose than CTA. Leg ultrasound can confirm DVT without radiation."
  }
};

function getScoreColor(score: number): string {
  if (score >= 7) return '#48bb78';
  if (score >= 4) return '#ed8936';
  return '#f56565';
}

export default function ComparativeView() {
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart1Instance = useRef<echarts.ECharts | null>(null);
  const chart2Instance = useRef<echarts.ECharts | null>(null);
  const [selectedComparison, setSelectedComparison] = useState('backPain');

  useEffect(() => {
    if (chart1Ref.current) {
      chart1Instance.current = echarts.init(chart1Ref.current);
    }
    if (chart2Ref.current) {
      chart2Instance.current = echarts.init(chart2Ref.current);
    }

    const handleResize = () => {
      chart1Instance.current?.resize();
      chart2Instance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart1Instance.current?.dispose();
      chart2Instance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const comparison = comparisons[selectedComparison];

    if (chart1Instance.current) {
      const option: echarts.EChartsOption = {
        title: {
          text: comparison.scenario1.title,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 600,
            color: '#2d3748'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '5%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 9,
          axisLabel: { fontSize: 11 }
        },
        yAxis: {
          type: 'category',
          data: comparison.scenario1.imaging.map(i => i.name),
          axisLabel: { fontSize: 11, color: '#4a5568' }
        },
        series: [{
          type: 'bar',
          data: comparison.scenario1.imaging.map(i => ({
            value: i.score,
            itemStyle: { color: getScoreColor(i.score) }
          })),
          barMaxWidth: 30
        }]
      };
      chart1Instance.current.setOption(option);
    }

    if (chart2Instance.current) {
      const option: echarts.EChartsOption = {
        title: {
          text: comparison.scenario2.title,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 600,
            color: '#2d3748'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '5%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 9,
          axisLabel: { fontSize: 11 }
        },
        yAxis: {
          type: 'category',
          data: comparison.scenario2.imaging.map(i => i.name),
          axisLabel: { fontSize: 11, color: '#4a5568' }
        },
        series: [{
          type: 'bar',
          data: comparison.scenario2.imaging.map(i => ({
            value: i.score,
            itemStyle: { color: getScoreColor(i.score) }
          })),
          barMaxWidth: 30
        }]
      };
      chart2Instance.current.setOption(option);
    }
  }, [selectedComparison]);

  const comparison = comparisons[selectedComparison];

  return (
    <div className="">

      <div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Comparison:
          </label>
          <select
            value={selectedComparison}
            onChange={(e) => setSelectedComparison(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="backPain">Acute vs Chronic Back Pain</option>
            <option value="headache">Typical Migraine vs Thunderclap Headache</option>
            <option value="pediatricVsAdult">Pediatric vs Adult Appendicitis</option>
            <option value="pregnancy">PE Workup: Pregnant vs Not Pregnant</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
            <div className="p-6">
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-neutral-900 mb-1">{comparison.scenario1.title}</h3>
                <p className="text-sm text-neutral-700">{comparison.scenario1.description}</p>
              </div>
              <div ref={chart1Ref} style={{ width: '100%', height: '300px' }} />
            </div>

            <div className="p-6">
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-neutral-900 mb-1">{comparison.scenario2.title}</h3>
                <p className="text-sm text-neutral-700">{comparison.scenario2.description}</p>
              </div>
              <div ref={chart2Ref} style={{ width: '100%', height: '300px' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">Clinical Rationale</h3>
          <p className="text-neutral-700 leading-relaxed">{comparison.rationale}</p>

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border-l-4 border-neutral-200">
            <div className="font-semibold text-neutral-900 mb-2">Teaching Point</div>
            <div className="text-sm text-neutral-700">
              Context matters in imaging selection. Patient age, pregnancy status, symptom duration, and clinical
              presentation all influence appropriateness of different imaging modalities.
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 p-4 bg-white rounded-lg border border-neutral-200 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#48bb78' }} />
            <span className="text-sm text-neutral-700">Usually Appropriate (7-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ed8936' }} />
            <span className="text-sm text-neutral-700">May Be Appropriate (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#f56565' }} />
            <span className="text-sm text-neutral-700">Usually Not Appropriate (1-3)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
