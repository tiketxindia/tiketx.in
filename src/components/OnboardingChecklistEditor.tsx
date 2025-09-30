import React, { useState, useEffect } from "react";

export type OnboardingChecklistEditorProps = {
  steps: string[];
  onChange: (steps: string[]) => void;
};

const OnboardingChecklistEditor: React.FC<OnboardingChecklistEditorProps> = ({ steps, onChange }) => {
  const [localSteps, setLocalSteps] = useState<string[]>(steps || []);

  useEffect(() => {
    setLocalSteps(steps || []);
  }, [steps]);

  const handleStepChange = (idx: number, value: string) => {
    const updated = [...localSteps];
    updated[idx] = value;
    setLocalSteps(updated);
    onChange(updated);
  };
  const handleAddStep = () => {
    const updated = [...localSteps, ""];
    setLocalSteps(updated);
    onChange(updated);
  };
  const handleDeleteStep = (idx: number) => {
    const updated = localSteps.filter((_, i) => i !== idx);
    setLocalSteps(updated);
    onChange(updated);
  };
  const handleMoveStep = (from: number, to: number) => {
    if (to < 0 || to >= localSteps.length) return;
    const updated = [...localSteps];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setLocalSteps(updated);
    onChange(updated);
  };
  return (
    <div className="space-y-4">
      {localSteps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded-xl bg-black/60 border border-tiketx-blue/30 text-white p-3 text-lg tracking-wide"
            value={step}
            onChange={e => handleStepChange(idx, e.target.value)}
            placeholder={`Step ${idx + 1}`}
          />
          <button className="px-2 py-1 rounded bg-red-500 text-white font-bold" onClick={() => handleDeleteStep(idx)} title="Delete step">✕</button>
          <button className="px-2 py-1 rounded bg-gray-700 text-white font-bold" onClick={() => handleMoveStep(idx, idx - 1)} disabled={idx === 0} title="Move up">↑</button>
          <button className="px-2 py-1 rounded bg-gray-700 text-white font-bold" onClick={() => handleMoveStep(idx, idx + 1)} disabled={idx === localSteps.length - 1} title="Move down">↓</button>
        </div>
      ))}
      <button className="mt-2 px-4 py-2 rounded-xl bg-tiketx-blue text-white font-bold shadow hover:bg-tiketx-violet transition" onClick={handleAddStep}>Add Step</button>
    </div>
  );
};

export default OnboardingChecklistEditor;
