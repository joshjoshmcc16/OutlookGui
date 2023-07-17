/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import emailData from "./emailData.json";
import { easeBounceOut } from "d3-ease";

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
      { category: "Flagged", color: "#63FFA1" },
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
      .attr("r", 50) // Adjust the circle radius as desired
      .attr("fill", (d) => d.color)
      .style("filter", "url(#circle-shadow)");

    //Handling Mouse Over Event and Creating Hover Information
    function handleMouseOver(event, d) {
      d3.select(this).attr("fill", "yellow");
      const circleRadius = d3.select(this).attr("r");
      const circleCenterX = parseFloat(d3.select(this).attr("cx"));
      const circleCenterY = parseFloat(d3.select(this).attr("cy"));
      const emailCount = emailData.filter(
        (email) => email.Category === d.category
      ).length;
      const g = svg
        .append("g")
        .attr("class", "hover-group")
        .attr(
          "transform",
          `translate(${circleCenterX}, ${circleCenterY})`
        ); // Position the group relative to the circle

      const textX = 0; // Adjust the x position as desired
      const textY = 6; // Adjust the y position as desired

      g.append("text")
        .attr("class", "number")
        .attr("x", textX)
        .attr("y", textY)
        .text(emailCount)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central");

      g.append("text")
        .attr("class", "close")
        .attr("x", parseInt(circleRadius) + textX) // Adjust the x position as desired
        .attr("y", -parseInt(circleRadius) + textY) // Adjust the y position as desired
        .text("X")
        .attr("fill", "red")
        .style("cursor", "pointer")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
        .on("click", function () {
          // Remove the selected circle and associated elements
          const clickedCircle = d3.select(this.parentNode.parentNode).datum();
          const updatedEmails = selectedEmails.filter(
            (email) => email.Category !== clickedCircle.category
          );
          setSelectedEmails(updatedEmails);
        });
    }

    //Handling Mouse Out Event and Removing Hover Information
    function handleMouseOut(event, d) {
      d3.select(this).attr("fill", d.color);
      svg.selectAll("g.hover-group").transition().duration(245).remove();
    }

    //Handling Click Event and Selecting Circles
    function handleClick(event, d) {
      const clickedCircle = d3.select(this);

      if (selectedCircle.node() === clickedCircle.node()) {
        clickedCircle.attr("stroke", "none");
        setSelectedCircle(d3.select(null));
        setSelectedEmails([]);
      } else {
        if (selectedCircle.node()) {
          selectedCircle.attr("stroke", "none");
        }

        clickedCircle.attr("stroke", "black").attr("stroke-width", "2px");
        setSelectedCircle(clickedCircle);

        const selectedEmailsData = emailData.filter(
          (email) => email.Category === d.category
        );
        setSelectedEmails(selectedEmailsData);
      }
    }

    // Event Binding for Circle Interactions
    circles
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);

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
      .text((d) => d.category)
      .attr("fill", "white");

    function throbbingAnimation() {
      circles
        .transition()
        .duration(1000)
        .attr("r", (d) => {
          const emailCount = emailData.filter(
            (email) => email.Category === d.category
          ).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 : 50 + emailCount * 2;
          return circleRadius;
        })
        .transition()
        .duration(1000)
        .attr("r", (d) => {
          const emailCount = emailData.filter(
            (email) => email.Category === d.category
          ).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 + 10 : 50 + emailCount * 2 + 10;
          return circleRadius;
        })
        .ease(easeBounceOut)
        .on("end", throbbingAnimation);
    }

    function animate() {
      circles
        .attr("r", 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 200)
        .attr("r", 50)
        .style("opacity", 0)
        .style("transform", "scale(0)")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .style("transform", "scale(1)")
        .ease(easeBounceOut)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 200)
        .attr("r", (d) => {
          const emailCount = emailData.filter(
            (email) => email.Category === d.category
          ).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 : 50 + emailCount * 2;
          return circleRadius;
        })
        .transition()
        .duration(1000)
        .attr("r", (d) => {
          const emailCount = emailData.filter(
            (email) => email.Category === d.category
          ).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 + 10 : 50 + emailCount * 2 + 10;
          return circleRadius;
        })
        .ease(easeBounceOut)
        .on("end", throbbingAnimation);
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
