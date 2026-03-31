import { useEffect } from "react";

function IntroScreen({ student, onReady }) {
  useEffect(() => { onReady(); }, []);

  return (
    <div className="card intro-screen">
      <h2>
        Welcome, <span className="welcome-name">{student.first_name}</span>!
      </h2>
      <p>
        This short activity uses <strong>belief-driven visualisation</strong> to help
        you reflect on your learning in{" "}
        <strong>{student.course.course_name}</strong>.
      </p>
      <p>
        You will be shown the beginning of your learning data and asked to
        <strong> draw what you think the rest looks like</strong>. Then we will
        reveal the actual data so you can compare.
      </p>
      <ol className="instruction-list">
        <li data-step="1">Draw your predicted course material access over the semester</li>
        <li data-step="2">Estimate your applied class and weekly activity completion</li>
        <li data-step="3">Reflect on how you regulate your learning</li>
      </ol>
      <p style={{ marginTop: 12, fontStyle: "italic" }}>
        Click <strong>Next</strong> to begin.
      </p>
    </div>
  );
}

export default IntroScreen;
