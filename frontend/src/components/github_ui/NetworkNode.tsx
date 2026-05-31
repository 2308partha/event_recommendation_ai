import React from 'react';
import type { GraphNode } from './AntigravityNetwork';
import { motion } from 'framer-motion';
import { User, Users, Star, Calendar } from 'lucide-react';

interface NetworkNodeProps {
  node: GraphNode;
  isHovered: boolean;
}

export const NetworkNode: React.FC<NetworkNodeProps> = ({ node, isHovered }) => {
  const isUser = node.type === 'user';
  const isEvent = node.type === 'event';
  const isSkill = node.type === 'skill';
  const isFriend = node.type === 'friend';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: isHovered ? 1.1 : 1 }}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
    >
      {isUser && (
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative w-20 h-20 bg-indigo-600 rounded-full flex flex-col items-center justify-center border-2 border-indigo-300 shadow-2xl">
            <User className="w-8 h-8 text-white" />
            <span className="text-[10px] font-bold text-white mt-1">YOU</span>
          </div>
        </div>
      )}

      {isEvent && (
        <div className="relative w-36 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className="p-3">
            <div className="flex justify-between items-start mb-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              {node.score && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400" />
                  {node.score}%
                </div>
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">
              {node.label}
            </h4>
          </div>
        </div>
      )}

      {isSkill && (
        <div className="px-4 py-1.5 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-600 shadow-lg flex items-center gap-2 hover:bg-slate-700 transition-colors">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-cyan-100">{node.label}</span>
        </div>
      )}

      {isFriend && (
        <div className="relative flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-sm rounded-full border border-pink-500/50 flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-pink-400" />
          </div>
          <span className="text-[10px] font-bold text-pink-200 bg-slate-900/80 px-2 py-0.5 rounded-md">
            {node.label}
          </span>
        </div>
      )}
    </motion.div>
  );
};
