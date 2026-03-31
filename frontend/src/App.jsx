import { Routes, Route, Navigate } from "react-router-dom";
import Wizard from "./components/Wizard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/student/:username" element={<Wizard />} />
      <Route path="*" element={<Navigate to="/student/s4501001" replace />} />
    </Routes>
  );
}

export default App;
