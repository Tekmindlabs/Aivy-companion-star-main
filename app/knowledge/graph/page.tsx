'use client';

import React, { useEffect, useState } from 'react';
import { GraphNode, GraphRelationship } from '@/lib/services/knowledge-graph';
import dynamic from 'next/dynamic';

// Dynamic import of KnowledgeGraphVisualization with SSR disabled
const DynamicKnowledgeGraph = dynamic(
  () => import('@/components/KnowledgeGraphVisualization').then(mod => mod.KnowledgeGraphVisualization),
  { ssr: false }
);

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    relationships: GraphRelationship[];
  }>({ nodes: [], relationships: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching graph data...');
      const response = await fetch('/api/knowledge/graph');
      console.log('Graph API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Graph data received:', {
        nodeCount: data.nodes?.length,
        relationshipCount: data.relationships?.length
      });
      
      if (!Array.isArray(data.nodes) || !Array.isArray(data.relationships)) {
        console.warn('Invalid graph data structure:', data);
        throw new Error('Invalid data structure received from API');
      }
  
      setGraphData({
        nodes: data.nodes,
        relationships: data.relationships
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching graph data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchGraphData();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Knowledge Graph</h1>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading knowledge graph...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow h-[600px]">
          <DynamicKnowledgeGraph 
            nodes={graphData.nodes}
            relationships={graphData.relationships}
          />
        </div>
      )}

      {!isLoading && graphData.nodes.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg mt-4">
          <p className="text-gray-600">
            No knowledge graph data available. Start by adding some documents or notes.
          </p>
        </div>
      )}

      {!isLoading && graphData.nodes.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Showing {graphData.nodes.length} nodes and {graphData.relationships.length} relationships
          </p>
        </div>
      )}
    </div>
  );
}