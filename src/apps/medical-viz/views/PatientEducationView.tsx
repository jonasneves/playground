import { useState } from 'react';

interface ImagingPlan {
  title: string;
  patientComplaint: string;
  explanation: string;
  modality: string;
  duration: string;
  preparation: string;
  whatToExpect: string;
}

const imagingPlans: Record<string, ImagingPlan> = {
  chestPain: {
    title: "Chest Pain Evaluation",
    patientComplaint: "You mentioned chest pain and shortness of breath",
    explanation: "We need to check your heart arteries for blockages and make sure there are no blood clots in your lungs.",
    modality: "CT Scan with Contrast",
    duration: "10-15 minutes",
    preparation: "No food 4 hours before. We'll give you an IV for contrast dye.",
    whatToExpect: "You'll lie on a table that slides through a donut-shaped machine. It's painless and quick."
  },
  headache: {
    title: "Severe Headache Workup",
    patientComplaint: "You have a severe headache that came on suddenly",
    explanation: "We need to check for bleeding, stroke, or other causes of your headache by looking at your brain tissue and blood vessels.",
    modality: "CT Scan of Head",
    duration: "5 minutes",
    preparation: "No preparation needed",
    whatToExpect: "Quick scan while you lie still. No needles unless we need contrast later."
  },
  abdominalPain: {
    title: "Abdominal Pain Assessment",
    patientComplaint: "You have pain in the upper right side of your belly",
    explanation: "We're checking your gallbladder for stones and making sure your liver is healthy.",
    modality: "Ultrasound",
    duration: "20-30 minutes",
    preparation: "No food for 6 hours before (so we can see the gallbladder better)",
    whatToExpect: "Warm gel on your belly. Technician moves a wand over your skin. No radiation."
  },
  backPain: {
    title: "Back Pain Evaluation",
    patientComplaint: "You have severe back pain with numbness in your leg",
    explanation: "We need to see if a disc is pressing on your nerves by looking at your spinal bones, discs, and nerve roots.",
    modality: "MRI of Spine",
    duration: "30-45 minutes",
    preparation: "Remove all metal objects. Tell us if you have any implants.",
    whatToExpect: "You'll hear loud knocking sounds. We'll give you earplugs. No radiation used."
  }
};

export default function PatientEducationView() {
  const [selectedPlan, setSelectedPlan] = useState('chestPain');

  const plan = imagingPlans[selectedPlan];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select patient scenario
        </label>
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="chestPain">Chest Pain</option>
          <option value="headache">Severe Headache</option>
          <option value="abdominalPain">Abdominal Pain</option>
          <option value="backPain">Back Pain with Numbness</option>
        </select>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">{plan.title}</h3>
          <p className="text-sm text-neutral-600 mt-1">{plan.patientComplaint}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Why We Need This Test</h4>
            <p className="text-sm text-neutral-700 leading-relaxed">{plan.explanation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs font-medium text-neutral-700 mb-1">Type of Scan</div>
              <div className="text-sm text-neutral-900">{plan.modality}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs font-medium text-neutral-700 mb-1">How Long</div>
              <div className="text-sm text-neutral-900">{plan.duration}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs font-medium text-neutral-700 mb-1">Preparation</div>
              <div className="text-sm text-neutral-900">{plan.preparation}</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">What to Expect</h4>
            <p className="text-sm text-neutral-700 leading-relaxed">{plan.whatToExpect}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Questions?</h4>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Feel free to ask your doctor or the imaging staff any questions before your scan.
              There are no silly questions - we want you to feel comfortable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
