/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ps3MenuMusic from "./ps3MenuMusic.mp3"; // Replace "ps3MenuMusic.mp3" with the actual file path
import emailData from "./emailData.json";

export default function Test() {
  const circleContainerRef = useRef(null);
  const audioRef = useRef(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    // Define the circle data
    const circleData = [
      { category: "New", color: "black" },
      { category: "People", color: "black" },
      { category: "Severity", color: "black" },
      { category: "Less Severity", color: "black" },
      { category: "Flagged", color: "black" }
    ];

    // Set the dimensions of the SVG container
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create the SVG container within the circle-container div
    const svg = d3
      .select(circleContainerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Variable to store the tooltip element
    let tooltip = null;

    // Create the circles
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
      
        // Get the email count for the current category
        const emailCount = emailData.filter(email => email.Category === d.category).length;
      
        // If the tooltip doesn't exist, create it
        if (!tooltip) {
          tooltip = svg
            .append("text")
            .attr("class", "tooltip")
            .attr("x", cx)
            .attr("y", cy) // Place it at the center of the circle
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle") // Center the text vertically
            .attr("fill", "black");
        }
      
        // Update the tooltip content with email count only
        tooltip.text(emailCount);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", d.color);
      
        // Remove the tooltip when the mouse moves out of the circle
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      });
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
.text(d => d.category)
.attr("fill", "white");

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

    // Animation function
    function animate() {
      circles
        .transition()
        .duration(1000) // how long it takes to animate the circle growing
        .attr("r", 49) // this will make the circle shrink
        .transition()
        .duration(1000)
        .attr("r", 59) // this will make the circle grow
        .on("end", animate);
    }

    // Start the animation
    animate();

    // Play the PS3 UI music when the component mounts
    const audio = audioRef.current;

    // Add an event listener to the audio element to handle audio loading
    audio.addEventListener("canplaythrough", handleAudioLoaded);

    // Clean up the event listener and other resources when the component is unmounted
    return () => {
      audio.removeEventListener("canplaythrough", handleAudioLoaded);
      svg.remove();
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioRef]);

  useEffect(() => {
    // If the audio has loaded and the user has interacted with the page,
    // play the audio programmatically
    if (audioLoaded) {
      audioRef.current.play();
    }
  }, [audioLoaded]);

  const handleAudioLoaded = () => {
    // Audio has loaded, set the state to true
    setAudioLoaded(true);
  };

  // Dynamic PS3-like background styles
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

  // Append the animation styles to the head
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

    // Clean up the styles when the component is unmounted
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div>
      <div id="circle-container" ref={circleContainerRef}></div>
      <audio ref={audioRef} src={ps3MenuMusic} loop />
      <div style={ps3BackgroundStyles}></div>
    </div>
  );
}
