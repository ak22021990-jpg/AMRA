import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { AnimatedQuestPath } from '../components/dashboard/AnimatedQuestPath';
import { PillButton } from '../components/ui/PillButton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { candidateName, setCandidate, results } = useAssessmentStore();
  if (!candidateName) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sensor-cyan/10 border border-sensor-cyan/20 text-sensor-cyan text-xs font-label-telemetry font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-sensor-cyan animate-pulse"></span>
              DRIVEREADY AV-OS
            </div>
            <h1 className="text-3xl md:text-4xl font-headline-lg font-bold text-midnight-slate tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sensor-cyan to-sky-500">AMRA</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
              The Autonomous Mobility Readiness Assessment. We evaluate your natural situational calmness, obstacle anticipation, and passenger-first navigation instincts.
            </p>
          </div>

          {/* Guidelines Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sensor-cyan/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-sensor-cyan text-lg">route</span>
              </div>
              <h3 className="text-xs font-headline-sm font-bold text-midnight-slate">5 Assessment Modules</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Driving, Listening, Cognitive, Pattern, and Grammar — each testing a core autonomous navigation skill.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-telemetry-emerald/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-telemetry-emerald text-lg">schedule</span>
              </div>
              <h3 className="text-xs font-headline-sm font-bold text-midnight-slate">Take Your Time</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">No trick questions or ticking clocks. Pause anytime — your progress saves automatically.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-600 text-lg">bolt</span>
              </div>
              <h3 className="text-xs font-headline-sm font-bold text-midnight-slate">Earn XP &amp; Badges</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Build streaks, unlock achievements, and earn your certification score.</p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/50">
            <h2 className="text-lg font-headline-sm font-bold text-midnight-slate mb-1">Initialize Your Telemetry Profile</h2>
            <p className="text-xs text-slate-500 mb-5">We need your details to track your assessment progress and results.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setCandidate(fd.get('name') as string, fd.get('email') as string);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-label-telemetry font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-midnight-slate placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sensor-cyan/40 focus:border-sensor-cyan transition-all" placeholder="e.g. Alex Morgan" />
                </div>
                <div>
                  <label className="block text-xs font-label-telemetry font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-midnight-slate placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sensor-cyan/40 focus:border-sensor-cyan transition-all" placeholder="alex.morgan@example.com" />
                </div>
                <button type="submit" className="w-full bg-midnight-slate text-white rounded-xl py-3.5 font-headline-sm font-bold text-sm tracking-wide hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 mt-2">
                  <span>Begin Assessment</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[11px] text-slate-400 font-label-telemetry">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">shield</span> Secure &amp; Private</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">cloud_sync</span> Auto-Save Progress</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">restart_alt</span> Retake Anytime</span>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = Object.values(results).filter(r => r.completed).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-midnight-slate text-white p-6 md:p-8">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-sensor-cyan/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00D2C4_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative z-10">
          <div className="max-w-xl space-y-3.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sensor-cyan text-xs font-label-telemetry">
              <span className="w-2 h-2 rounded-full bg-sensor-cyan animate-pulse"></span>
              AUTONOMOUS ASSESSMENT
            </div>
            <h1 className="text-2xl md:text-4xl font-headline-lg font-bold text-white tracking-tight leading-snug">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sensor-cyan to-sky-400">{candidateName}.</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {completedCount === 0
                ? 'Begin your autonomous mobility assessment. Five modules test your situational calmness, hazard perception, and passenger-first instincts.'
                : completedCount < 5
                  ? `You've cleared ${completedCount} of 5 modules. Keep going — your next waypoint awaits.`
                  : 'All modules complete! View your final assessment report.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              {completedCount < 5 ? (
                <PillButton variant="primary" onClick={() => {
                  const moduleRoutes = ['driving', 'listening', 'cognitive', 'pattern', 'grammar'];
                  const nextModule = moduleRoutes.find(r => !results[r]?.completed) || 'driving';
                  navigate(`/${nextModule}`);
                }} className="!text-midnight-slate">
                  <span className="flex items-center gap-2">
                    <span>{completedCount === 0 ? 'Start Assessment' : 'Continue Mission'}</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </span>
                </PillButton>
              ) : (
                <PillButton variant="primary" onClick={() => navigate('/results')} className="!text-midnight-slate">
                  <span className="flex items-center gap-2">
                    <span>View Final Report</span>
                    <span className="material-symbols-outlined text-lg">assessment</span>
                  </span>
                </PillButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Path */}
      <section className="bg-white rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">alt_route</span>
              <h2 className="text-xl font-headline-lg font-bold text-midnight-slate">Assessment Trajectory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Complete all 5 modules to unlock your final report.</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-label-telemetry text-slate-400 font-bold uppercase tracking-wider">Modules Cleared</span>
            <div className="text-base font-label-telemetry font-bold text-sensor-cyan flex items-center justify-end gap-1">
              <span className="material-symbols-outlined text-base text-telemetry-emerald">check_circle</span>
              {completedCount} / 5
            </div>
          </div>
        </div>
        <AnimatedQuestPath />
      </section>

      {/* Module Quick-Start Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'driving', title: 'Urban Perception & Hazard', icon: 'radar', desc: 'Driving scenario video questions', color: 'telemetry-emerald' },
          { id: 'listening', title: 'Fleet Comm & Dispatch', icon: 'cell_tower', desc: 'Audio comprehension & dispatch protocols', color: 'sensor-cyan' },
          { id: 'cognitive', title: 'Trajectory & Spatial Nav', icon: 'navigation', desc: 'Route optimization & intersection decisions', color: 'sky-500' },
          { id: 'pattern', title: 'Pattern Perception', icon: 'grid_view', desc: 'Visual pattern recognition & sequencing', color: 'violet-500' },
          { id: 'grammar', title: 'Autonomous Capstone', icon: 'verified', desc: 'Written communication & grammar rules', color: 'amber-500' },
        ].map(m => {
          const done = !!results[m.id]?.completed;
          const score = results[m.id];
          return (
            <button
              key={m.id}
              onClick={() => navigate(`/${m.id}`)}
              className={`text-left p-5 rounded-2xl border transition-all hover:shadow-md active:scale-[0.98] ${
                done
                  ? 'bg-telemetry-emerald/5 border-telemetry-emerald/30'
                  : 'bg-white border-slate-200 hover:border-sensor-cyan'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? 'bg-telemetry-emerald/10 text-telemetry-emerald' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-xl">{done ? 'check_circle' : m.icon}</span>
                </div>
                {done && score && (
                  <span className="text-xs font-label-telemetry font-bold text-telemetry-emerald">{score.score}/{score.total}</span>
                )}
              </div>
              <h3 className="text-sm font-headline-sm font-bold text-midnight-slate mb-0.5">{m.title}</h3>
              <p className="text-[11px] text-slate-500">{m.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
