import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { PatientWorkspace } from './components/PatientWorkspace';
import { NailScanModal } from './components/NailScanModal';
import { AddReadingModal } from './components/AddReadingModal';
import { BiochemicalRationaleModal } from './components/BiochemicalRationaleModal';
import { GanzoniReferralModal } from './components/GanzoniReferralModal';
import { FullCohortModal } from './components/FullCohortModal';
import { ProgramBriefModal } from './components/ProgramBriefModal';
import { PATIENTS } from './data/patients';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'doctor', 'patient'
  const [doctorTab, setDoctorTab] = useState('patient_care'); // 'patient_care', 'program_view'
  const [selectedPatientId, setSelectedPatientId] = useState('AMB-2048');

  // Modals state
  const [nailScanOpen, setNailScanOpen] = useState(false);
  const [addReadingOpen, setAddReadingOpen] = useState(false);
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referralParams, setReferralParams] = useState({ weight: 55, deficit: 1028 });
  const [fullCohortOpen, setFullCohortOpen] = useState(false);
  const [programBriefOpen, setProgramBriefOpen] = useState(false);
  const [briefParams, setBriefParams] = useState({ cohortSize: 100000, totalSavingsCr: "19.6", nonResponders: 27200 });

  const currentPatient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  const handleOpenReferral = (weight, deficit) => {
    setReferralParams({ weight, deficit });
    setReferralOpen(true);
  };

  const handleOpenProgramBrief = (cohortSize, totalSavingsCr, nonResponders) => {
    setBriefParams({ cohortSize, totalSavingsCr, nonResponders });
    setProgramBriefOpen(true);
  };

  const handleReadingApplied = (reading) => {
    // Update local patient vitals if needed
    if (reading.hb) {
      currentPatient.vitals.hemoglobin.value = reading.hb.toString();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#241714]">
      {view === 'landing' && (
        <LandingPage
          onOpenDoctor={() => {
            setView('doctor');
            setDoctorTab('patient_care');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPatient={() => {
            setView('patient');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {view === 'doctor' && (
        <DoctorWorkspace
          activeTab={doctorTab}
          setActiveTab={setDoctorTab}
          selectedPatientId={selectedPatientId}
          setSelectedPatientId={setSelectedPatientId}
          onExitPortal={() => setView('landing')}
          onOpenNailScan={() => setNailScanOpen(true)}
          onOpenAddReading={() => setAddReadingOpen(true)}
          onOpenRationale={() => setRationaleOpen(true)}
          onOpenReferral={handleOpenReferral}
          onOpenFullCohort={() => setFullCohortOpen(true)}
          onOpenProgramBrief={handleOpenProgramBrief}
        />
      )}

      {view === 'patient' && (
        <PatientWorkspace
          onExitPortal={() => setView('landing')}
        />
      )}

      {/* Global Modals */}
      <NailScanModal
        isOpen={nailScanOpen}
        onClose={() => setNailScanOpen(false)}
        onReadingApplied={handleReadingApplied}
        patientName={currentPatient.name}
      />

      <AddReadingModal
        isOpen={addReadingOpen}
        onClose={() => setAddReadingOpen(false)}
        onAddReading={(newReadings) => {
          if (newReadings.hb) currentPatient.vitals.hemoglobin.value = newReadings.hb.toString();
          if (newReadings.hr) currentPatient.vitals.heartRate.value = newReadings.hr.toString();
          if (newReadings.steps) currentPatient.vitals.activity.value = newReadings.steps.toLocaleString();
        }}
        patient={currentPatient}
      />

      <BiochemicalRationaleModal
        isOpen={rationaleOpen}
        onClose={() => setRationaleOpen(false)}
        patient={currentPatient}
      />

      <GanzoniReferralModal
        isOpen={referralOpen}
        onClose={() => setReferralOpen(false)}
        patient={currentPatient}
        weight={referralParams.weight}
        ironDeficit={referralParams.deficit}
      />

      <FullCohortModal
        isOpen={fullCohortOpen}
        onClose={() => setFullCohortOpen(false)}
        onSelectPatient={(id) => setSelectedPatientId(id)}
      />

      <ProgramBriefModal
        isOpen={programBriefOpen}
        onClose={() => setProgramBriefOpen(false)}
        cohortSize={briefParams.cohortSize}
        totalSavingsCr={briefParams.totalSavingsCr}
        nonResponders={briefParams.nonResponders}
      />
    </div>
  );
}
