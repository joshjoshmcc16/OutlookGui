import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import emailData from "./emailData.json";

export default function Test() {
  const circleContainerRef = useRef(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);

  useEffect(() => {
    // Define the circle data
    const circleData = [
      { category: "New", color: "red" },
      { category: "People", color: "steelblue" },
      { category: "Severity", color: "steelblue" },
      { category: "Less Severity", color: "steelblue" },
      { category: "Flagged", color: "steelblue" }
    ];

    // Set the dimensions of the SVG container
    const width = 1000;
    const height = 800;

    // Calculate the desired spacing between circles based on the available width and height
    const horizontalSpacing = width / (circleData.length + 1);

    // Create the SVG container within the circle-container div
    const svg = d3
      .select(circleContainerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create the circles
    const circles = svg
      .selectAll("circle")
      .data(circleData)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => horizontalSpacing * (i + 1))
      .attr("cy", (d, i) => (i % 2 === 0 ? height / 3 : (height / 3) * 2))
      .attr("r", 100)
      .attr("fill", d => d.color)
      .style("filter", "url(#circle-shadow)")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow");
        const cx = d3.select(this).attr("cx");
        const cy = d3.select(this).attr("cy");
        const emailCount = emailData.filter(email => email.Category === d.category).length;
        svg
          .append("text")
          .attr("class", "number")
          .attr("x", cx)
          .attr("y", cy)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .text(emailCount)
          .attr("fill", "black");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", d.color);
        svg.selectAll("text.number").remove();
      })
      .on("click", function (event, d) {
        const clickedCircle = d3.select(this);

        if (selectedCircle === clickedCircle) {
          clickedCircle.attr("stroke", "none");
          setSelectedCircle(null);
          setSelectedEmails([]);
        } else {
          if (selectedCircle) {
            selectedCircle.attr("stroke", "none");
          }

          clickedCircle.attr("stroke", "black").attr("stroke-width", "2px");
          setSelectedCircle(clickedCircle.node());

          const selectedEmailsData = emailData.filter(email => email.Category === d.category);
          setSelectedEmails(selectedEmailsData);
        }
      });

    // Create a shadow filter definition
    const shadowFilter = svg
      .append("defs")
      .append("filter")
      .attr("id", "circle-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    // Add the shadow to the filter
    shadowFilter
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 5)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.5);

    // Add category names to the circles
    svg
      .selectAll(".category")
      .data(circleData)
      .enter()
      .append("text")
      .attr("class", "category")
      .attr("x", (d, i) => horizontalSpacing * (i + 1))
      .attr("y", (d, i) => (i % 2 === 0 ? height / 3 : (height / 3) * 2))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(d => d.category)
      .attr("fill", "white");

    // Animation function
    function animate() {
      circles
        .transition()
        .duration(1000)
        .attr("r", d => {
          const emailCount = emailData.filter(email => email.Category === d.category).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 : 50 + emailCount * 2;
          return circleRadius;
        })
        .transition()
        .duration(1000)
        .attr("r", d => {
          const emailCount = emailData.filter(email => email.Category === d.category).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 + 10 : 50 + emailCount * 2 + 10;
          return circleRadius;
        })
        .on("end", animate);
    }

    // Start the animation
    animate();

    // Clean up the SVG container when the component is unmounted
    return () => {
      svg.remove();
    };
  }, []);

  // Set the background color of the page or container
  const containerStyle = {
    backgroundColor: "#f0f0f0", // Replace with your desired color
    width: "100%",
    height: "100vh",
  };

  // Set the style for the title
  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    padding: "20px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Outlook Emails</h1>
      <div id="circle-container" ref={circleContainerRef}></div>
      {selectedEmails.length > 0 && (
        <div>
          <h2>Emails:</h2>
          <ul>
            {selectedEmails.map((email, index) => (
              <li key={index}>
                <strong>From:</strong> {email.From}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
