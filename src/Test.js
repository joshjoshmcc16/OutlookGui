/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import emailData from "./emailData.json";
import { easeBounceOut } from "d3-ease";
import ps3MenuMusic from "./ps3MenuMusic.mp3";
import hoverSoundEffect from "./hoverSoundEffect.mp3";
// Import the Splunk logo image file
import splunkLogo from "./SplunkLogo.png";


export default function Test() {
const circleContainerRef = useRef(null);
const [selectedCircle, setSelectedCircle] = useState(d3.select(null));
const [selectedEmails, setSelectedEmails] = useState([]);
const [scrollToTop, setScrollToTop] = useState(false);
const [audioPlayed, setAudioPlayed] = useState(false);
const [animationFinished, setAnimationFinished] = useState(false);


useEffect(() => {
const circleData = [
{ category: "New", color: "Black" },
{ category: "People", color: "Black" },
{ category: "Severity", color: "Black" },
{ category: "Less Severity", color: "Black" },
{ category: "Flagged", color: "Black" },
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
.style("filter", "url(#circle-shadow)")
.style("opacity", 0)
.style("transform", "scale(0)");


// Create the category names
const categoryNames = svg
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
.attr("fill", "white")
.style("opacity", 0);


// Event handlers for circle interactions
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


const xPadding = 15;
const xPosition = parseFloat(circleRadius) + textX + xPadding;
const yPosition = -parseFloat(circleRadius) + textY - xPadding;


g.append("text")
.attr("class", "close")
.attr("x", xPosition)
.attr("y", yPosition)
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
audio.volume = 0.02; // Set the volume for hover sound effect (0.6 = 60%)
audio.loop = true;
audio.play();
setAudioPlayed(true);
}
// Play the audio when a circle is clicked
if (!audioPlayed) {
const audio = new Audio(hoverSoundEffect);
audio.loop = false;
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
.transition()
.duration(1000)
.delay((d, i) => i * 200)
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
.on("end", () => {
setAnimationFinished(true);
throbbingAnimation();
});


categoryNames
.transition()
.duration(1000)
.delay(1000) // Delay the appearance of category names after the intro animation
.style("opacity", 1)
.style("transform", "scale(1)");
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
fontSize: "36px", // Reduced font size for a smaller title box
fontFamily: "'PT Serif', sans-serif",
color: "#ffffff", // White text color
borderRadius: "5px", // Slightly rounded corners
};


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




return (
<div style={containerStyle}>
<img src={splunkLogo} alt="Splunk Logo" style={{ width: "200px", margin: "20px auto", display: "block" }} />
<h1 style={titleStyle}>Outlook Emails</h1>
<div id="circle-container" ref={circleContainerRef}></div>
{animationFinished && selectedEmails.length > 0 && (
<div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "5px" }}>
<h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>Emails:</h2>
{selectedEmails.map((email, index) => (
<div key={index} style={{ margin: "10px 0" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ fontWeight: "bold" }}>From:</div>
<div>{email.From}</div>
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ fontWeight: "bold" }}>Subject:</div>
<div>{email.Subject}</div>
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ fontWeight: "bold" }}>Date:</div>
<div>{email.Date}</div>
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ fontWeight: "bold" }}>Body:</div>
<div>{email.Body}</div>
</div>
<hr style={{ margin: "10px 0", borderTop: "1px solid #ccc" }} />
</div>
))}
</div>
)}
{animationFinished && selectedEmails.length > 0 && (
<button
style={{ position: "fixed", bottom: "20px", right: "20px" }}
onClick={() => setScrollToTop(true)}
>
Scroll to Top
</button>
)}
<div style={ps3BackgroundStyles}></div>
</div>
);
}





