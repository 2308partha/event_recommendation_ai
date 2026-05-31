import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { NetworkNode } from './NetworkNode';
import { SlidersHorizontal, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: 'user' | 'friend' | 'skill' | 'event';
  label: string;
  score?: number;
  group?: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'user_skill' | 'event_skill' | 'user_friend' | 'friend_event';
}

const generateMockData = (): { nodes: GraphNode[], links: GraphLink[] } => {
  const nodes: GraphNode[] = [
    { id: 'user', type: 'user', label: 'You (Partha)', group: 0 },
    
    { id: 'f1', type: 'friend', label: 'Alex', group: 1 },
    { id: 'f2', type: 'friend', label: 'Sam', group: 1 },
    
    { id: 's1', type: 'skill', label: 'React', group: 2 },
    { id: 's2', type: 'skill', label: 'AI/ML', group: 2 },
    { id: 's3', type: 'skill', label: 'UI/UX', group: 2 },
    
    { id: 'e1', type: 'event', label: 'Web3 Hackathon', score: 85, group: 3 },
    { id: 'e2', type: 'event', label: 'AI Workshop', score: 98, group: 3 },
    { id: 'e3', type: 'event', label: 'Design Sprint', score: 72, group: 3 },
    { id: 'e4', type: 'event', label: 'React Conf', score: 91, group: 3 },
  ];

  const links: GraphLink[] = [
    { source: 'user', target: 's1', type: 'user_skill' },
    { source: 'user', target: 's2', type: 'user_skill' },
    { source: 'user', target: 's3', type: 'user_skill' },
    { source: 'user', target: 'f1', type: 'user_friend' },
    { source: 'user', target: 'f2', type: 'user_friend' },
    
    { source: 'e2', target: 's2', type: 'event_skill' },
    { source: 'e3', target: 's3', type: 'event_skill' },
    { source: 'e4', target: 's1', type: 'event_skill' },
    
    { source: 'f1', target: 'e1', type: 'friend_event' },
    { source: 'f2', target: 'e2', type: 'friend_event' },
  ];

  return { nodes, links };
};

export const AntigravityNetwork: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Algorithm Weights
  const [skillWeight, setSkillWeight] = useState(50);
  const [socialWeight, setSocialWeight] = useState(50);

  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Initialize Data
  useEffect(() => {
    const { nodes: mockNodes, links: mockLinks } = generateMockData();
    setNodes(mockNodes);
    setLinks(mockLinks);
  }, []);

  // Initialize D3 Physics
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create a fresh simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => {
        if (d.type === 'user') return 60;
        if (d.type === 'event') return 70;
        return 40;
      }).iterations(2))
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id));

    simulation.on("tick", () => {
      // Force React to re-render nodes and links with new x/y
      setNodes([...simulation.nodes()]);
      
      // Update link positions
      const linkForce = simulation.force("link") as d3.ForceLink<GraphNode, GraphLink>;
      if (linkForce) {
        setLinks([...linkForce.links()]);
      }
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes.length]); // Re-run only on mount after data loads

  // Update Link Forces based on weights
  useEffect(() => {
    if (!simulationRef.current) return;
    
    const linkForce = simulationRef.current.force("link") as d3.ForceLink<GraphNode, GraphLink>;
    
    if (linkForce) {
      linkForce.distance((link) => {
        // Shorter distance = stronger pull
        if (link.type === 'user_skill' || link.type === 'event_skill') {
          return 200 - (skillWeight * 1.5);
        }
        if (link.type === 'user_friend' || link.type === 'friend_event') {
          return 200 - (socialWeight * 1.5);
        }
        return 100;
      });
      
      // Give the simulation a small kick to adjust to new physics
      simulationRef.current.alpha(0.3).restart();
    }
  }, [skillWeight, socialWeight]);

  // Handle Dragging
  const setupDrag = (elementId: string, node: GraphNode) => {
    const el = document.getElementById(elementId);
    if (!el || !simulationRef.current) return;

    const drag = d3.drag<HTMLElement, unknown>()
      .on("start", (e) => {
        if (!e.active) simulationRef.current?.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
      })
      .on("drag", (e) => {
        node.fx = e.x;
        node.fy = e.y;
      })
      .on("end", (e) => {
        if (!e.active) simulationRef.current?.alphaTarget(0);
        node.fx = null;
        node.fy = null;
      });

    d3.select(el).call(drag);
  };

  // Memoize path finding
  const activePath = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    
    const path = new Set<string>();
    path.add(hoveredNode);
    
    // Simple 2-hop traversal to User
    links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      
      if (sourceId === hoveredNode) path.add(targetId);
      if (targetId === hoveredNode) path.add(sourceId);
    });

    // 2nd hop to find connections to user
    const secondHop = new Set(path);
    links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      
      if (path.has(sourceId)) secondHop.add(targetId);
      if (path.has(targetId)) secondHop.add(sourceId);
    });
    
    return secondHop;
  }, [hoveredNode, links]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-slate-950 overflow-hidden flex" ref={containerRef}>
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Glassmorphic Control Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20 w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-4 text-white">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold">Algorithm Weights</h3>
        </div>
        
        <div className="space-y-5 text-sm text-slate-300">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label>Skill Match</label>
              <span className="font-mono text-indigo-400">{skillWeight}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={skillWeight}
              onChange={(e) => setSkillWeight(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label>Social Graph</label>
              <span className="font-mono text-pink-400">{socialWeight}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={socialWeight}
              onChange={(e) => setSocialWeight(Number(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 rounded-lg appearance-none h-1.5"
            />
          </div>
        </div>

        <div className="mt-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-3 text-xs text-indigo-200">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Drag nodes to pin them. Adjust sliders to pull events closer via magnetic relational forces.</p>
        </div>
      </motion.div>

      {/* SVG layer for Links */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {links.map((link, i) => {
          const source = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
          const target = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);
          
          if (!source || !target) return null;

          const isDimmed = hoveredNode ? (!activePath.has(source.id) || !activePath.has(target.id)) : false;
          
          let strokeColor = "stroke-slate-700/50";
          if (link.type === 'user_skill' || link.type === 'event_skill') strokeColor = "stroke-indigo-500/50";
          if (link.type === 'user_friend' || link.type === 'friend_event') strokeColor = "stroke-pink-500/50";

          return (
            <line
              key={`link-${i}`}
              x1={source.x || 0}
              y1={source.y || 0}
              x2={target.x || 0}
              y2={target.y || 0}
              className={`transition-opacity duration-300 ${strokeColor} ${isDimmed ? 'opacity-10' : 'opacity-100'}`}
              strokeWidth={isDimmed ? 1 : 2}
            />
          );
        })}
      </svg>

      {/* HTML layer for Nodes */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {nodes.map(node => {
          const isDimmed = hoveredNode ? !activePath.has(node.id) : false;
          
          return (
            <div
              id={`node-${node.id}`}
              key={node.id}
              ref={(el) => {
                if (el) setupDrag(el.id, node);
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute top-0 left-0 pointer-events-auto"
              style={{
                transform: `translate(${node.x || 0}px, ${node.y || 0}px) translate(-50%, -50%)`,
                transition: 'opacity 0.3s ease',
                opacity: isDimmed ? 0.2 : 1
              }}
            >
              <NetworkNode node={node} isHovered={hoveredNode === node.id} />
            </div>
          );
        })}
      </div>

    </div>
  );
};
