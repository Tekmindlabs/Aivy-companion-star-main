'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphNode, GraphRelationship } from '@/lib/services/knowledge-graph';

interface KnowledgeGraphVisualizationProps {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export function KnowledgeGraphVisualization({
  nodes,
  relationships
}: KnowledgeGraphVisualizationProps) {
  const graphRef = useRef<any>();
  const [graphData, setGraphData] = useState<{
    nodes: {
      id: string;
      label: string;
      type: string;
      color: string;
      size: number;
      metadata: Record<string, any> | undefined;
    }[];
    links: {
      source: string;
      target: string;
      type: string;
      color: string;
      width: number;
      metadata: Record<string, any> | undefined;
    }[];
  }>({
    nodes: [],
    links: []
  });

  useEffect(() => {
    // Transform nodes and relationships into format expected by ForceGraph2D
    const transformedData = {
      nodes: nodes.map(node => ({
        id: node.id,
        label: node.label || node.id,
        type: node.type,
        color: getNodeColor(node.type),
        size: getNodeSize(node.type),
        metadata: node.metadata
      })),
      links: relationships.map(rel => ({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.relationshipType,
        color: getLinkColor(rel.relationshipType),
        width: 2,
        metadata: rel.metadata
      }))
    };

    setGraphData(transformedData);
  }, [nodes, relationships]);

  // Node color mapping based on content type
  const getNodeColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      document: '#4CAF50', // Green
      note: '#2196F3',    // Blue
      url: '#FFC107',     // Amber
      default: '#9E9E9E'  // Grey
    };
    return colorMap[type] || colorMap.default;
  };

  // Node size mapping based on content type
  const getNodeSize = (type: string): number => {
    const sizeMap: { [key: string]: number } = {
      document: 8,
      note: 6,
      url: 7,
      default: 5
    };
    return sizeMap[type] || sizeMap.default;
  };

  // Link color mapping based on relationship type
  const getLinkColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      references: '#757575',
      contains: '#616161',
      related: '#9E9E9E',
      default: '#BDBDBD'
    };
    return colorMap[type] || colorMap.default;
  };

  // Handle node click
  const handleNodeClick = (node: any) => {
    console.log('Clicked node:', node);
    // Implement node click behavior (e.g., show details, highlight connections)
  };

  // Handle link click
  const handleLinkClick = (link: any) => {
    console.log('Clicked link:', link);
    // Implement link click behavior
  };

  return (
    <div className="w-full h-[600px] border rounded-lg bg-white shadow-sm">
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No knowledge graph data available
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={node => `${node.label} (${node.type})`}
          nodeColor={node => node.color}
          nodeRelSize={6}
          linkColor={link => link.color}
          linkWidth={link => link.width}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          // Customization options
          backgroundColor="#ffffff"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          d3VelocityDecay={0.3}
          warmupTicks={100}
          cooldownTicks={50}
          onEngineStop={() => {
            console.log('Graph rendering completed');
          }}
          // Additional visual customizations
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.label;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(label, node.x, node.y + node.size + fontSize);
          }}
        />
      )}
    </div>
  );
}