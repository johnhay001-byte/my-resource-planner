import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const NetworkView = ({ data, onNodeClick }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const allNodes = [];
        const allLinks = [];
        const nodeMap = new Map();

        const addNode = (node) => {
            if (!nodeMap.has(node.id)) {
                nodeMap.set(node.id, node);
                allNodes.push({ ...node });
            }
        };

        data.forEach(client => {
            addNode(client);
            (client.children || []).forEach(program => {
                addNode(program);
                allLinks.push({ source: client.id, target: program.id });
                (program.children || []).forEach(project => {
                    addNode(project);
                    allLinks.push({ source: program.id, target: project.id });
                    (project.children || []).forEach(person => {
                        addNode(person);
                        allLinks.push({ source: project.id, target: person.id });
                    });
                });
            });
        });
        
        const svg = d3.select(svgRef.current);
        const width = svg.node().getBoundingClientRect().width;
        const height = svg.node().getBoundingClientRect().height;

        svg.selectAll("*").remove();

        const simulation = d3.forceSimulation(allNodes)
            .force("link", d3.forceLink(allLinks).id(d => d.id).distance(70))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));

        const link = svg.append("g")
            .attr("stroke", "#999").attr("stroke-opacity", 0.6)
            .selectAll("line").data(allLinks).join("line").attr("stroke-width", 1.5);

        const node = svg.append("g").selectAll("g").data(allNodes).join("g")
            .attr("cursor", "pointer").on("click", (event, d) => onNodeClick(d)).call(drag(simulation));
        
        const typeColors = { client: '#6b21a8', program: '#1d4ed8', project: '#4338ca', person: '#16a34a' };

        node.append("circle")
            .attr("r", d => d.type === 'person' ? 10 : d.type === 'project' ? 15 : 20)
            .attr("fill", d => typeColors[d.type] || '#ccc').attr("stroke", "#fff").attr("stroke-width", 2);

        node.append("text")
            .attr("x", d => d.type === 'person' ? 14 : 24).attr("y", "0.31em")
            .text(d => d.name).attr("font-size", "12px").attr("font-weight", d => d.type === 'client' ? 'bold' : 'normal');

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function drag(simulation) {
            function dragstarted(event) { if (!event.active) simulation.alphaTarget(0.3).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y; }
            function dragged(event) { event.subject.fx = event.x; event.subject.fy = event.y; }
            function dragended(event) { if (!event.active) simulation.alphaTarget(0); event.subject.fx = null; event.subject.fy = null; }
            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

    }, [data, onNodeClick]);


    return <svg ref={svgRef} className="w-full h-full bg-gray-50 rounded-lg"></svg>;
};

