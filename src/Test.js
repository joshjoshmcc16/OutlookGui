/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import emailData from "./emailData.json";
import { easeBounceOut } from "d3-ease";
import ps3MenuMusic from "./ps3MenuMusic.mp3";

export default function Test() {
  const circleContainerRef = useRef(null);
  const [selectedCircle, setSelectedCircle] = useState(d3.select(null));
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [scrollToTop, setScrollToTop] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    const circleData = [
      { category: "New", color: "#FF6363" },
      { category: "People", color: "#63C3FF" },
      { category: "Severity", color: "#FFA663" },
      { category: "Less Severity", color: "#FFD663" },
      { category: "Flagged", color: "#63FFA1" },
    ];

    const width = window.innerWidth;
    const height = window.innerHeight;

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
      .attr("cx", (d, i) => (i + 1) * (width / (circleData.length + 1)))
      .attr("cy", (height / 2))
      .attr("r", 50) // Adjust the circle radius as desired
      .attr("fill", (d) => d.color)
      .style("filter", "url(#circle-shadow)");

    // Event handlers for circle interactions
    function handleMouseOver(event, d) {
      d3.select(this).attr("fill", "yellow");
      const circleCenterX = d3.select(this).attr("cx");
      const circleCenterY = d3.select(this).attr("cy");
      const emailCount = emailData.filter((email) => email.Category === d.category).length;
      const g = svg
        .append("g")
        .attr("class", "hover-group")
        .attr("transform", `translate(${circleCenterX}, ${circleCenterY})`);

      g.append("text")
        .attr("class", "number")
        .attr("x", 0)
        .attr("y", 6)
        .text(emailCount)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central");

      g.append("text")
        .attr("class", "close")
        .attr("x", 50)
        .attr("y", -50)
        .text("X")
        .attr("fill", "red")
        .style("cursor", "pointer")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
        .on("click", function () {
          const clickedCircle = d3.select(this.parentNode.parentNode).datum();
          const updatedEmails = selectedEmails.filter((email) => email.Category !== clickedCircle.category);
          setSelectedEmails(updatedEmails);
        });
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr("fill", d.color);
      svg.selectAll("g.hover-group").transition().duration(245).remove();
    }

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

        const selectedEmailsData = emailData.filter((email) => email.Category === d.category);
        setSelectedEmails(selectedEmailsData);

        // Turn on background music when a circle is clicked
        if (!audioPlayed) {
          const audio = new Audio(ps3MenuMusic);
          audio.loop = true;
          audio.play();
          setAudioPlayed(true);
        }
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
      .attr("x", (d, i) => (i + 1) * (width / (circleData.length + 1)))
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text((d) => d.category)
      .attr("fill", "white");

    function throbbingAnimation() {
      circles.each(function (d) {
        const emailCount = emailData.filter((email) => email.Category === d.category).length;
        const circleRadius = emailCount > 35 ? 50 + 35 * 2 : 50 + emailCount * 2;

        if (emailCount > 0) {
          d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", circleRadius)
            .transition()
            .duration(1000)
            .attr("r", circleRadius + 10)
            .ease(easeBounceOut)
            .on("end", function () {
              if (emailData.filter((email) => email.Category === d.category).length > 0) {
                throbbingAnimation.call(this);
              } else {
                d3.select(this).attr("r", 50);
              }
            });
        }
      });
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
          const emailCount = emailData.filter((email) => email.Category === d.category).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 : 50 + emailCount * 2;
          return circleRadius;
        })
        .transition()
        .duration(1000)
        .attr("r", (d) => {
          const emailCount = emailData.filter((email) => email.Category === d.category).length;
          const circleRadius = emailCount > 35 ? 50 + 35 * 2 + 10 : 50 + emailCount * 2 + 10;
          return circleRadius;
        })
        .ease(easeBounceOut)
        .on("end", throbbingAnimation);
    }

    animate();

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

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Roboto&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

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
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  const containerStyle = {
    position: "relative",
    width: "100%",
    height: "100vh",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    padding: "20px",
    fontFamily: "'PT Serif', sans-serif",
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
      {selectedEmails.length > 0 && (
        <button
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => setScrollToTop(true)}
        >
          Scroll to Top
        </button>
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          background: `linear-gradient(135deg, #0099ff, #ff33cc, #ff6633, #00ff00, #ff0000)`,
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite, colorPulse 2s alternate-reverse infinite",
        }}
      ></div>
    </div>
  );
}
