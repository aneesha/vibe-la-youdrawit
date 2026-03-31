function EndScreen({ student }) {
  return (
    <div className="card end-screen">
      <h2>Activity Complete!</h2>
      <p style={{ fontSize: "1.1rem", marginBottom: 20 }}>
        Thank you, <strong>{student.first_name}</strong>, for completing this reflection activity.
      </p>

      <div className="feedback-box" style={{ textAlign: "left" }}>
        <h3>Why does this matter?</h3>
        <p>
          <strong>Self-regulated learning</strong> is the ability to monitor, control, and
          reflect on your own learning processes. Research shows that students who
          accurately perceive their own engagement tend to perform better and develop
          more effective study strategies.
        </p>
        <p style={{ marginTop: 8 }}>
          By comparing your beliefs about your learning behaviour with actual data, you
          can identify blind spots and make more informed decisions about how you
          allocate your time and effort.
        </p>
      </div>

      <div style={{ marginTop: 24, textAlign: "left" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
          Take a moment to reflect: How do you regulate your learning? What changes, if
          any, would you like to make for the rest of the semester?
        </label>
        <textarea
          className="reflection-textarea"
          placeholder="Type your final reflection here..."
          style={{ minHeight: 120 }}
        />
      </div>
    </div>
  );
}

export default EndScreen;
