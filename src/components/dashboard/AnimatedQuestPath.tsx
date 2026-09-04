import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAssessmentStore } from '../../store/assessmentStore';

const MODULE_ROUTES = ['driving', 'listening', 'cognitive', 'pattern', 'grammar'] as const;

const MODULE_META: Record<string, { label: string; icon: string; subtitle: string }> = {
  driving: { label: 'Urban Perception & Hazard', icon: 'radar', subtitle: 'LiDAR & Pedestrian tracking' },
  listening: { label: 'Fleet Comm & Dispatch', icon: 'cell_tower', subtitle: 'Dispatch protocols & priority cues' },
  cognitive: { label: 'Trajectory & Spatial Nav', icon: 'navigation', subtitle: 'Route optimization & intersection decisions' },
  pattern: { label: 'Pattern Perception', icon: 'grid_view', subtitle: 'Visual pattern recognition & sequencing' },
  grammar: { label: 'Autonomous Capstone', icon: 'verified', subtitle: 'Written communication & grammar rules' },
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
};

export function AnimatedQuestPath() {
  const prefersReduced = useReducedMotion();
  const navigate = useNavigate();
  const { results } = useAssessmentStore();

  const completedCount = Object.values(results).filter(r => r.completed).length;

  return (
    <div className="relative py-6 select-none bg-gradient-to-b from-slate-50/50 via-white to-slate-50/40 rounded-2xl border border-slate-100 p-4 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#0A1128_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Animated Trajectory Path SVG */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" fill="none" preserveAspectRatio="none" viewBox="0 0 500 760">
        <circle cx="250" cy="380" r="180" stroke="#CBD5E1" strokeDasharray="4 4" strokeWidth="1" />
        <circle cx="250" cy="380" r="300" stroke="#CBD5E1" strokeDasharray="6 6" strokeWidth="1" />
        <motion.path
          d="M 250 60 C 380 110, 410 190, 250 230 C 90 270, 90 360, 250 400 C 400 440, 400 530, 250 570 C 130 610, 160 680, 250 710"
          opacity="0.8" stroke="#CBD5E1" strokeLinecap="round" strokeWidth="32"
          initial={prefersReduced ? { opacity: 0.8 } : { opacity: 0, pathLength: 0 }}
          animate={{ opacity: 0.8, pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M 250 60 C 380 110, 410 190, 250 230 C 90 270, 90 360, 250 400 C 400 440, 400 530, 250 570 C 130 610, 160 680, 250 710"
          stroke="#94A3B8" strokeDasharray="8 12" strokeLinecap="round" strokeWidth="2"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
        {/* Completed trajectory glow — pathLength tracks completedCount / 5 */}
        <motion.path
          d="M 250 60 C 380 110, 410 190, 250 230 C 90 270, 90 360, 250 400 C 400 440, 400 530, 250 570 C 130 610, 160 680, 250 710"
          filter="drop-shadow(0 2px 8px rgba(0,210,196,0.6))"
          stroke="url(#progressGradient)" strokeLinecap="round" strokeWidth="6"
          initial={prefersReduced ? { opacity: completedCount > 0 ? 1 : 0, pathLength: completedCount / 5 } : { opacity: 0, pathLength: 0 }}
          animate={{
            opacity: completedCount > 0 ? 1 : 0,
            pathLength: completedCount / 5,
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#00A3FF" />
            <stop offset="60%" stopColor="#00D2C4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

      {/* WAYPOINT NODES */}
      <motion.div
        className="relative z-10 flex flex-col items-center space-y-12 sm:space-y-14"
        variants={prefersReduced ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {MODULE_ROUTES.map((id, i) => {
          const meta = MODULE_META[id];
          const result = results[id];
          const completed = !!result?.completed;
          const score = result ? `${result.score}/${result.total}` : null;
          // Active = next uncompleted node
          const nextUncompleted = MODULE_ROUTES.find(r => !results[r]?.completed);
          const isActive = id === nextUncompleted;

          // Offset pattern: center, right, center, left, center
          const offsetClass = i % 2 === 0
            ? ''
            : i === 1 ? 'sm:translate-x-28' : 'sm:-translate-x-24';

          if (isActive) {
            return (
              <motion.div
                key={id}
                className={`flex flex-col items-center group cursor-pointer ${offsetClass}`}
                variants={prefersReduced ? undefined : nodeVariants}
                whileHover={prefersReduced ? undefined : { scale: 1.05 }}
                onClick={() => navigate(`/${id}`)}
              >
                <div className="relative">
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
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                  </button>
                  <motion.span
                    className="absolute -top-1 -right-2 px-2 py-0.5 bg-gradient-to-r from-primary to-sensor-cyan text-white text-[10px] font-label-telemetry font-extrabold rounded-full shadow tracking-wider"
                    animate={prefersReduced ? {} : { opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ACTIVE
                  </motion.span>
                </div>
                <div className="mt-3 px-4 py-2.5 rounded-2xl bg-white border-2 border-sensor-cyan/80 text-center shadow-md max-w-xs group-hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center gap-1 text-sensor-cyan text-[11px] font-label-telemetry font-bold uppercase mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sensor-cyan" />
                    START MODULE
                  </div>
                  <h3 className="text-sm font-headline-sm font-bold text-midnight-slate">Node {i + 1}: {meta.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
                </div>
              </motion.div>
            );
          }

          if (completed) {
            return (
              <motion.div
                key={id}
                className={`flex flex-col items-center group cursor-pointer ${offsetClass}`}
                variants={prefersReduced ? undefined : nodeVariants}
                whileHover={prefersReduced ? undefined : { scale: 1.05, y: -6 }}
                onClick={() => navigate(`/${id}`)}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-telemetry-emerald flex items-center justify-center shadow-md relative z-10">
                    <div className="w-12 h-12 rounded-full bg-telemetry-emerald/10 text-telemetry-emerald flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-telemetry-emerald text-white rounded-full flex items-center justify-center text-xs font-bold shadow">✓</span>
                </div>
                <div className="mt-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-center max-w-xs transition-all group-hover:border-telemetry-emerald group-hover:shadow-md">
                  {score && (
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-[11px] font-label-telemetry text-slate-500 font-bold">{score}</span>
                    </div>
                  )}
                  <h3 className="text-xs font-headline-sm font-bold text-midnight-slate">Node {i + 1}: {meta.label}</h3>
                  <p className="text-[11px] font-body-sm text-slate-500">{meta.subtitle}</p>
                </div>
              </motion.div>
            );
          }

          // Locked
          return (
            <motion.div
              key={id}
              className={`flex flex-col items-center opacity-75 hover:opacity-90 transition-opacity ${offsetClass}`}
              variants={prefersReduced ? undefined : nodeVariants}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-2xl text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center shadow">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </span>
              </div>
              <div className="mt-2.5 px-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-xs">
                <h3 className="text-xs font-headline-sm font-bold text-slate-600">Node {i + 1}: {meta.label}</h3>
                <span className="text-[11px] font-label-telemetry text-slate-400">{meta.subtitle}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
