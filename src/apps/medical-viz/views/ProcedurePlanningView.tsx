import { useState } from 'react';

interface Procedure {
  name: string;
  indication: string;
  target: string;
  approach: string;
  guidance: string;
  risks: string[];
  prepSteps: string[];
}

const procedures: Record<string, Procedure> = {
  liverBiopsy: {
    name: "Liver Biopsy",
    indication: "Evaluate liver mass seen on CT",
    target: "Right lobe liver mass, 3cm from capsule",
    approach: "Right lateral approach through intercostal space",
    guidance: "CT fluoroscopy for real-time needle tracking",
    risks: ["Bleeding", "Pneumothorax", "Pain"],
    prepSteps: [
      "NPO 8 hours",
      "Check INR/platelets",
      "Consent signed",
      "IV access established"
    ]
  },
  thyroidBiopsy: {
    name: "Thyroid Nodule Biopsy",
    indication: "4cm thyroid nodule, suspicious features",
    target: "Right thyroid lobe, posterior nodule",
    approach: "Anterior neck approach between carotid and trachea",
    guidance: "Ultrasound guidance",
    risks: ["Hematoma", "Nerve injury", "Infection"],
    prepSteps: [
      "Patient supine, neck extended",
      "Ultrasound survey",
      "Mark entry site",
      "Local anesthesia"
    ]
  },
  kidneyBiopsy: {
    name: "Native Kidney Biopsy",
    indication: "Acute kidney injury, unclear etiology",
    target: "Lower pole of left kidney (safer approach)",
    approach: "Posterior approach, patient prone, avoid renal vessels",
    guidance: "Ultrasound with color Doppler",
    risks: ["Bleeding", "Hematoma", "AV fistula"],
    prepSteps: [
      "Type and screen",
      "BP controlled",
      "Patient prone",
      "Pre-procedure ultrasound"
    ]
  },
  lungBiopsy: {
    name: "Lung Nodule Biopsy",
    indication: "Spiculated 2cm RUL nodule",
    target: "Right upper lobe, peripheral nodule",
    approach: "Lateral chest wall, shortest distance, avoid fissures",
    guidance: "CT guidance with coaxial technique",
    risks: ["Pneumothorax", "Bleeding", "Air embolism"],
    prepSteps: [
      "Chest CT for planning",
      "Patient positioning (lesion dependent)",
      "Breath-hold instructions",
      "Fluoroscopy available"
    ]
  }
};

export default function ProcedurePlanningView() {
  const [selectedProcedure, setSelectedProcedure] = useState('liverBiopsy');

  const procedure = procedures[selectedProcedure];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select Procedure
        </label>
        <select
          value={selectedProcedure}
          onChange={(e) => setSelectedProcedure(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="liverBiopsy">Liver Biopsy</option>
          <option value="thyroidBiopsy">Thyroid Biopsy</option>
          <option value="kidneyBiopsy">Kidney Biopsy</option>
          <option value="lungBiopsy">Lung Biopsy</option>
        </select>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">{procedure.name}</h3>
          <p className="text-sm text-neutral-600 mt-1"><span className="font-medium">Indication:</span> {procedure.indication}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs font-medium text-neutral-700 mb-1">Target</div>
              <div className="text-sm text-neutral-900">{procedure.target}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs font-medium text-neutral-700 mb-1">Guidance</div>
              <div className="text-sm text-neutral-900">{procedure.guidance}</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Approach</h4>
            <p className="text-sm text-neutral-700 leading-relaxed">{procedure.approach}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Preparation Steps</h4>
            <div className="space-y-2">
              {procedure.prepSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {idx + 1}
                  </div>
                  <div className="text-sm text-neutral-700">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Potential Risks</h4>
            <ul className="space-y-1">
              {procedure.risks.map((risk, idx) => (
                <li key={idx} className="text-sm text-neutral-700 flex items-center gap-2">
                  <span className="text-red-600">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
