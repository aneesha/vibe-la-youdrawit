import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

function BarChartScreen({ student, onComplete }) {
  const [guessApplied, setGuessApplied] = useState(6);
  const [guessActivities, setGuessActivities] = useState(4);
  const [submitted, setSubmitted] = useState(false);
  const svgRef = useRef(null);

  const actualApplied = student.applied_classes_completed;
  const totalApplied = student.applied_classes_total;
  const actualActivities = student.weekly_activities_completed;
  const totalActivities = student.weekly_activities_total;

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete();
  };

  useEffect(() => {
    if (!submitted || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 600;
    const height = 280;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const categories = [
      {
        label: "Applied Classes",
        guess: guessApplied,
        actual: actualApplied,
        total: totalApplied,
      },
      {
        label: "Weekly Activities",
        guess: guessActivities,
        actual: actualActivities,
        total: totalActivities,
      },
    ];

    const x0 = d3.scaleBand()
      .domain(categories.map((d) => d.label))
      .range([80, width - 40])
      .padding(0.35);

    const x1 = d3.scaleBand()
      .domain(["guess", "actual"])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxVal = Math.max(totalApplied, totalActivities);
    const y = d3.scaleLinear()
      .domain([0, maxVal])
      .range([height - 40, 20]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - 40})`)
      .call(d3.axisBottom(x0))
      .selectAll("text").style("font-size", "13px").style("font-weight", "600");

    svg.append("g")
      .attr("transform", `translate(80,0)`)
      .call(d3.axisLeft(y).ticks(6))
      .selectAll("text").style("font-size", "12px");

    // Grid
    svg.append("g").selectAll("line")
      .data(y.ticks(6))
      .join("line")
      .attr("x1", 80).attr("x2", width - 40)
      .attr("y1", (d) => y(d)).attr("y2", (d) => y(d))
      .attr("stroke", "#e5e7eb").attr("stroke-dasharray", "3,3");

    // Bars
    categories.forEach((cat) => {
      const g = svg.append("g").attr("transform", `translate(${x0(cat.label)},0)`);

      // Guess bar
      g.append("rect")
        .attr("x", x1("guess"))
        .attr("y", y(0))
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("fill", "#f59e0b")
        .attr("rx", 4)
        .transition().duration(800)
        .attr("y", y(cat.guess))
        .attr("height", y(0) - y(cat.guess));

      // Guess label
      g.append("text")
        .attr("x", x1("guess") + x1.bandwidth() / 2)
        .attr("y", y(cat.guess) - 6)
        .attr("text-anchor", "middle")
        .style("font-size", "12px").style("font-weight", "700").style("fill", "#f59e0b")
        .attr("opacity", 0)
        .transition().delay(800)
        .attr("opacity", 1)
        .text(cat.guess);

      // Actual bar
      g.append("rect")
        .attr("x", x1("actual"))
        .attr("y", y(0))
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("fill", "#10b981")
        .attr("rx", 4)
        .transition().duration(800).delay(400)
        .attr("y", y(cat.actual))
        .attr("height", y(0) - y(cat.actual));

      // Actual label
      g.append("text")
        .attr("x", x1("actual") + x1.bandwidth() / 2)
        .attr("y", y(cat.actual) - 6)
        .attr("text-anchor", "middle")
        .style("font-size", "12px").style("font-weight", "700").style("fill", "#10b981")
        .attr("opacity", 0)
        .transition().delay(1200)
        .attr("opacity", 1)
        .text(cat.actual);

      // Total line
      g.append("line")
        .attr("x1", 0).attr("x2", x0.bandwidth())
        .attr("y1", y(cat.total)).attr("y2", y(cat.total))
        .attr("stroke", "#6b7280").attr("stroke-width", 1.5).attr("stroke-dasharray", "5,3");

      g.append("text")
        .attr("x", x0.bandwidth() + 4)
        .attr("y", y(cat.total) + 4)
        .style("font-size", "10px").style("fill", "#6b7280")
        .text(`max: ${cat.total}`);
    });

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 200}, 10)`);
    [
      { color: "#f59e0b", label: "Your guess" },
      { color: "#10b981", label: "Actual" },
    ].forEach(({ color, label }, i) => {
      legend.append("rect").attr("x", 0).attr("y", i * 20).attr("width", 14).attr("height", 14)
        .attr("fill", color).attr("rx", 3);
      legend.append("text").attr("x", 20).attr("y", i * 20 + 11)
        .style("font-size", "12px").attr("fill", "#374151").text(label);
    });

  }, [submitted]);

  const appliedDiff = submitted ? Math.abs(guessApplied - actualApplied) : null;
  const activitiesDiff = submitted ? Math.abs(guessActivities - actualActivities) : null;

  return (
    <div className="card">
      <h2>Screen 2: Applied Classes & Weekly Activities</h2>
      <p>
        Estimate how many applied classes you completed (out of {totalApplied}) and
        how many weekly activities you completed well (scored 3+ out of 5, across {totalActivities} weeks).
      </p>

      {!submitted && (
        <div className="bar-chart-container">
          <div className="bar-group">
            <label>Applied Classes Completed (out of {totalApplied})</label>
            <div className="bar-slider-row">
              <span>0</span>
              <input
                type="range"
                min={0}
                max={totalApplied}
                value={guessApplied}
                onChange={(e) => setGuessApplied(Number(e.target.value))}
              />
              <span>{totalApplied}</span>
              <div className="bar-value">{guessApplied}</div>
            </div>
          </div>

          <div className="bar-group">
            <label>Weekly Activities Completed Well (out of {totalActivities})</label>
            <div className="bar-slider-row">
              <span>0</span>
              <input
                type="range"
                min={0}
                max={totalActivities}
                value={guessActivities}
                onChange={(e) => setGuessActivities(Number(e.target.value))}
              />
              <span>{totalActivities}</span>
              <div className="bar-value">{guessActivities}</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit & Reveal
          </button>
        </div>
      )}

      {submitted && (
        <>
          <div className="chart-area">
            <svg ref={svgRef} style={{ width: "100%", height: 280 }} />
          </div>

          <div className="feedback-box">
            <h3>Feedback</h3>
            <p>
              {appliedDiff <= 1 && activitiesDiff <= 1
                ? "Great self-awareness! Your estimates were very close to your actual completion rates."
                : appliedDiff + activitiesDiff <= 4
                ? "Decent estimates! There were some small differences — this is helpful for calibrating your self-perception."
                : "There's a notable gap between your estimates and actual data. This is a valuable insight — understanding this mismatch can help you better plan your study approach."}
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
              Were you surprised by any of these results? How might this affect your study planning?
            </label>
            <textarea
              className="reflection-textarea"
              placeholder="Type your reflection here..."
            />
          </div>
        </>
      )}
    </div>
  );
}

export default BarChartScreen;
