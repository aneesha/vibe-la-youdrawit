import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import IntroScreen from "./IntroScreen.jsx";
import AccessDrawScreen from "./AccessDrawScreen.jsx";
import BarChartScreen from "./BarChartScreen.jsx";
import EndScreen from "./EndScreen.jsx";

const API = "/api";
const TOTAL_STEPS = 4;

function Wizard() {
  const { username } = useParams();
  const [step, setStep] = useState(0);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepCompleted, setStepCompleted] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/student/${username}`)
      .then((r) => {
        if (!r.ok) throw new Error("Student not found");
        return r.json();
      })
      .then((data) => {
        setStudentData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username]);

  const markCompleted = (s) => setStepCompleted((prev) => ({ ...prev, [s]: true }));
  const canProceed = step === 0 || stepCompleted[step];

  if (loading) return <div className="loading">Loading student data...</div>;
  if (!studentData) return <div className="loading">Student "{username}" not found. Check the URL.</div>;

  const screens = [
    <IntroScreen key={0} student={studentData} onReady={() => markCompleted(0)} />,
    <AccessDrawScreen key={1} student={studentData} onComplete={() => markCompleted(1)} />,
    <BarChartScreen key={2} student={studentData} onComplete={() => markCompleted(2)} />,
    <EndScreen key={3} student={studentData} />,
  ];

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>{studentData.course.course_name} ({studentData.course.course_code})</h1>
        <p>Learning Analytics Reflection — {studentData.first_name} {studentData.last_name}</p>
      </div>

      <div className="progress-bar">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`progress-step ${i < step ? "completed" : ""} ${i === step ? "active" : ""}`}
          />
        ))}
      </div>

      {screens[step]}

      <div className="btn-row">
        {step > 0 ? (
          <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            Back
          </button>
        ) : <span />}
        {step < TOTAL_STEPS - 1 && (
          <button
            className="btn btn-primary"
            disabled={!canProceed}
            onClick={() => setStep(step + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Wizard;
