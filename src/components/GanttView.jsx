import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './Gantt.css'; // We'll create this file for styling

export const GanttView = ({ tasks }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        if (!tasks || tasks.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        svg.selectAll("*").remove(); // Clear previous renders

        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const width = 800 - margin.left - margin.right;
        const height = tasks.length * 40; // 40px per task bar

        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // Parse dates
        const parsedTasks = tasks.map(d => ({
            ...d,
            startDate: new Date(d.startDate),
            endDate: new Date(d.endDate)
        }));

        // Set up scales
        const x = d3.scaleTime()
            .domain([d3.min(parsedTasks, d => d.startDate), d3.max(parsedTasks, d => d.endDate)])
            .range([0, width])
            .nice();

        const y = d3.scaleBand()
            .domain(parsedTasks.map(d => d.name))
            .range([0, height])
            .padding(0.2);

        // Add X-axis
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));

        // Add Y-axis
        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("class", "y-axis-label");


        // Draw bars
        g.selectAll(".bar")
            .data(parsedTasks)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("y", d => y(d.name))
            .attr("x", d => x(d.startDate))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.endDate) - x(d.startDate))
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                       .html(`
                           <strong>${d.name}</strong><br/>
                           Start: ${d.startDate.toLocaleDateString()}<br/>
                           End: ${d.endDate.toLocaleDateString()}
                       `)
                       .style("left", `${event.pageX + 15}px`)
                       .style("top", `${event.pageY - 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

    }, [tasks]);

    return (
        <div className="gantt-container">
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} className="gantt-tooltip"></div>
        </div>
    );
};