import { useState } from 'react';
import { BarChart3, Activity, Radiation, UserRound, Target, Scale } from 'lucide-react';
import ACRDashboardView from './views/ACRDashboardView';
import MultiRegionView from './views/MultiRegionView';
import RadiationView from './views/RadiationView';
import PatientEducationView from './views/PatientEducationView';
import ProcedurePlanningView from './views/ProcedurePlanningView';
import ComparativeView from './views/ComparativeView';

type TabId = 'acr' | 'multiregion' | 'radiation' | 'patient' | 'procedure' | 'comparative';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'acr',
    label: 'ACR Criteria',
    icon: BarChart3,
    description: 'Evidence-based imaging appropriateness scores'
  },
  {
    id: 'multiregion',
    label: 'Multi-System',
    icon: Activity,
    description: 'Complex presentations requiring multi-organ evaluation'
  },
  {
    id: 'radiation',
    label: 'Radiation Safety',
    icon: Radiation,
    description: 'Dose comparison and ALARA considerations'
  },
  {
    id: 'patient',
    label: 'Patient Education',
    icon: UserRound,
    description: 'Plain-language imaging explanations'
  },
  {
    id: 'procedure',
    label: 'Procedure Planning',
    icon: Target,
    description: 'Interventional approach visualization'
  },
  {
    id: 'comparative',
    label: 'Comparative Analysis',
    icon: Scale,
    description: 'Context-dependent imaging strategies'
  }
];

export default function MedicalViz() {
  const [activeTab, setActiveTab] = useState<TabId>('acr');

  const renderView = () => {
    switch (activeTab) {
      case 'acr':
        return <ACRDashboardView />;
      case 'multiregion':
        return <MultiRegionView />;
      case 'radiation':
        return <RadiationView />;
      case 'patient':
        return <PatientEducationView />;
      case 'procedure':
        return <ProcedurePlanningView />;
      case 'comparative':
        return <ComparativeView />;
      default:
        return <ACRDashboardView />;
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-neutral-700" strokeWidth={2} />
            <h1 className="text-lg font-medium text-neutral-900">Medical Visualization</h1>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                    ${isActive
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTabData && (
          <div className="mb-4">
            <p className="text-sm text-neutral-600">{activeTabData.description}</p>
          </div>
        )}

        {renderView()}
      </div>
    </div>
  );
}
