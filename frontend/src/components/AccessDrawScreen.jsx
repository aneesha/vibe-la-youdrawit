import { useRef, useState, useEffect, useCallback } from "react";
import * as d3 from "d3";

const VISIBLE_WEEKS = 2; // Show first 2 weeks
const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };

function AccessDrawScreen({ student, onComplete }) {
  const svgRef = useRef(null);
  const [drawn, setDrawn] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [userPoints, setUserPoints] = useState([]);
  const [feedback, setFeedback] = useState("");
  const drawingRef = useRef(false);
  const userPointsRef = useRef([]);

  const data = student.access_timeseries;
  const maxY = Math.max(...data.map((d) => d.clicks)) + 10;

  const getScales = useCallback((width, height) => {
    const x = d3.scaleLinear().domain([1, 13]).range([MARGIN.left, width - MARGIN.right]);
    const y = d3.scaleLinear().domain([0, maxY]).range([height - MARGIN.bottom, MARGIN.top]);
    return { x, y };
  }, [maxY]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 700;
    const height = 350;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const { x, y } = getScales(width, height);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks(6))
      .join("line")
      .attr("x1", MARGIN.left)
      .attr("x2", width - MARGIN.right)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "3,3");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - MARGIN.bottom})`)
      .call(d3.axisBottom(x).ticks(13).tickFormat((d) => `W${d}`))
      .selectAll("text").style("font-size", "12px");

    svg.append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(y).ticks(6))
      .selectAll("text").style("font-size", "12px");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 14)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Unique Clicks");

    // Known data line (first 2 weeks)
    const knownData = data.filter((d) => d.week <= VISIBLE_WEEKS);
    const line = d3.line().x((d) => x(d.week)).y((d) => y(d.clicks)).curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(knownData)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Known data dots
    svg.selectAll(".known-dot")
      .data(knownData)
      .join("circle")
      .attr("class", "known-dot")
      .attr("cx", (d) => x(d.week))
      .attr("cy", (d) => y(d.clicks))
      .attr("r", 5)
      .attr("fill", "#4f46e5");

    // Draw zone overlay
    const drawZoneX = x(VISIBLE_WEEKS);
    svg.append("rect")
      .attr("x", drawZoneX)
      .attr("y", MARGIN.top)
      .attr("width", width - MARGIN.right - drawZoneX)
      .attr("height", height - MARGIN.bottom - MARGIN.top)
      .attr("fill", revealed ? "transparent" : "#f0f0ff")
      .attr("opacity", 0.4)
      .attr("class", "draw-zone");

    // User drawn line
    const userLine = svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "6,3")
      .attr("class", "user-line");

    // Snap user drawing to week positions
    const getWeekFromX = (px) => {
      const w = Math.round(x.invert(px));
      return Math.max(VISIBLE_WEEKS + 1, Math.min(13, w));
    };

    const getClicksFromY = (py) => {
      return Math.max(0, Math.round(y.invert(py)));
    };

    if (!revealed) {
      // Drawing interaction
      const drawArea = svg.append("rect")
        .attr("x", drawZoneX)
        .attr("y", MARGIN.top)
        .attr("width", width - MARGIN.right - drawZoneX)
        .attr("height", height - MARGIN.bottom - MARGIN.top)
        .attr("fill", "transparent")
        .style("cursor", "crosshair");

      const handleDraw = (event) => {
        if (!drawingRef.current) return;
        const [px, py] = d3.pointer(event, svgRef.current);
        const week = getWeekFromX(px);
        const clicks = getClicksFromY(py);

        const pts = userPointsRef.current.filter((p) => p.week !== week);
        pts.push({ week, clicks });
        pts.sort((a, b) => a.week - b.week);
        userPointsRef.current = pts;

        // Include last known point for continuity
        const lastKnown = knownData[knownData.length - 1];
        const fullLine = [{ week: lastKnown.week, clicks: lastKnown.clicks }, ...pts];

        const userLineFn = d3.line()
          .x((d) => x(d.week))
          .y((d) => y(d.clicks))
          .curve(d3.curveMonotoneX);

        userLine.attr("d", userLineFn(fullLine));

        // Draw dots for user points
        svg.selectAll(".user-dot").remove();
        svg.selectAll(".user-dot")
          .data(pts)
          .join("circle")
          .attr("class", "user-dot")
          .attr("cx", (d) => x(d.week))
          .attr("cy", (d) => y(d.clicks))
          .attr("r", 4)
          .attr("fill", "#f59e0b")
          .attr("stroke", "white")
          .attr("stroke-width", 1.5);
      };

      drawArea
        .on("mousedown touchstart", (e) => { e.preventDefault(); drawingRef.current = true; handleDraw(e); })
        .on("mousemove touchmove", (e) => { e.preventDefault(); handleDraw(e); })
        .on("mouseup touchend", () => {
          drawingRef.current = false;
          setUserPoints([...userPointsRef.current]);
        })
        .on("mouseleave", () => {
          drawingRef.current = false;
          setUserPoints([...userPointsRef.current]);
        });
    }

    // If revealed, show actual line
    if (revealed) {
      const actualData = data.filter((d) => d.week >= VISIBLE_WEEKS);

      // Re-draw user line
      if (userPointsRef.current.length > 0) {
        const lastKnown = knownData[knownData.length - 1];
        const fullLine = [{ week: lastKnown.week, clicks: lastKnown.clicks }, ...userPointsRef.current];
        const userLineFn = d3.line().x((d) => x(d.week)).y((d) => y(d.clicks)).curve(d3.curveMonotoneX);
        userLine.attr("d", userLineFn(fullLine));

        svg.selectAll(".user-dot")
          .data(userPointsRef.current)
          .join("circle")
          .attr("class", "user-dot")
          .attr("cx", (d) => x(d.week))
          .attr("cy", (d) => y(d.clicks))
          .attr("r", 4)
          .attr("fill", "#f59e0b")
          .attr("stroke", "white")
          .attr("stroke-width", 1.5);
      }

      // Actual line animation
      const actualLine = d3.line().x((d) => x(d.week)).y((d) => y(d.clicks)).curve(d3.curveMonotoneX);

      const path = svg.append("path")
        .datum(actualData)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3)
        .attr("d", actualLine);

      const totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

      // Actual dots
      svg.selectAll(".actual-dot")
        .data(actualData)
        .join("circle")
        .attr("class", "actual-dot")
        .attr("cx", (d) => x(d.week))
        .attr("cy", (d) => y(d.clicks))
        .attr("r", 5)
        .attr("fill", "#10b981")
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => (i / actualData.length) * 1500)
        .attr("opacity", 1);

      // Legend
      const legend = svg.append("g").attr("transform", `translate(${width - MARGIN.right - 160}, ${MARGIN.top + 5})`);
      [
        { color: "#f59e0b", label: "Your prediction", dash: "6,3" },
        { color: "#10b981", label: "Actual data", dash: "" },
        { color: "#4f46e5", label: "Shown data", dash: "" },
      ].forEach(({ color, label, dash }, i) => {
        legend.append("line").attr("x1", 0).attr("x2", 20).attr("y1", i * 20).attr("y2", i * 20)
          .attr("stroke", color).attr("stroke-width", 2.5).attr("stroke-dasharray", dash);
        legend.append("text").attr("x", 26).attr("y", i * 20 + 4).text(label)
          .style("font-size", "11px").attr("fill", "#374151");
      });
    }
  }, [data, getScales, revealed]);

  const handleReveal = () => {
    setRevealed(true);

    // Calculate feedback
    const actual = data.filter((d) => d.week > VISIBLE_WEEKS);
    const userMap = Object.fromEntries(userPointsRef.current.map((p) => [p.week, p.clicks]));

    let totalDiff = 0;
    let count = 0;
    actual.forEach((d) => {
      if (userMap[d.week] !== undefined) {
        totalDiff += Math.abs(userMap[d.week] - d.clicks);
        count++;
      }
    });

    const avgDiff = count > 0 ? totalDiff / count : 0;
    let msg;
    if (avgDiff < 5) {
      msg = "Excellent! Your prediction was very close to your actual access patterns. You have a strong awareness of your engagement with course materials.";
    } else if (avgDiff < 12) {
      msg = "Good effort! Your prediction was reasonably close, though there were some differences. This is common — our perception of engagement doesn't always match reality.";
    } else {
      msg = "Interesting! There's a noticeable gap between your prediction and actual access. This kind of mismatch is valuable to discover — it highlights areas where your self-perception differs from your actual behaviour.";
    }
    setFeedback(msg);
    onComplete();
  };

  const hasEnoughPoints = userPoints.length >= 3;

  return (
    <div className="card">
      <h2>Screen 1: Course Material Access</h2>
      <p>
        Below is your unique course material access (clicks) for the first {VISIBLE_WEEKS} weeks.
        <strong> Draw what you think your access looked like for the remaining weeks.</strong>
      </p>

      {!revealed && (
        <div className="draw-instruction">
          Click and drag in the shaded area to draw your prediction
        </div>
      )}

      <div className="chart-area">
        <svg ref={svgRef} style={{ width: "100%", height: 350 }} />
      </div>

      {!revealed && (
        <button
          className="btn btn-primary"
          disabled={!hasEnoughPoints}
          onClick={handleReveal}
        >
          {hasEnoughPoints ? "Reveal Actual Data" : "Draw at least 3 points to continue"}
        </button>
      )}

      {revealed && feedback && (
        <div className="feedback-box">
          <h3>Feedback</h3>
          <p>{feedback}</p>
        </div>
      )}

      {revealed && (
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
            What surprised you about the difference between your prediction and reality?
          </label>
          <textarea
            className="reflection-textarea"
            placeholder="Type your reflection here..."
          />
        </div>
      )}
    </div>
  );
}

export default AccessDrawScreen;
