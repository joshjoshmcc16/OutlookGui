/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import emailData from "./emailData.json";

export default function Test() {
  const circleContainerRef = useRef(null);
  const [selectedCircle, setSelectedCircle] = useState(d3.select(null));
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [scrollToTop, setScrollToTop] = useState(false);

  useEffect(() => {
    // Define the circle data
    const circleData = [
      { category: "New", color: "#FF6363" },
      { category: "People", color: "#63C3FF" },
      { category: "Severity", color: "#FFA663" },
      { category: "Less Severity", color: "#FFD663" },
      { category: "Flagged", color: "#63FFA1" }
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
    const circles = createCircles(svg, circleData, horizontalSpacing, height);
    applyCircleShadow(svg);
    addMouseOverBehavior(svg, circles, selectedEmails, setSelectedEmails);
    addClickBehavior(svg, circles, selectedCircle, setSelectedCircle, selectedEmails, setSelectedEmails);
    addCategoryNames(svg, circleData, horizontalSpacing, height);
    addTrashCanIcons(svg, circleData, horizontalSpacing, height, selectedEmails, setSelectedEmails);

    // Animation function
    function animate() {
      circles
        .transition()
        .duration(1000)
        .attr("r", d => calculateCircleRadius(emailData, d))
        .transition()
        .duration(1000)
        .attr("r", d => calculateCircleRadius(emailData, d) + 10)
        .on("end", animate);
    }

    // Start the animation
    animate();

    // Clean up the SVG container when the component is unmounted
    return () => {
      svg.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setScrollToTop(false);
    }
  }, [scrollToTop]);

  useEffect(() => {
    setScrollToTop(true);
  }, [selectedEmails]);

  const containerStyle = {
    backgroundColor: "white",
    width: "100%",
    height: "100vh",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    padding: "20px",
    fontFamily: "'PT Serif', sans-serif", // Replace 'Roboto' with the actual font name from Google Fonts
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Roboto&display=swap"; // Replace with the Google Fonts URL for your selected font
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

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
      {selectedEmails.length > 0 && (
        <button
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => setScrollToTop(true)}
        >
          Scroll to Top
        </button>
      )}
    </div>
  );
}

// Function to create circles
function createCircles(svg, circleData, horizontalSpacing, height) {
  return svg
    .selectAll("circle")
    .data(circleData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => horizontalSpacing * (i + 1))
    .attr("cy", (d, i) => (i % 2 === 0 ? height / 3 : (height / 3) * 2))
    .attr("r", 50) // Adjust the circle radius as desired
    .attr("fill", d => d.color);
}

// Function to apply shadow to circles
function applyCircleShadow(svg) {
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
}

// Function to add mouseover behavior to circles
function addMouseOverBehavior(svg, circles, selectedEmails, setSelectedEmails) {
  circles
    .on("mouseover", function (event, d) {
      // Your mouseover logic here
    })
    .on("mouseout", function (event, d) {
      // Your mouseout logic here
    });
}

// Function to add click behavior to circles
function addClickBehavior(svg, circles, selectedCircle, setSelectedCircle, selectedEmails, setSelectedEmails) {
  circles.on("click", function (event, d) {
    // Your click logic here
  });
}

// Function to add category names to circles
function addCategoryNames(svg, circleData, horizontalSpacing, height) {
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
}

// Function to add trash can icons to circles
function addTrashIcons(svg, circleData, horizontalSpacing, height, selectedEmails, setSelectedEmails) {
  svg
    .selectAll(".trash-icon")
    .data(circleData)
    .enter()
    .append("foreignObject")
    .attr("class", "trash-icon")
    .attr("x", (d, i) => horizontalSpacing * (i + 1) - 15)
    .attr("y", (d, i) => (i % 2 === 0 ? height / 3 : (height / 3) * 2) + 40)
    .attr("width", 30)
    .attr("height", 30)
    .html('<i class="fa fa-trash"></i>')
    .on("click", function (event, d) {
      // Your trash icon click logic here
    });
}

// Function to animate circles
function animateCircles(circles, emailData) {
  circles
    .transition()
    .duration(1000)
    .attr("r", d => {
      // Your circle radius calculation logic here
    })
    .transition()
    .duration(1000)
    .attr("r", d => {
      // Your circle radius calculation logic here
    })
    .on("end", animateCircles);
}

// Main function
export default function Test() {
  const circleContainerRef = useRef(null);
  const [selectedCircle, setSelectedCircle] = useState(d3.select(null));
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [scrollToTop, setScrollToTop] = useState(false);

  useEffect(() => {
    // Define the circle data
    const circleData = [
      { category: "New", color: "#FF6363" },
      { category: "People", color: "#63C3FF" },
      { category: "Severity", color: "#FFA663" },
      { category: "Less Severity", color: "#FFD663" },
      { category: "Flagged", color: "#63FFA1" }
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
    const circles = createCircles(svg, circleData, horizontalSpacing, height);

    // Apply shadow to circles
    applyCircleShadow(svg);

    // Add mouseover behavior to circles
    addMouseOverBehavior(svg, circles, selectedEmails, setSelectedEmails);

    // Add click behavior to circles
    addClickBehavior(svg, circles, selectedCircle, setSelectedCircle, selectedEmails, setSelectedEmails);

    // Add category names to circles
    addCategoryNames(svg, circleData, horizontalSpacing, height);

    // Add trash can icons to circles
    addTrashIcons(svg, circleData, horizontalSpacing, height, selectedEmails, setSelectedEmails);

    // Animate circles
    animateCircles(circles, emailData);

    // Clean up the SVG container when the component is unmounted
    return () => {
      svg.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setScrollToTop(false);
    }
  }, [scrollToTop]);

  useEffect(() => {
    setScrollToTop(true);
  }, [selectedEmails]);

  const containerStyle = {
    backgroundColor: "white",
    width: "100%",
    height: "100vh",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    padding: "20px",
    fontFamily: "'PT Serif', sans-serif", // Replace 'Roboto' with the actual font name from Google Fonts
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Roboto&display=swap"; // Replace with the Google Fonts URL for your selected font
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

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
      {selectedEmails.length > 0 && (
        <button
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => setScrollToTop(true)}
        >
          Scroll to Top
        </button>
      )}
    </div>
  );
}
