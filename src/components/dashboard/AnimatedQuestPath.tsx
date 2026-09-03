import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const nodes = [
  { id: 'driving', label: 'Urban Perception & Hazard', icon: 'radar', completed: true, score: '3/3', subtitle: 'LiDAR & Pedestrian tracking • 100% Score' },
  { id: 'listening', label: 'Fleet Comm & Dispatch', icon: 'cell_tower', completed: true, score: '3/3', subtitle: 'Dispatch protocols & priority cues' },
  { id: 'cognitive', label: 'Trajectory & Spatial Nav', icon: 'navigation', active: true, subtitle: 'Route optimization & complex intersection decisioning' },
  { id: 'pattern', label: 'Pattern Perception', icon: 'lock', locked: true, subtitle: 'Unlocks after Node 3' },
  { id: 'grammar', label: 'Autonomous Capstone', icon: 'verified', locked: true, subtitle: 'Grand Waymo Evaluator Star' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const nodeVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function AnimatedQuestPath() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative py-6 select-none bg-gradient-to-b from-slate-50/50 via-white to-slate-50/40 rounded-2xl border border-slate-100 p-4 overflow-hidden">
      {/* Technical coordinate grid background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#0A1128_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* Animated Trajectory Path SVG */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" fill="none" preserveAspectRatio="none" viewBox="0 0 500 760">
        {/* Radar range circles */}
        <circle cx="250" cy="380" r="180" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
        <circle cx="250" cy="380" r="300" stroke="#E2E8F0" strokeDasharray="6 6" strokeWidth="1" />
        
        {/* Outer road lane corridor */}
        <motion.path
          d="M 250 60 C 380 110, 410 190, 250 230 C 90 270, 90 360, 250 400 C 400 440, 400 530, 250 570 C 130 610, 160 680, 250 710"
          opacity="0.6"
          stroke="#E2E8F0"
          strokeLinecap="round"
          strokeWidth="32"
          initial={prefersReduced ? { opacity: 0.6 } : { opacity: 0, pathLength: 0 }}
          animate={{ opacity: 0.6, pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        
        {/* Road centerline markers */}
        <motion.path
          d="M 250 60 C 380 110, 410 190, 250 230 C 90 270, 90 360, 250 400 C 400 440, 400 530, 250 570 C 130 610, 160 680, 250 710"
          stroke="#CBD5E1"
          strokeDasharray="8 12"
          strokeLinecap="round"
          strokeWidth="2"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
        
        {/* Completed Trajectory Glowing Neon Line */}
        <motion.path
          d="M 250 60 C 380 110, 410 190, 250 230 C 170 250, 110 300, 150 340 C 170 360, 210 380, 250 400"
          filter="drop-shadow(0 2px 8px rgba(0,210,196,0.6))"
          stroke="url(#waymoGradient)"
          strokeLinecap="round"
          strokeWidth="6"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        />
        
        <defs>
          <linearGradient id="waymoGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#00A3FF" />
            <stop offset="60%" stopColor="#00D2C4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

      {/* WAYPOINT NODES STACK */}
      <motion.div
        className="relative z-10 flex flex-col items-center space-y-12 sm:space-y-14"
        variants={prefersReduced ? undefined : containerVariants}
        initial={prefersReduced ? 'visible' : 'hidden'}
        animate="visible"
      >
        {/* NODE 1: Completed - Urban Perception & Hazard Anticipation */}
        <motion.div
          className="flex flex-col items-center group cursor-pointer"
          variants={prefersReduced ? undefined : nodeVariants}
          whileHover={prefersReduced ? undefined : { scale: 1.05, y: -6 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-telemetry-emerald flex items-center justify-center shadow-md relative z-10">
              <div className="w-12 h-12 rounded-full bg-telemetry-emerald/10 text-telemetry-emerald flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" data-icon="radar" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-telemetry-emerald text-white rounded-full flex items-center justify-center text-xs font-bold shadow">✓</span>
          </div>
          <div className="mt-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-center max-w-xs transition-all group-hover:border-telemetry-emerald">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
              <span className="material-symbols-outlined text-xs" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-xs" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-xs" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-[11px] font-label-telemetry text-slate-500 font-bold ml-1">{nodes[0].score}</span>
            </div>
            <h3 className="text-xs font-headline-sm font-bold text-midnight-slate">Node 1: {nodes[0].label}</h3>
            <p className="text-[11px] font-body-sm text-slate-500">{nodes[0].subtitle}</p>
          </div>
        </motion.div>

        {/* NODE 2: Completed - Audio & Dispatch Protocols (Offset Right) */}
        <motion.div
          className="flex flex-col items-center sm:translate-x-28 group cursor-pointer"
          variants={prefersReduced ? undefined : nodeVariants}
          whileHover={prefersReduced ? undefined : { scale: 1.05, y: -6 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-sensor-cyan flex items-center justify-center shadow-md relative z-10">
              <div className="w-12 h-12 rounded-full bg-sensor-cyan/10 text-sensor-cyan flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" data-icon="cell_tower" style={{ fontVariationSettings: "'FILL' 1" }}>cell_tower</span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-sensor-cyan text-white rounded-full flex items-center justify-center text-xs font-bold shadow">✓</span>
          </div>
          <div className="mt-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-center max-w-xs transition-all group-hover:border-sensor-cyan">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
              <span className="material-symbols-outlined text-xs" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-xs" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-xs" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-[11px] font-label-telemetry text-slate-500 font-bold ml-1">{nodes[1].score}</span>
            </div>
            <h3 className="text-xs font-headline-sm font-bold text-midnight-slate">Node 2: {nodes[1].label}</h3>
            <p className="text-[11px] font-body-sm text-slate-500">{nodes[1].subtitle}</p>
          </div>
        </motion.div>

        {/* NODE 3: Active Current Stage - Trajectory & Spatial Navigation */}
        <motion.div
          className="flex flex-col items-center group cursor-pointer"
          variants={prefersReduced ? undefined : nodeVariants}
          whileHover={prefersReduced ? undefined : { scale: 1.05 }}
        >
          <div className="relative">
            {/* Radar Sweep Arc Effect */}
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-sensor-cyan/60"
              animate={prefersReduced ? {} : { rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute -inset-2 rounded-full bg-sensor-cyan/20"
              animate={prefersReduced ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <button className="relative w-20 h-20 rounded-full bg-midnight-slate text-sensor-cyan flex items-center justify-center shadow-xl border-4 border-white focus:outline-none">
              <span className="material-symbols-outlined text-3xl" data-icon="navigation" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
            </button>
            <motion.span
              className="absolute -top-1 -right-2 px-2 py-0.5 bg-gradient-to-r from-primary to-sensor-cyan text-white text-[10px] font-label-telemetry font-extrabold rounded-full shadow tracking-wider"
              animate={prefersReduced ? {} : { opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ACTIVE
            </motion.span>
          </div>
          <div className="mt-3 px-4 py-2.5 rounded-2xl bg-white border-2 border-sensor-cyan/80 text-center shadow-md max-w-xs">
            <div className="inline-flex items-center gap-1 text-sensor-cyan text-[11px] font-label-telemetry font-bold uppercase mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sensor-cyan" />
              NEXT DESTINATION
            </div>
            <h3 className="text-sm font-headline-sm font-bold text-midnight-slate">Node 3: {nodes[2].label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{nodes[2].subtitle}</p>
          </div>
        </motion.div>

        {/* NODE 4: Locked - Predictive Pattern Perception (Offset Left) */}
        <motion.div
          className="flex flex-col items-center sm:-translate-x-24 opacity-60 hover:opacity-90 transition-opacity"
          variants={prefersReduced ? undefined : nodeVariants}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shadow-sm border-2 border-slate-200">
              <span className="material-symbols-outlined text-2xl text-slate-400" data-icon="lock">lock</span>
            </div>
          </div>
          <div className="mt-2.5 px-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-xs">
            <h3 className="text-xs font-headline-sm font-bold text-slate-600">Node 4: {nodes[3].label}</h3>
            <span className="text-[11px] font-label-telemetry text-slate-400">{nodes[3].subtitle}</span>
          </div>
        </motion.div>

        {/* NODE 5: Locked - Autonomous Operations Capstone (Center) */}
        <motion.div
          className="flex flex-col items-center opacity-50"
          variants={prefersReduced ? undefined : nodeVariants}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shadow-sm border-2 border-slate-200">
              <span className="material-symbols-outlined text-2xl" data-icon="verified">verified</span>
            </div>
            <span className="absolute -top-1 -right-1 material-symbols-outlined text-sm text-slate-400" data-icon="lock">lock</span>
          </div>
          <div className="mt-2.5 px-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <h3 className="text-xs font-headline-sm font-bold text-slate-600">Node 5: {nodes[4].label}</h3>
            <span className="text-[11px] font-label-telemetry text-slate-400">{nodes[4].subtitle}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
