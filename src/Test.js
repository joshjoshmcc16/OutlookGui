/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ps3MenuMusic from "./ps3MenuMusic.mp3"; // Replace "ps3MenuMusic.mp3" with the actual file path
import emailData from "./emailData.json";

export default function Test() {
  const circleContainerRef = useRef(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    const circleData = [
      { category: "New", color: "black" },
      { category: "People", color: "black" },
      { category: "Severity", color: "black" },
      { category: "Less Severity", color: "black" },
      { category: "Flagged", color: "black" }
    ];

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(circleContainerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let tooltip = null;

    const circles = svg
      .selectAll("circle")
      .data(circleData)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => (i + 1) * (width / (circleData.length + 1)))
      .attr("cy", (height / 2))
      .attr("r", 100)
      .attr("fill", d => d.color)
      .style("filter", "url(#circle-shadow)")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow");
        const cx = d3.select(this).attr("cx");
        const cy = d3.select(this).attr("cy");

        const emailCount = emailData.filter(email => email.Category === d.category).length;

        if (!tooltip) {
          tooltip = svg
            .append("text")
            .attr("class", "tooltip")
            .attr("x", cx)
            .attr("y", cy)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "black");
        }

        tooltip.text(emailCount);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", d.color);

        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      })
      .on("click", function (event, d) {
        if (!audioPlayed) {
          const audio = new Audio(ps3MenuMusic);
          audio.loop = true;
          audio.play();
          setAudioPlayed(true);
        }
      });

    svg
      .selectAll(".category")
      .data(circleData)
      .enter()
      .append("text")
      .attr("class", "category")
      .attr("x", (d, i) => (i + 1) * (width / (circleData.length + 1)))
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(d => d.category)
      .attr("fill", "white");

    const shadowFilter = svg
      .append("defs")
      .append("filter")
      .attr("id", "circle-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    shadowFilter
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 5)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.5);

    function animate() {
      circles
        .transition()
        .duration(1000)
        .attr("r", 49)
        .transition()
        .duration(1000)
        .attr("r", 59)
        .on("end", animate);
    }

    animate();

    return () => {
      svg.remove();
    };
  }, []);

  const ps3BackgroundStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    background: `linear-gradient(135deg, #0099ff, #ff33cc, #ff6633, #00ff00, #ff0000)`,
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite, colorPulse 2s alternate-reverse infinite",
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      @keyframes colorPulse {
        0% {
          filter: brightness(1.2) contrast(1.2);
        }
        100% {
          filter: brightness(1) contrast(1);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div>
      <div id="circle-container" ref={circleContainerRef}></div>
      <div style={ps3BackgroundStyles}></div>
    </div>
  );
}
