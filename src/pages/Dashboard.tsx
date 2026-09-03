import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { AnimatedQuestPath } from '../components/dashboard/AnimatedQuestPath';

export default function Dashboard() {
  const navigate = useNavigate();
  const { candidateName, setCandidate, results, xp, currentStreak, allModulesComplete } = useAssessmentStore();
  const [sfxEnabled, setSfxEnabled] = useState(true);

  if (!candidateName) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="bg-surface-card border border-outline-variant/30 rounded-3xl p-8 max-w-md w-full shadow-lg">
          <h2 className="text-headline-md font-bold text-midnight-slate mb-6">Initialize Telemetry Profile</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setCandidate(fd.get('name') as string, fd.get('email') as string);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-label-telemetry text-slate-500 mb-2">Full Name</label>
                <input name="name" required className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-body-md" placeholder="Candidate Name" />
              </div>
              <div>
                <label className="block text-label-telemetry text-slate-500 mb-2">Email</label>
                <input name="email" type="email" required className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-body-md" placeholder="candidate@example.com" />
              </div>
              <button type="submit" className="w-full bg-primary text-white rounded-xl py-4 font-bold mt-4 hover:bg-primary/90 transition-colors">
                AUTHORIZE PROFILE →
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Hardcode the sidebar and main layout from hub_jsx
  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-sensor-cyan selection:text-midnight-slate">
      
{/* TOP APP BAR (Waymo Autonomous Styling) */}
<header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 max-w-7xl mx-auto h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
{/* Left: Brand Logo & Title */}
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-2xl bg-midnight-slate flex items-center justify-center text-white shadow-sm border border-slate-800 relative overflow-hidden group">
<div className="absolute inset-0 bg-gradient-to-tr from-lidar-beam/30 to-sensor-cyan/20"></div>
<span className="material-symbols-outlined text-xl text-sensor-cyan relative z-10" data-icon="sensors">sensors</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="text-base md:text-lg font-headline-sm text-midnight-slate font-extrabold tracking-tight">DriveReady</span>
<span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-label-telemetry font-medium">AV-OS</span>
</div>
<span className="text-[11px] font-label-telemetry text-slate-500 font-medium tracking-wide">AUTONOMOUS MOBILITY EVALUATION</span>
</div>
</div>
{/* Center: Main Top Navigation Links */}
<nav className="hidden md:flex items-center gap-7 text-sm">
<a className="text-midnight-slate font-bold border-b-2 border-sensor-cyan pb-1 flex items-center gap-1.5 transition-colors" href="#quest-map">
<span className="material-symbols-outlined text-lg text-sensor-cyan" data-icon="polyline" style={{ fontVariationSettings: "'FILL' 1" }}>polyline</span>
        Trajectory Map
      </a>
<a className="text-slate-500 hover:text-midnight-slate font-medium transition-colors flex items-center gap-1" href="#challenges">
        Perception Modules
      </a>
<a className="text-slate-500 hover:text-midnight-slate font-medium transition-colors" href="#leaderboard">
        Fleet Leaderboard
      </a>
<a className="text-slate-500 hover:text-midnight-slate font-medium transition-colors" href="#badges">
        Telemetry Badges
      </a>
</nav>
{/* Right: Telemetry Chips & Candidate Profile */}
<div className="flex items-center gap-2 sm:gap-3">
{/* Sensor / LiDAR Status Indicator */}
<div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-label-telemetry">
<span className="w-2 h-2 rounded-full bg-telemetry-emerald animate-pulse"></span>
<span>LiDAR Online</span>
</div>
{/* 3 Day Streak Chip */}
<div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-amber-900 shadow-sm" title="Active Daily Streak">
<span className="material-symbols-outlined text-amber-500 text-base" data-icon="local_fire_department" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
<span className="text-xs font-headline-sm font-bold">3-Day Streak</span>
</div>
{/* XP Pill */}
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 shadow-sm">
<span className="material-symbols-outlined text-sky-600 text-base" data-icon="bolt" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
<span className="text-xs font-label-telemetry font-bold">1,240 XP</span>
</div>
{/* Audio Mute/Unmute Pill */}
<button className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all text-slate-700 text-xs font-headline-sm font-semibold border border-slate-200 active:scale-95" id="sfx-toggle" onClick={() => {}} title="Cabin Audio System">
<span className="material-symbols-outlined text-base text-primary" data-icon="volume_up" id="sfx-icon">volume_up</span>
<span className="hidden sm:inline" id="sfx-status">Cabin FX</span>
</button>
{/* Candidate Avatar with Level Pill */}
<div className="flex items-center gap-2 pl-1">
<div className="relative cursor-pointer group">
<div className="w-9 h-9 rounded-full border-2 border-sensor-cyan p-0.5 shadow-sm bg-white">
<img className="w-full h-full rounded-full object-cover" data-alt="Candidate portrait avatar Alex Morgan" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK6jciq5DqPO7tn8FQS_VhQ-3Zf6MD8zo-M56Tp5XYxeQgittFCaWT3xcoLXVyJCVg_-xKjVbw8GS6hX1sJ0A-3kdrdhlzS6F7YlGMdfjAaFb-xsyQKGoQyyfw9unjWGmHeQL-1d_GjQ1HRQr8AU3XoVVBF2BzjcML4NpR0NBpUV3Zx0-9FCGEF2s7TfcfF1suhs27UB8rBBR07YxBJYRbEXFreClEUFNIaWsjA1taI1QpYLbqQpHX"/>
</div>
<span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-midnight-slate text-sensor-cyan border border-sensor-cyan/50 rounded-full flex items-center justify-center text-[9px] font-label-telemetry font-bold">L4</span>
</div>
</div>
</div>
</header>
{/* MAIN APP WRAPPER */}
<div className="pt-16 max-w-7xl mx-auto flex">
{/* SIDE NAVIGATION RAIL */}
<aside className="hidden lg:flex flex-col justify-between p-4 h-[calc(100vh-4rem)] fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low border-r border-slate-200/90 z-30">
<div className="space-y-4">
{/* AV Quest Stage Status */}
<div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-midnight-slate flex items-center justify-center text-sensor-cyan font-bold border border-slate-800">
<span className="material-symbols-outlined text-xl" data-icon="electric_car" style={{ fontVariationSettings: "'FILL' 1" }}>electric_car</span>
</div>
<div>
<div className="flex items-center gap-1.5">
<h2 className="text-xs font-headline-sm font-bold text-midnight-slate uppercase tracking-wide">Stage 3 Active</h2>
<span className="w-1.5 h-1.5 rounded-full bg-sensor-cyan"></span>
</div>
<p className="text-[12px] font-label-telemetry text-slate-500">850 XP to Waymo L5</p>
</div>
</div>
{/* Quest Navigation Items */}
<div className="space-y-1">
<a className="flex items-center gap-3 bg-midnight-slate text-white rounded-xl px-4 py-3 font-semibold shadow-sm transition-all" href="#quest-map">
<span className="material-symbols-outlined text-xl text-sensor-cyan" data-icon="route" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
<span className="text-sm font-headline-sm">Trajectory Trail</span>
</a>
<a className="flex items-center gap-3 text-slate-600 rounded-xl px-4 py-3 font-medium hover:bg-white hover:text-midnight-slate hover:shadow-sm transition-all" href="#perception-tests">
<span className="material-symbols-outlined text-xl text-slate-500" data-icon="visibility">visibility</span>
<span className="text-sm font-headline-sm">Perception Tests</span>
</a>
<a className="flex items-center gap-3 text-slate-600 rounded-xl px-4 py-3 font-medium hover:bg-white hover:text-midnight-slate hover:shadow-sm transition-all" href="#telemetry-log">
<span className="material-symbols-outlined text-xl text-slate-500" data-icon="terminal">terminal</span>
<span className="text-sm font-headline-sm">Telemetry Console</span>
</a>
<a className="flex items-center gap-3 text-slate-600 rounded-xl px-4 py-3 font-medium hover:bg-white hover:text-midnight-slate hover:shadow-sm transition-all" href="#safety-score">
<span className="material-symbols-outlined text-xl text-slate-500" data-icon="verified_user">verified_user</span>
<span className="text-sm font-headline-sm">Safety Scorecard</span>
</a>
</div>
</div>
{/* Bottom Milestone CTA & Settings */}
<div className="space-y-3 pt-4 border-t border-slate-200">
<button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-midnight-slate to-slate-900 text-white font-headline-sm text-xs font-bold tracking-wide shadow-md hover:border-sensor-cyan border border-transparent transition-all flex items-center justify-center gap-2 active:translate-y-0.5">
<span className="material-symbols-outlined text-base text-sensor-cyan" data-icon="upload_file">upload_file</span>
          Submit Drive Telemetry
        </button>
<div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
<button className="flex items-center gap-1.5 hover:text-primary transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="settings">settings</span>
            Settings
          </button>
<button className="flex items-center gap-1.5 hover:text-primary transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="headset_mic">headset_mic</span>
            Fleet Support
          </button>
</div>
</div>
</aside>
{/* CONTENT CANVAS */}
<main className="w-full lg:pl-64 p-4 md:p-6 lg:p-8 space-y-6">
{/* HERO BANNER: Waymo Autonomous Intelligence Welcome */}
<div className="relative overflow-hidden rounded-3xl bg-midnight-slate text-white p-6 md:p-8 waymo-card border-slate-800 relative">
{/* Subtly animated LiDAR gradient orbs */}
<div className="absolute -right-16 -top-16 w-80 h-80 bg-sensor-cyan/15 rounded-full blur-3xl pointer-events-none"></div>
<div className="absolute right-28 -bottom-16 w-60 h-60 bg-lidar-beam/20 rounded-full blur-2xl pointer-events-none"></div>
{/* Grid line background texture */}
<div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00D2C4_1px,transparent_1px)] [background-size:24px_24px]"></div>
<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
{/* Text & Mission statement */}
<div className="max-w-xl space-y-3.5 text-center md:text-left">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sensor-cyan text-xs font-label-telemetry">
<span className="w-2 h-2 rounded-full bg-sensor-cyan animate-pulse"></span>
              WAYMO-GRADE AUTONOMOUS SIMULATION
            </div>
<h1 className="text-2xl md:text-4xl font-headline-lg font-bold text-white tracking-tight leading-snug">
              Relax &amp; Navigate, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sensor-cyan to-sky-400">Alex.</span> Experience the Future of Drive.
            </h1>
<p className="text-sm md:text-base text-slate-300 leading-relaxed">
              No trick traps or ticking clocks. AMRA assesses your natural situational calmness, obstacle anticipation, and smooth passenger-first autonomous navigation protocols.
            </p>
<div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
<button className="waymo-pill-btn text-midnight-slate font-headline-sm font-bold text-sm px-6 py-3.5 rounded-full flex items-center gap-2 cursor-pointer transition-all">
<span>Resume Mission: Urban Trajectory</span>
<span className="material-symbols-outlined text-lg" data-icon="navigation">navigation</span>
</button>
<button className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all">
<span className="material-symbols-outlined text-sensor-cyan text-base" data-icon="menu_book">menu_book</span>
                Evaluation Guide
              </button>
</div>
</div>
{/* AV Sensor Visualizer / Mascot Card */}
<div className="relative flex-shrink-0">
<div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl p-3 bg-slate-900/90 border border-slate-700 shadow-2xl overflow-hidden group">
{/* Animated perception grid overlay */}
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-sensor-cyan/10 to-transparent animate-scanline pointer-events-none"></div>
<img className="w-full h-full object-cover rounded-2xl opacity-90 transition-transform duration-500 group-hover:scale-105" data-alt="Playful friendly robot navigator mascot with expressive rounded digital eyes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC226ZL02Xy_LeQUB1QATVoNiSnbzNFG-oGhW92Fx0wdVaE_aHHAqMLu4BXeqc4H4WvsyYYe5kj5bTBldYKfj6b5i6T5lN5fNPY812O6Yw_D03H4vuwIG3PAs1pVYC8172_zxyj9CUDIh7Q59tQgH7Rw9nfeNpUs_RMfJPAcr9Plh4itSqCSBREAnJvWC_1lESPJQGdpHHbJuLUq5sCOVoO1lzTEaUCt-0Url1dlSQXV-bcL_dRWZAV"/>
{/* Waymo Telemetry Badge overlay */}
<div className="absolute bottom-4 left-4 right-4 bg-midnight-slate/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-label-telemetry text-sensor-cyan flex items-center justify-between shadow-lg">
<span className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-telemetry-emerald"></span>
                  LiDAR 360°
                </span>
<span className="text-white font-medium">99.8% Calm</span>
</div>
</div>
</div>
</div>
</div>
{/* MAIN DUAL-PANE GAMEBOARD (7 Cols Trajectory Trail + 5 Cols Bento Arena) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/* LEFT PANE: Autonomous Vehicle Trajectory & LiDAR Perception Path (7 Cols) */}
<section className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 waymo-card space-y-6" id="quest-map">
{/* Section Header with Sensor Telemetry Header */}
<div className="flex items-center justify-between border-b border-slate-100 pb-4">
<div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-2xl" data-icon="alt_route">alt_route</span>
<h2 className="text-xl font-headline-lg font-bold text-midnight-slate">Waymo Candidate Trajectory</h2>
</div>
<p className="text-xs text-slate-500 mt-0.5">Autonomous waypoint progression. Zero penalty for pacing.</p>
</div>
<div className="text-right">
<span className="text-[11px] font-label-telemetry text-slate-400 font-bold uppercase tracking-wider">Mission Milestones</span>
<div className="text-base font-label-telemetry font-bold text-sensor-cyan flex items-center justify-end gap-1">
<span className="material-symbols-outlined text-base text-telemetry-emerald" data-icon="check_circle">check_circle</span>
                2 / 5 Cleared
              </div>
</div>
</div>
<AnimatedQuestPath />
</section>
{/* RIGHT PANE: Perception Sandbox & Cognitive Grounding Bento (5 Cols) */}
<div className="lg:col-span-5 space-y-6">
{/* WIDGET 1: Perception & Trajectory Sandbox (+50 XP) */}
<div className="bg-white rounded-3xl p-6 waymo-card space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-slate-100 text-sensor-cyan flex items-center justify-center border border-slate-200">
<span className="material-symbols-outlined text-lg" data-icon="motion_sensor_active" style={{ fontVariationSettings: "'FILL' 1" }}>motion_sensor_active</span>
</div>
<div>
<h3 className="text-sm font-headline-sm font-bold text-midnight-slate">Perception &amp; Trajectory Sandbox</h3>
<p className="text-[11px] text-slate-500 font-label-telemetry">Low-stakes judgment sandbox</p>
</div>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-telemetry-emerald border border-emerald-200 text-xs font-label-telemetry font-bold">+50 XP</span>
</div>
{/* AV Scenario Prompt */}
<div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
<div className="flex items-center justify-between">
<span className="text-[11px] font-label-telemetry text-primary font-bold tracking-wider">SCENARIO: AUTONOMOUS MERGE</span>
<span className="text-[11px] font-label-telemetry text-slate-500">SPEED: 25 MPH</span>
</div>
<p className="text-xs md:text-sm font-medium text-midnight-slate leading-relaxed">
                Unprotected left turn with an occluded cyclist in the oncoming bike lane detected by secondary radar. Recommended AV protocol?
              </p>
</div>
{/* Sleek Waymo Vehicle UI Choice Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="choice-container">
<button className="choice-btn p-3 rounded-2xl bg-white border border-slate-200 hover:border-sensor-cyan text-left transition-all active:scale-95 duration-150 flex items-center gap-2.5 shadow-sm" onClick={() => {}}>
<span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-label-telemetry font-bold text-slate-700">A</span>
<span className="text-xs font-medium text-slate-800">Rapidly clear the intersection</span>
</button>
<button className="choice-btn p-3 rounded-2xl bg-white border border-slate-200 hover:border-sensor-cyan text-left transition-all active:scale-95 duration-150 flex items-center gap-2.5 shadow-sm" onClick={() => {}}>
<span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-label-telemetry font-bold text-slate-700">B</span>
<span className="text-xs font-medium text-slate-800">Hold wait position &amp; confirm path</span>
</button>
<button className="choice-btn p-3 rounded-2xl bg-white border border-slate-200 hover:border-sensor-cyan text-left transition-all active:scale-95 duration-150 flex items-center gap-2.5 shadow-sm" onClick={() => {}}>
<span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-label-telemetry font-bold text-slate-700">C</span>
<span className="text-xs font-medium text-slate-800">Creep forward into oncoming lane</span>
</button>
<button className="choice-btn p-3 rounded-2xl bg-white border border-slate-200 hover:border-sensor-cyan text-left transition-all active:scale-95 duration-150 flex items-center gap-2.5 shadow-sm" onClick={() => {}}>
<span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-label-telemetry font-bold text-slate-700">D</span>
<span className="text-xs font-medium text-slate-800">Engage emergency audio horn</span>
</button>
</div>
{/* Dynamic Feedback Output Card */}
<div className="hidden p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 transition-all" id="feedback-card">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-telemetry-emerald text-lg" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="text-xs font-headline-sm font-bold" id="feedback-text">Optimal Trajectory Decision! +50 XP</span>
</div>
<p className="text-[11px] mt-1 text-slate-600">Holding position respects vulnerable road users (VRUs) and guarantees zero-conflict headway.</p>
</div>
</div>
{/* WIDGET 2: Driver Readiness & Cognitive Grounding */}
<div className="bg-white rounded-3xl p-6 waymo-card space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-slate-100 text-primary flex items-center justify-center border border-slate-200">
<span className="material-symbols-outlined text-lg" data-icon="self_improvement">self_improvement</span>
</div>
<div>
<h3 className="text-sm font-headline-sm font-bold text-midnight-slate">Driver Readiness &amp; Grounding</h3>
<p className="text-[11px] text-slate-500 font-label-telemetry">Maintain optimal cognitive flow state</p>
</div>
</div>
<span className="text-[11px] font-label-telemetry text-sensor-cyan font-semibold">CALM MODE</span>
</div>
{/* Interactive Breathing Pacer with AV Waveform */}
<div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between overflow-hidden relative border border-slate-800">
<div className="space-y-1 relative z-10">
<span className="text-xs font-headline-sm font-bold text-white">4-Second Mindful Waveform</span>
<p className="text-[11px] text-slate-300" id="breath-guide">Inhale slowly with the autonomous pulse...</p>
</div>
{/* Animated Waveform Bars */}
<div className="flex items-center gap-1 relative z-10 h-10">
<div className="w-1.5 h-6 bg-sensor-cyan rounded-full animate-wave-bar" style={{ animationDelay: "0.1s" }}></div>
<div className="w-1.5 h-10 bg-lidar-beam rounded-full animate-wave-bar" style={{ animationDelay: "0.3s" }}></div>
<div className="w-1.5 h-8 bg-sensor-cyan rounded-full animate-wave-bar" style={{ animationDelay: "0.5s" }}></div>
<div className="w-1.5 h-4 bg-sky-300 rounded-full animate-wave-bar" style={{ animationDelay: "0.2s" }}></div>
</div>
</div>
{/* Cabin Ambient Audio Selector */}
<div>
<label className="text-[11px] font-label-telemetry text-slate-500 block mb-2 font-bold uppercase tracking-wider">Cabin Ambient Soundscape</label>
<div className="grid grid-cols-3 gap-2">
<button className="audio-btn p-2 rounded-xl bg-slate-50 border border-sensor-cyan text-[11px] font-headline-sm font-bold text-midnight-slate flex flex-col items-center gap-1 shadow-sm transition-all" onClick={() => {}}>
<span className="material-symbols-outlined text-sm text-sensor-cyan" data-icon="electric_bolt">electric_bolt</span>
                  Cabin Silence
                </button>
<button className="audio-btn p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-headline-sm font-medium text-slate-600 hover:bg-slate-100 flex flex-col items-center gap-1 transition-all" onClick={() => {}}>
<span className="material-symbols-outlined text-sm text-slate-500" data-icon="water_drop">water_drop</span>
                  Rain on Shield
                </button>
<button className="audio-btn p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-headline-sm font-medium text-slate-600 hover:bg-slate-100 flex flex-col items-center gap-1 transition-all" onClick={() => {}}>
<span className="material-symbols-outlined text-sm text-slate-500" data-icon="graphic_eq">graphic_eq</span>
                  Electric Glide
                </button>
</div>
</div>
</div>
{/* WIDGET 3: Autonomous Evaluation Standards */}
<div className="bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-3xl p-6 border border-slate-200 space-y-3">
<h4 className="text-xs font-headline-sm font-bold text-midnight-slate uppercase tracking-wider flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-base" data-icon="shield">shield</span>
              Autonomous Evaluation Standards
            </h4>
<ul className="space-y-2 text-xs text-slate-600">
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-telemetry-emerald text-sm mt-0.5" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span><strong>Situational Comfort:</strong> We prioritize safe passenger dynamics over sheer speed or frantic clicking.</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-telemetry-emerald text-sm mt-0.5" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span><strong>Continuous State Save:</strong> Pause anytime. Telemetry syncs seamlessly so you never lose your flow.</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-telemetry-emerald text-sm mt-0.5" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span><strong>No Trick Questions:</strong> Clear LiDAR representations and authentic fleet road scenarios.</span>
</li>
</ul>
</div>
</div>
</div>
</main>
</div>
{/* Micro-Interactions Script */}


    </div>
  );
}
