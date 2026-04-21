import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════
// AT DEVELOPMENT JOURNAL
// A reflective development tool for Alpine Trainer certification
// ═══════════════════════════════════════════════════════════════════════

// ── Connection Domains ──────────────────────────────────
const DOMAINS = [
  { id: "ma", label: "Movement Analysis", color: "#e07830" },
  { id: "skiing", label: "Skiing Performance", color: "#3088cc" },
  { id: "biomechanics", label: "Biomechanics", color: "#28a858" },
  { id: "physics", label: "Physics & Forces", color: "#a0a0d0" },
  { id: "skidesign", label: "Ski Design", color: "#90b050" },
  { id: "tactics", label: "Tactics & Line", color: "#c060a0" },
  { id: "teaching", label: "Teaching & Progression", color: "#e8a050" },
  { id: "groupdynamics", label: "Group Dynamics", color: "#6a90d0" },
  { id: "terrain", label: "Terrain & Conditions", color: "#70b870" },
  { id: "psychology", label: "Psychology & Mindset", color: "#d06060" },
  { id: "cap", label: "CAP Integration", color: "#d0a040" },
];

const CONTEXTS = ["Clinic", "Free Skiing", "Shadow", "Assessment Task", "Training", "Self-Study", "Peer Observation"];

const DEPTH_LEVELS = [
  { id: "surface", label: "Surface", desc: "I described what happened", color: "#e05028" },
  { id: "connecting", label: "Connecting", desc: "I linked cause and effect across domains", color: "#e07830" },
  { id: "integrated", label: "Integrated", desc: "I saw the whole picture and adapted", color: "#28a858" },
];

const PULSE_OPTIONS = [
  { id: "keep-going", label: "Keep Going", desc: "On the right track", color: "#28a858", icon: "→" },
  { id: "go-deeper", label: "Go Deeper", desc: "You're scratching the surface", color: "#e07830", icon: "↓" },
  { id: "revisit", label: "Read Again Later", desc: "You'll see how you've grown", color: "#3088cc", icon: "↻" },
];

// ── Reflection Prompts ──────────────────────────────────
const PROMPTS = [
  { id: "whatISaw", label: "What did I see?", placeholder: "Describe the moment — what was happening with the student, the group, or your own skiing...", nudge: null },
  { id: "whatWasGoingOn", label: "What was really going on underneath?", placeholder: "Root cause — connect the symptom to the underlying issue. Why was this happening?", nudge: "You described what you saw. But what's the root cause? Think about biomechanics, terrain, confidence, tactics..." },
  { id: "whatIDid", label: "What did I do about it?", placeholder: "Your teaching decision — terrain choice, exercise, progression, demo, verbal cue...", nudge: null },
  { id: "whyThatApproach", label: "Why that approach and not another?", placeholder: "What made you choose this over other options? What were you considering?", nudge: "You described what you did — but why that and not something else? What other approaches did you consider?" },
  { id: "whatHappened", label: "What happened?", placeholder: "The outcome — did it work? What changed? What didn't change?", nudge: null },
  { id: "whatIdDoDifferently", label: "What would I do differently?", placeholder: "Knowing what you know now — what would you change? What did you learn?", nudge: null },
];

// ── Default Themes ──────────────────────────────────────
const DEFAULT_THEMES = [
  { id: "root-cause", question: "Can I see past the symptom to the root cause?", description: "The MA leap from L3 to AT. Connecting multiple skill interactions to explain why — using 3+ skills simultaneously.", active: true, createdAt: new Date().toISOString() },
  { id: "design-adapt", question: "Can I design and adapt in the moment?", description: "Progression design, terrain selection, exercise choice — and changing the plan when it's not working.", active: true, createdAt: new Date().toISOString() },
  { id: "skiing-expression", question: "Does my skiing express what I'm teaching?", description: "Intentional demonstration — showing the specific blend you're prescribing, on command.", active: true, createdAt: new Date().toISOString() },
];

// ── Resources (AT Program Guide Learning Experiences) ──
const RESOURCES = {
  "Theme 1 — Root Cause": {
    color: "#e07830",
    themeId: "root-cause",
    items: [
      { id: "R-MA1", title: "Multiple skill-to-skill cause-effect analysis", desc: "Observe a skier and identify 3+ interacting skills. Trace the primary cause." },
      { id: "R-MA2", title: "Blended MA using 3+ skills simultaneously", desc: "Practice analyzing movement through multiple lenses at once." },
      { id: "R-MA3", title: "Biomechanics, physics, ski design applied to MA", desc: "Connect what you see to the physics of why it's happening." },
      { id: "R-MA4", title: "Center Line and Common Threads in MA", desc: "Use the PSIA frameworks to deepen your analysis." },
      { id: "R-MA5", title: "Prescribe IDP activity + variations", desc: "Design an activity based on your MA — show the connection from diagnosis to prescription." },
    ]
  },
  "Theme 2 — Design & Adapt": {
    color: "#e8a050",
    themeId: "design-adapt",
    items: [
      { id: "R-CL1", title: "Create learning objectives from MA", desc: "Turn your analysis into a clear, achievable objective for the student." },
      { id: "R-CL2", title: "Plan and adapt learning experiences", desc: "Design a progression — then change it when conditions or students require it." },
      { id: "R-CL3", title: "Adapt to resort needs and diverse groups", desc: "Lead a session with mixed abilities or unexpected constraints." },
      { id: "R-CL4", title: "Foster reflection and 2-way communication", desc: "Get students thinking, not just doing. Ask questions that reveal understanding." },
      { id: "R-CL5", title: "Provide effective feedback", desc: "Practice timing, specificity, and framing of feedback that lands." },
      { id: "R-CL6", title: "Lead a 25-minute clinic", desc: "Full clinic experience — intro, assessment, progression, feedback, wrap-up." },
      { id: "R-CL7", title: "Foster positive group interaction", desc: "Encourage peer learning, group discussion, and collaborative goal-setting." },
    ]
  },
  "Theme 3 — Skiing Expression": {
    color: "#3088cc",
    themeId: "skiing-expression",
    items: [
      { id: "R-SK1", title: "Individual fundamental tasks", desc: "Pivot slips, hop turns, White Pass, stem Christie, outside ski turns — demonstrate with intention." },
      { id: "R-SK2", title: "Center Line milestone demonstrations", desc: "Wedge turn through dynamic parallel — show each with clarity and purpose." },
      { id: "R-SK3", title: "Performance versatility", desc: "Short/medium/long turns, bumps, variable terrain — adapt your skiing to express intent." },
      { id: "R-SK4", title: "Express intent of tactical choices", desc: "Show the connection between what you're demonstrating and why." },
      { id: "R-SK5", title: "Adapt skiing to varying conditions", desc: "Ice, powder, crud, steeps — demonstrate how your skiing changes and why." },
    ]
  },
  "General Development": {
    color: "#7a9ab5",
    themeId: null,
    items: [
      { id: "R-GEN1", title: "Professionalism & self-management", desc: "Preparation, punctuality, communication with supervisors, self-regulation." },
      { id: "R-GEN2", title: "Tactical analysis", desc: "Speed, line, turn shape, edge grip — read the mountain." },
      { id: "R-GEN3", title: "Trust and safety management", desc: "Physical and emotional safety — how you create the environment." },
      { id: "R-GEN4", title: "Interpersonal dynamics management", desc: "Reading the room, managing conflict, adapting communication style." },
    ]
  },
};

const ALL_RESOURCES = Object.values(RESOURCES).flatMap(r => r.items);

// ── Seasons ─────────────────────────────────────────────
const SEASONS = ["25/26", "26/27", "27/28"];
const getCurrentSeason = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 9) return `${String(year).slice(2)}/${String(year + 1).slice(2)}`;
  return `${String(year - 1).slice(2)}/${String(year).slice(2)}`;
};

// ═══════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════

const USERS = {
  mark:  { name: "Mark",  role: "candidate", pin: "1234", color: "#e07830" },
  chris: { name: "Chris", role: "mentor",    pin: "2345", color: "#28a858" },
  gates: { name: "Gates", role: "mentor",    pin: "3456", color: "#28a858" },
  mike:  { name: "Mike",  role: "mentor",    pin: "4567", color: "#3088cc" },
};

// ═══════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════

function getApiUrl() {
  return (typeof window !== "undefined" && window.__AT_API_URL__) || "";
}

async function apiGet(sheetName) {
  const url = getApiUrl();
  if (!url) return [];
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ _action: "getAll", _sheet: sheetName }),
    });
    const data = await res.json();
    console.log("API response for", sheetName, ":", typeof data, Array.isArray(data), data?.rows ? data.rows.length + " rows" : "no rows key");
    if (Array.isArray(data)) return data;
    if (data?.rows && Array.isArray(data.rows)) return data.rows;
    if (data?.data && Array.isArray(data.data)) return data.data;
    console.warn("Unexpected API response format:", Object.keys(data || {}));
    return [];
  } catch (e) { console.error("API GET error:", sheetName, e); return []; }
}

async function apiPost(action, sheetName, rowData, id) {
  const url = getApiUrl();
  if (!url) return;
  try {
    const payload = { ...rowData, _action: action, _sheet: sheetName };
    if (id) payload._id = id;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch (e) { console.error(`API ${action} error:`, e); }
}

function apiCreate(s, d) { return apiPost("create", s, d); }
function apiUpdate(s, d) { return apiPost("update", s, d); }

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().split("T")[0];

// ═══════════════════════════════════════════════════════════════════════
// SPARRING PARTNER — Claude AT Coach
// ═══════════════════════════════════════════════════════════════════════

const AT_COACH_SYSTEM = `You are an Alpine Trainer development coach for PSIA (Professional Ski Instructors of America). You are coaching Mark, a Level 3 certified instructor working toward his Alpine Trainer (AT) certification at Keystone Resort, Colorado.

CRITICAL CONTEXT — What an Alpine Trainer IS:
- An AT trains INSTRUCTORS, not the public. Mark's "students" are other ski instructors — sometimes peers (L2/L3), sometimes brand new hires with zero knowledge, sometimes L1 candidates preparing for exams.
- The AT exam tests Mark's ability to TRAIN other instructors: develop their teaching, sharpen their MA, deepen their understanding of the Skills Concept, and help them grow as professionals.
- In scenarios and drills, the people Mark is working with are INSTRUCTORS, not guests. Use instructor-appropriate language — they know (or should know) the terminology.
- When a new hire has no knowledge, Mark still needs to develop them AS an instructor, not just teach them to ski.
- Mark's goal is to pass the AT exam by demonstrating he can BE a trainer — leading clinics for instructors, doing blended MA at the AT level, and showing his skiing expresses what he teaches.

Your role:
- ASK more questions than you give answers
- PUSH Mark to think deeper — connect symptoms to root causes, connect domains (MA, biomechanics, tactics, terrain, psychology, group dynamics)
- CHALLENGE surface-level thinking — if Mark describes what he saw but not WHY, push him
- NEVER give him the answer — guide him to discover it
- Reference the PSIA framework: Fitts & Posner learning stages, Center Line, Common Threads, Skills Concept (edging, pressure, rotary — balance/stance is an outcome, not a skill), CAP Model (Cognitive, Affective, Physical), Learning Connection Model (Technical + Teaching + People Skills)
- When relevant, push Mark to connect observations to PHYSICS (forces, momentum, CM), BIOMECHANICS (kinetic chain, ankle flexion, femur rotation, angulation), and SKI DESIGN (sidecut, camber, rocker, flex)
- Use the CAP model: push Mark to consider not just what the instructor CAN do (physical) but what they UNDERSTAND (cognitive) and how they FEEL (affective). "You fixed the movement — but does the instructor understand WHY? How were they feeling about the feedback?"
- When discussing a scenario, always push for: What's the ROOT cause? What ELSE could be going on? Why THIS approach and not another? What would you do if it DIDN'T work?
- When Mark describes a clinic or training session, push on: How did you develop their UNDERSTANDING, not just their skiing? Did you help them see the WHY, or just give them an exercise?

Mark's three development themes:
1. "Can I see past the symptom to the root cause?" — blended MA using 3+ skills
2. "Can I design and adapt in the moment?" — progression design, terrain selection, adapting
3. "Does my skiing express what I'm teaching?" — intentional demonstration

Be direct, warm but challenging. Think of yourself as a senior examiner who genuinely wants Mark to succeed but won't let him take shortcuts in his thinking.`;

const MA_SCENARIO_SYSTEM = `${AT_COACH_SYSTEM}

CURRENT MODE: SCENARIO DRILL
You are presenting Mark with a training scenario for him to analyze. The people in these scenarios are INSTRUCTORS, not guests. When asked for a scenario:
1. Describe a specific instructor — their cert level (new hire, L1, L2, L3, or peer), experience, the terrain, snow conditions, what their skiing or teaching looks like
2. Vary the scenarios: sometimes it's MA of their skiing, sometimes it's observing them teach, sometimes it's a clinic Mark is leading for a group of instructors
3. Include enough observable detail for a blended MA using 3+ skills
4. Include subtle clues that point to a deeper root cause beyond the obvious symptom
5. After Mark responds with his analysis, push back:
   - "You identified X and Y — but what about the timing between those two?"
   - "Is that the cause or the symptom? What's creating that?"
   - "You mentioned 3 skills. What's the PRIMARY cause-effect relationship?"
   - "What would you prescribe? Why THAT and not something else?"
   - "How would you develop their UNDERSTANDING of the issue, not just fix their movement?"
   - "This is an L2 instructor — how does that change your approach vs. a new hire?"
6. Progressively increase difficulty: start with clear single-cause scenarios, move to multi-cause, then to scenarios where the obvious fix is wrong
7. Keep scenarios realistic — things Mark would actually see training instructors at Keystone`;

const MA_REVERSE_SYSTEM = `${AT_COACH_SYSTEM}

CURRENT MODE: REVERSE MA — PRESCRIPTION FIRST
You present Mark with a training decision (a prescription) and ask him to work BACKWARDS to the diagnosis. The context is always training INSTRUCTORS (new hires, L1/L2/L3 candidates, or peers).
1. Describe what the trainer did: the exercise chosen, the terrain selected, the progression used, the verbal cue or question asked, and the level of the instructor being trained
2. Ask Mark: "What did I probably see that led to this prescription? What's the diagnosis behind this choice?"
3. After Mark responds, reveal the actual scenario and discuss:
   - Did he identify the right root cause?
   - Were there other possible diagnoses that could lead to the same prescription?
   - How would the prescription differ if the instructor were a different cert level?
   - Did he think about developing the instructor's UNDERSTANDING or just fixing their movement?
4. This trains Mark to think about the WHY behind training choices, not just the WHAT`;

const MA_COMPARE_SYSTEM = `${AT_COACH_SYSTEM}

CURRENT MODE: COMPARE & CONTRAST
Present Mark with TWO instructors who show similar symptoms but have DIFFERENT root causes. These are instructors Mark is training, not guests.
1. Describe Instructor A and Instructor B — both show the same observable issue. Include their cert level and experience.
2. Include subtle differences in their movement patterns, terrain response, timing, or understanding
3. Ask Mark to:
   - Analyze each instructor separately
   - Identify what's DIFFERENT about the root cause
   - Prescribe differently for each
   - Explain how their cert level and experience changes his approach
   - Describe how he'd develop their UNDERSTANDING, not just fix the movement
4. This is the hardest drill — it trains Mark to look past the obvious and see the individual`;

const MA_VIDEO_SYSTEM = `${AT_COACH_SYSTEM}

CURRENT MODE: VIDEO SELF-ANALYSIS
Mark has watched a video of skiing (his own or a student's) and written his analysis. Your job:
1. Take his written analysis and push it deeper
2. Ask about things he might have missed: timing, terrain interaction, speed management, intent
3. Push for the PRIMARY cause-effect: "You listed 4 observations. Which one is driving the others?"
4. Ask about prescription: "Based on your analysis, what would you do? What terrain? What exercise? Why?"
5. Challenge his depth: "You're describing what you see — now tell me WHY it's happening"`;

const MA_ANALYZER_SYSTEM = `You are analyzing an Alpine Trainer candidate's Movement Analysis practice session. Extract a structured summary that identifies patterns, strengths, and gaps.

Assessment Scale: 1=Not observed, 2=Beginning, 3=Inconsistent, 4=Satisfactory (PASS), 5=Above required, 6=Superior

Score the MA against these criteria:
- Describe Performance (ski + body detail, turn-phase specificity)
- Cause and Effect (skill-to-skill relationships, root cause identification)
- Evaluate (comparison to intended outcome, task compliance)
- Prescription (specificity, appropriateness to conditions/level)
- Biomechanics/Physics (depth of WHY explanation)
- Communication (clarity, non-contradictory)

Respond ONLY in this JSON format (no markdown, no backticks):
{"skills_identified":["list of skills mentioned"],"cause_effect":"description of cause-effect relationships identified","root_cause":"what they identified as root cause","prescription":"what they prescribed","mentor_corrections":"key corrections from mentor if present","strengths":["list of strengths"],"gaps":["list of gaps/blind spots"],"scores":{"describe":0,"cause_effect":0,"evaluate":0,"prescription":0,"biomechanics":0,"communication":0},"pattern_notes":"recurring patterns or tendencies observed","key_learning":"the single most important thing to work on"}`;

const MA_DIALOG_SYSTEM = `${AT_COACH_SYSTEM}

CURRENT MODE: MA EXAMINER FOLLOW-UP
Mark has just delivered his peer-to-peer MA analysis. You are now acting as the examiner in the debrief phase. Your job:
1. Ask 2-3 focused follow-up questions based on his MA — one at a time
2. Push on gaps: Did he check task compliance? Did he identify the PRIMARY skill? Did he explain the physics? Did he adapt to conditions?
3. Ask questions like: "Why did you choose that prescription over another?", "What would you do if it didn't work?", "Can you describe that by turn phase?", "What's happening with the outside ski at the fall line?"
4. If he gives a surface answer, push deeper: "You said grip — what does grip actually allow the ski to do?"
5. Be warm but direct — you want him to succeed but you need to hear AT-level depth
6. After 2-3 exchanges, tell him you have enough to score

Ask ONE question at a time. Wait for his response before asking the next.`;

const MA_TREND_SCORER_SYSTEM = `You are scoring an Alpine Trainer candidate's MA practice session AND comparing it to their previous sessions to identify trends.

Assessment Scale: 1=Not observed, 2=Beginning, 3=Inconsistent, 4=Satisfactory (PASS), 5=Above required, 6=Superior

Score against these criteria:
- Describe Performance (ski + body detail, turn-phase specificity)
- Cause and Effect (skill-to-skill relationships, root cause identification)
- Evaluate (comparison to intended outcome, task compliance)
- Prescription (specificity, appropriateness to conditions/level)
- Biomechanics/Physics (depth of WHY explanation)
- Communication (clarity, non-contradictory, organized by phase)

IMPORTANT: Compare this session to the previous sessions provided. Identify:
- What IMPROVED compared to previous sessions
- What GAPS PERSIST across sessions
- What's NEW (good or bad) that wasn't present before

Respond ONLY in this JSON format (no markdown, no backticks):
{"skills_identified":["list"],"cause_effect":"description","root_cause":"what identified","prescription":"what prescribed","mentor_corrections":"corrections if present","strengths":["list"],"gaps":["list"],"scores":{"describe":0,"cause_effect":0,"evaluate":0,"prescription":0,"biomechanics":0,"communication":0},"improvements":["what got better vs previous sessions"],"persistent_gaps":["gaps that keep appearing"],"new_observations":["things not seen before"],"key_learning":"single most important thing to work on next"}`;

const SPARRING_MODES = {
  open: { label: "Open Chat", desc: "Free conversation — ask anything", system: AT_COACH_SYSTEM, color: "#c060a0", icon: "💬" },
  scenario: { label: "Scenario Drill", desc: "I describe a student, you analyze", system: MA_SCENARIO_SYSTEM, color: "#e07830", icon: "🎯" },
  reverse: { label: "Reverse MA", desc: "I give the prescription, you find the diagnosis", system: MA_REVERSE_SYSTEM, color: "#28a858", icon: "🔄" },
  compare: { label: "Compare & Contrast", desc: "Two students, same symptom, different cause", system: MA_COMPARE_SYSTEM, color: "#3088cc", icon: "⚖️" },
  video: { label: "Video Analysis", desc: "Paste your MA, I'll challenge it", system: MA_VIDEO_SYSTEM, color: "#e8a050", icon: "🎥" },
  writtenma: { label: "Written MA", desc: "Write a full MA — AI scores it", system: MA_ANALYZER_SYSTEM, color: "#a0a0d0", icon: "📝" },
};

async function callClaude(messages, systemOverride) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemOverride || AT_COACH_SYSTEM,
        messages,
      }),
    });
    const data = await res.json();
    return data.content?.map(c => c.text || "").join("\n") || "No response.";
  } catch (e) {
    console.error("Claude API error:", e);
    return "Unable to connect to the sparring partner right now.";
  }
}

// ── Shared UI Components (must be outside main component to avoid remounting) ──
const Card = ({ children, style = {} }) => (
  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 14px", marginBottom: 10, ...style }}>{children}</div>
);
const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: "#7a9ab5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{children}</div>
);
const INP_STYLE = { padding: "8px 10px", fontSize: 14, color: "#c0ccd8", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%" };
const TXTA_STYLE = { ...INP_STYLE, minHeight: 60, resize: "vertical", lineHeight: 1.6 };
const LBL_STYLE = { fontSize: 11, color: "#7a9ab5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 };

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════

export default function ATDevelopmentJournal() {
  // ── Auth ────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // ── Data ────────────────────────────────────────────────
  const [entries, setEntries] = useState([]);
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [checkpoints, setCheckpoints] = useState([]);
  const [videos, setVideos] = useState([]); // [{ id, date, activity, url, notes, conditions, selfScore, season }]
  const [clinicFeedback, setClinicFeedback] = useState([]); // [{ id, date, topic, audience, duration, selfReflection, feedback, notes }]
  const [mentorCoachNotes, setMentorCoachNotes] = useState({}); // { chris: "...", gates: "...", mike: "..." }
  const [maSessions, setMaSessions] = useState([
    {
      id: "ma-sample-3", date: "2025-04-01", context: "MA practice with Chris", who: "Peer (Dave)", activity: "Carved Long Turns",
      transcript: "For this performance, the turns lack symmetry, as evident by a longer finish through the initiation phase than through the shaping phase. This was due to the ski having the highest edge angles at the bottom of the turn because it was too far inside. The way you are moving your center of mass at initiation is to rapidly extend the new outside leg, which helps release the ski but puts you inside the turn. As you move inside the turn, edge angles are built late.",
      notes: "Chris: WAS THIS THE TASK? Description is confusing as there are contradictory statements. Is their issue tipping the ski or releasing it? Could add about grip late into the turn. Lack of grip on the outside ski. High edge angles at the fall line prevents her to rotate her skis at the bottom of the turn to help the turn to be more symmetrical.",
      summary: "",
    },
    {
      id: "ma-sample-2", date: "2025-03-15", context: "MA practice with Chris", who: "Peer", activity: "Variable Terrain",
      transcript: "For this performance, I'm observing that your skis are pivoting rather than steering through a large number of your variable turns, particularly on your left footers. This is due to the impact of your skis flattening as the skis match the slope of the hill and the fact that you struggle to maintain counter through transition. This allows the skis to pivot instead of steer through the bottom half of the turn on your left foot. By maintaining counter through transition will give you the opportunity to use lower leg tipping and rotate to create extra grip on your right footer and allow you to accurately use edge to help steer the ski rather than pivot it.",
      notes: "Chris: WHY DOES THIS SKIER NEED COUNTER OR GRIP? IT IS POWDER AND FRESH SNOW. IS THIS A ROTATION, S/S PRESSURE OR EDGE INACCURACY? Celebrate success if it is successful. Don't forget to call out not doing the task.",
      summary: "",
    },
    {
      id: "ma-sample-1", date: "2025-03-01", context: "MA practice with Chris", who: "Peer (Dave)", activity: "Performance Short Turns",
      transcript: "For this short-radius performance, I observed that the way you managed pressure at the end of the turn directly affected your ability to tip and turn your legs at the initiation of the turn. The extension in both legs with your knee and hip allowed you to be light at transition; however, this reduced your ability to use your lower legs to tip the ski and get purchase in the snow. The end result is that the ski had a tendency to pivot rather than be steered at the top half of the turn, having most of the steering occurred below the fall line. I feel this is particularly critical in firm snow conditions, where creating grip is challenging. The opportunity for you is to flex through transition equally with your hip, knee and ankle, which would still allow you to release your edge while maintaining ski-snow contact, and allow you to tip your legs to develop early grip.",
      notes: "Chris: Where is the extension? Which leg? Both? One? What is purchase and grip? MOST importantly what does that allow you to do? What impact does it have on the ski and its path of travel?",
      summary: "",
    },
  ]);
  const [referenceMaterials, setReferenceMaterials] = useState(`═══ PSIA-RM ALPINE TRAINER PROGRAM GUIDE (Oct 2024) ═══

AT PROGRAM INTENT
The Alpine Trainer Program is dedicated to providing the best possible education for prospective Alpine Trainers. The program's comprehensive design aims to help you be a successful and effective Trainer for your home resort. You'll develop the skills needed to deliver compelling training clinics that balance the needs of the instructors and your home resort's objectives.

AT PROGRAM STRUCTURE — 3 Modules:
1. Technical/Movement Analysis
2. Skiing Performance
3. Clinic Leading
Plus: Professionalism & Self-Management (assessed in every module)

COMPLETION REQUIREMENTS:
- Pass Alpine Trainer Entrance Assessment (verifies L3 skiing standard)
- Pass all 3 Module Assessments
- Attain Freestyle 1 Accreditation (FS1)
- 3 seasons to complete after passing Entrance Assessment

═══ MODULE 1: TECHNICAL/MOVEMENT ANALYSIS ═══

LEARNING OUTCOMES:
1. Use technical expertise to enhance clinic participants' knowledge; make technical, tactical, and/or equipment recommendations; discuss the sport from various perspectives
2. Demonstrate knowledge of cause-and-effect relationships to prepare certification candidates and enhance clinic participants' skiing

KEY LEARNING EXPERIENCES:
- Analyze world-class skiing using physics, biomechanics, ski design, and boot setup
- Outline differences between L1, L2, L3 certification standards for MA
- Prioritize Fundamentals/Skills by: largest impact on other skills, alignment with skier intent, immediate tactical enhancement, performance change with speed/environment
- Identify multiple skill-to-skill relationships with body-to-ski cause-effect
- Describe skill relationships starting from EACH skill (bidirectional analysis)
- Use biomechanics, physics, ski design to see additional relationships
- Center Line and Common Threads: explain how Common Threads highlight mechanics at all levels

ASSESSMENT: Two opportunities to demonstrate MA. Observe a peer performing 2 Versatility Assessment Activities. Share 10-minute analysis including prescription (Individual or Integrated Fundamental + variations). Examiners ask follow-up questions.

═══ MODULE 2: SKIING PERFORMANCE ═══

LEARNING OUTCOMES:
Adjust and adapt the Alpine Skiing Fundamentals at all speeds for various training needs including: inspiration, participant understanding, highlighting skill blends, highlighting tactical choices, and problem solving.

The AT must display skiing skills recognizably ABOVE AND BEYOND Level 3. Must ski exceptionally demanding conditions. Demonstration tasks of all ability levels must be performed in an exacting manner. Adaptability to varying conditions and tasks must be second nature. Skiing ability must be respected by peers and employers as being near the pinnacle within the profession.

KEY LEARNING EXPERIENCES:
- Compare personal skiing to ideal; identify specific skill-to-skill differences
- Problem solving through 50-50 failure/success training (variations to tasks, combining tasks, changing environment, changing speed, varying skill blends)
- Center Line: ski through all milestones maintaining consistent mechanics via Common Threads

ASSESSMENT: 10 Assessment Activities from IDP:
- 3 Individual Fundamentals
- 3 Integrated Fundamentals (Center Line milestones)
- 4 Versatility (including bumps, variable terrain)
All conditions possible. Variations may be requested. Freeskiing is also assessed.

═══ MODULE 3: CLINIC LEADING ═══

LEARNING OUTCOMES:
1. Strengthen the professional environment by adapting to situations and group members
2. Plan learning experiences based on resort needs and learners' needs
3. Adapt learning experiences to meet participants' needs without sacrificing resort needs
4. Foster ability to recognize, reflect upon, and assess experiences to enhance understanding
5. Maintain 2-way communication with clinic participants on behalf of resort
6. Adapt to interpersonal dynamics within the group as ambassador of resort

KEY LEARNING EXPERIENCES:
- Analyze what makes a great trainer (LCM usage, educator skills)
- Create Learning Outcomes for 1hr, 1-day, 2-day clinics for New Hires through L3
- Design progressions connecting Skills/Fundamentals to ski design, turning, speed control
- Experiential learning: tasks that develop skiing through skill-to-skill relationships
- Variations and lateral learning using IDP assessment activities
- Feedback: timeliness, detail, accuracy, relevance, right amount
- Clinic audit and reverse audit with reflective observation

ASSESSMENT: Assigned a clinic outline with description and learning outcomes (emailed 1 week before). Lead 25-minute clinic for peers. Followed by examiner conversation. New clinics every 40 minutes.

═══ PROFESSIONALISM & SELF-MANAGEMENT ═══

Assessed in EVERY module from check-in until results. Includes follow-up questions, examiner interviews, and observed interactions with candidates, resort employees, and guests.

LEARNING OUTCOME: Strengthen the professional environment by adapting to situations and other group members on behalf of themselves and their resort.

KEY QUESTIONS:
- How do you respond when things don't go according to plan?
- What do you need to manage emotionally and physically in a training environment?
- How do you support others when things are going your way but not theirs?

═══ PSIA-RM IDP — ASSESSMENT ACTIVITIES BY LEVEL ═══

LEVEL 1 INDIVIDUAL FUNDAMENTALS:
Sideslips with Edge Set, Guided Uphill Arc, Carved Uphill Arc, Step Turn into Fall Line, Outside Ski J-Turn, Straight Run Leaper, Wedge Change-Ups, Skating (Flat), 1-Ski Straight Run

LEVEL 2 INDIVIDUAL FUNDAMENTALS:
Skating (Down Hill), Hockey Stops, Railroad Track Turns, 1000 Steps, Stork Turn, Diagonal Sideslip, Falling Leaf, Crab Wedge, Wedge Wiggles

LEVEL 3 INDIVIDUAL FUNDAMENTALS:
Pivot Slips, Hop Turns, White Pass Turn, Stem Christie, Short Radius Leapers, Outside Ski Turn, Javelin Turns, Reverse Javelin Turn, Falling Leaf with Edge Change

INTEGRATING FUNDAMENTALS (Center Line):
L1: Wedge Turn | L2: Wedge Christie | L2: Basic Parallel | L3: Dynamic Parallel
Common Threads observed: Both skis on snow, matching ankle angles, simultaneous turn initiation, countered relationship in transition, independent leg flex/extend, torso stability supports lower body mobility

VERSATILITY:
L1: Parallel Skiing Groomed, Parallel Skiing Variable Terrain
L2: Dynamic Short Turns, Carved Long Turns, Variable Conditions/Terrain, Large Turns Bumps
L3: Performance Short Turns, Performance Medium Turns, Variable Conditions/Terrain (black/double-black), Short Turns Bumps, Basic Parallel Short Turns Bumps, Lane Change

ALPINE SKIING FUNDAMENTALS (Updated Nov 2025):
- Pressure Control (fore/aft): Control CM to BoS relationship to direct pressure along ski length
- Pressure Control (ski to ski): Control pressure from ski to ski, direct toward outside ski
- Pressure Control (magnitude): Regulate magnitude of pressure through ski/snow interaction
- Edge Control: Control edge angles through inclination and angulation
- Rotational Control: Control ski rotation with leg rotation, separate from upper body

═══ PSIA CORE FRAMEWORKS ═══

SKILLS CONCEPT — The Three Skills
Edging, Pressure, Rotary. Balance/stance is the OUTCOME, not a skill.

CAP MODEL — Cognitive, Affective, Physical
Cognitive: Can the instructor explain WHY? Affective: How do they feel? Are they ready for feedback? Physical: Can they execute? What limitations exist?

LEARNING CONNECTION MODEL (LCM)
Technical Skills + Teaching Skills + People Skills. All three assessed simultaneously at AT level.

FITTS & POSNER — Motor Learning Stages
1-Cognitive Low, 2-Cognitive High, 3-Associative Low, 4-Associative High (PASS), 5-Autonomous Low, 6-Autonomous High

5 FUNDAMENTALS: CM/BoS control, Pressure ski-to-ski, Edge angles, Rotational control, Dynamic stance on outside ski

CENTER LINE: Wedge Turn → Wedge Christie → Basic Parallel → Dynamic Parallel

COMMON THREADS: Both skis on snow, matching ankle flex, simultaneous turn guidance, countered relationship, independent leg flex/extend, torso stability

PHYSICS: Forces (gravity, centripetal, friction), momentum, angular momentum, CM dynamics
BIOMECHANICS: Kinetic chain, ankle flexion, femur rotation, angulation vs inclination, separation
SKI DESIGN: Sidecut, camber, rocker, flex, torsional stiffness, waist width

═══ AT ASSESSMENT SCORECARDS ═══

ASSESSMENT SCALE (all modules): 1=Not observed, 2=Beginning to appear, 3=Appear but inconsistently, 4=Satisfactory (PASS), 5=Frequently above required, 6=Continuously superior. All sections must average 4+ to pass.

MA/TECHNICAL UNDERSTANDING SCORECARD:
Movement Analysis criteria:
- Describe Performance: Accurately describes detailed ski AND body performance
- Cause and Effect: Prioritizes fundamentals, uses cause-effect relationships using any combination of skiing fundamentals
- Evaluate: Compares observed performance to intended outcome (speed, turn shape, turn size, line, ski-snow interaction)
- Prescription: Prescribes SPECIFIC changes to achieve specific outcome affecting speed, shape, size, line, ski-snow interaction
- Equipment: Identifies positive or negative effects of equipment on performance

Technical Understanding criteria:
- Understanding of Desired Performances: Accurately identify and describe using MULTIPLE fundamentals in BLENDED relationships
- Biomechanics/Physics: Accurately use and describe relevant biomechanics and physics principles
- Utilizes Resources: Prioritizes information from multiple resources for skier's benefit
- Communication: Descriptions and demonstrations aid understanding for other participants

CLINIC LEADING SCORECARD:
Instructor Decisions: Professionalism, Needs/Safety, Behavior Management
People Skills: Two-way communication, Verbal/non-verbal customization, Active listening, Feedback delivery
Relationships: Group dynamic management, Motivations/emotions, Group consensus
Clinic Skills: Assess & Plan, Continual assessment, Collaborate, Plan creative/playful/exploratory LEs, Implement/adapt, Manage risk, Reflect/review, Explore/experiment/play, Describe change, Relate change to skiing

SKIING SCORECARD:
Instructor Decisions: Professionalism, Needs/Safety, Behavior Management
Performance: Adjust/adapt fundamentals at all speeds for training needs (inspiration, understanding, highlighting blends, tactical choices, problem solving), Integrate fundamentals, Individual fundamentals, Versatility

═══ ADD YOUR OWN NOTES BELOW ═══
`); // PSIA content — editable by Mark
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── UI State ────────────────────────────────────────────
  const [tab, setTab] = useState("journal");
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [editingTheme, setEditingTheme] = useState(null);
  const [editingCheckpoint, setEditingCheckpoint] = useState(null);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState(null);
  const [sparringMessages, setSparringMessages] = useState([]);
  const [sparringInput, setSparringInput] = useState("");
  const [sparringLoading, setSparringLoading] = useState(false);
  const [sparringMode, setSparringMode] = useState("open"); // open | scenario | reverse | compare | video | writtenma
  const [writtenMA, setWrittenMA] = useState({ who: "", activity: "", conditions: "", transcript: "", videoUrl: "" });
  const [writtenMAResult, setWrittenMAResult] = useState(null);
  const [writtenMAScenario, setWrittenMAScenario] = useState(null);
  const [writtenMADialog, setWrittenMADialog] = useState([]); // follow-up Q&A messages
  const [writtenMAPhase, setWrittenMAPhase] = useState("setup"); // setup | write | dialog | scored
  const [writtenMALoading, setWrittenMALoading] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeResponse, setChallengeResponse] = useState(null);
  const [analyzingMA, setAnalyzingMA] = useState(null); // session id being analyzed

  const saveTimerRef = useRef({});

  // ── Load data ──────────────────────────────────────────
  useEffect(() => {
    if (!getApiUrl()) { setDataLoaded(true); return; }
    async function loadAll() {
      try {
        // Load journal entries
        const rows = await apiGet("JournalEntries");
        console.log("Loaded rows:", rows.length, "ids:", rows.map(r => r.id).slice(0, 10));
        const parsed = rows.filter(r => r.id && !r.id.startsWith("_")).map(r => {
          let connectionTags = [];
          let themeIds = [];
          let mentorPulse = {};
          let mentorComments = [];
          try { connectionTags = r.connectionTags ? JSON.parse(r.connectionTags) : []; } catch(e) { console.warn("Bad connectionTags for", r.id, r.connectionTags); }
          try { themeIds = r.themeIds ? JSON.parse(r.themeIds) : []; } catch(e) { console.warn("Bad themeIds for", r.id); }
          try { mentorPulse = r.mentorPulse ? JSON.parse(r.mentorPulse) : {}; } catch(e) { console.warn("Bad mentorPulse for", r.id); }
          try { mentorComments = r.mentorComments ? JSON.parse(r.mentorComments) : []; } catch(e) { console.warn("Bad mentorComments for", r.id); }
          return { ...r, connectionTags, themeIds, mentorPulse, mentorComments };
        });
        console.log("Parsed entries:", parsed.length);
        setEntries(parsed);

        // Load themes
        const themeRow = rows.find(r => r.id === "_THEMES");
        if (themeRow && themeRow.data) {
          try { setThemes(JSON.parse(themeRow.data)); } catch(e) {}
        }

        // Load checkpoints
        const cpRow = rows.find(r => r.id === "_CHECKPOINTS");
        if (cpRow && cpRow.data) {
          try { setCheckpoints(JSON.parse(cpRow.data)); } catch(e) {}
        }

        // Load mentor coaching notes for AI
        const cnRow = rows.find(r => r.id === "_COACH_NOTES");
        if (cnRow && cnRow.data) {
          try { setMentorCoachNotes(JSON.parse(cnRow.data)); } catch(e) {}
        }

        // Load reference materials
        const rmRow = rows.find(r => r.id === "_REFERENCE_MATERIALS");
        if (rmRow && rmRow.data) {
          setReferenceMaterials(rmRow.data);
        }

        // Load MA session transcripts
        const maRow = rows.find(r => r.id === "_MA_SESSIONS");
        if (maRow && maRow.data) {
          try { setMaSessions(JSON.parse(maRow.data)); } catch(e) {}
        }

        // Load videos
        const vidRow = rows.find(r => r.id === "_VIDEOS");
        if (vidRow && vidRow.data) {
          try { setVideos(JSON.parse(vidRow.data)); } catch(e) {}
        }

        // Load clinic feedback
        const cfRow = rows.find(r => r.id === "_CLINIC_FEEDBACK");
        if (cfRow && cfRow.data) {
          try { setClinicFeedback(JSON.parse(cfRow.data)); } catch(e) {}
        }

      } catch (e) { console.error("Failed to load:", e); }
      setDataLoaded(true);
    }
    loadAll();
  }, []);

  // ── Helpers ────────────────────────────────────────────
  const saveEntry = (entry) => {
    const isNew = !entries.find(e => e.id === entry.id);
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = entry; return n; }
      return [entry, ...prev];
    });
    const sheetRow = {
      ...entry,
      connectionTags: JSON.stringify(entry.connectionTags || []),
      themeIds: JSON.stringify(entry.themeIds || []),
      mentorPulse: JSON.stringify(entry.mentorPulse || {}),
      mentorComments: JSON.stringify(entry.mentorComments || []),
    };
    if (isNew) apiCreate("JournalEntries", sheetRow);
    else apiUpdate("JournalEntries", sheetRow);
  };

  const saveThemes = (newThemes) => {
    setThemes(newThemes);
    apiUpdate("JournalEntries", { id: "_THEMES", data: JSON.stringify(newThemes) });
  };

  const saveCheckpoints = (newCps) => {
    setCheckpoints(newCps);
    apiUpdate("JournalEntries", { id: "_CHECKPOINTS", data: JSON.stringify(newCps) });
  };

  const saveCoachNotes = (notes) => {
    setMentorCoachNotes(notes);
    apiUpdate("JournalEntries", { id: "_COACH_NOTES", data: JSON.stringify(notes) });
  };

  const saveReferenceMaterials = (text) => {
    setReferenceMaterials(text);
    if (saveTimerRef.current._ref) clearTimeout(saveTimerRef.current._ref);
    saveTimerRef.current._ref = setTimeout(() => {
      apiUpdate("JournalEntries", { id: "_REFERENCE_MATERIALS", data: text });
    }, 2000);
  };

  const saveMaSessions = (sessions) => {
    setMaSessions(sessions);
    apiUpdate("JournalEntries", { id: "_MA_SESSIONS", data: JSON.stringify(sessions) });
  };

  const saveVideos = (vids) => {
    setVideos(vids);
    apiUpdate("JournalEntries", { id: "_VIDEOS", data: JSON.stringify(vids) });
  };

  const saveClinicFeedback = (fb) => {
    setClinicFeedback(fb);
    apiUpdate("JournalEntries", { id: "_CLINIC_FEEDBACK", data: JSON.stringify(fb) });
  };


  // Build enhanced system prompt with all context layers
  const buildSystemPrompt = (baseSystem) => {
    let prompt = baseSystem;

    // Layer 1: Mentor coaching notes
    const noteEntries = Object.entries(mentorCoachNotes).filter(([, v]) => v?.trim());
    if (noteEntries.length > 0) {
      prompt += "\n\n=== MENTOR COACHING NOTES ===\nThe following notes are from Mark's mentors. Use these to personalize your coaching:\n";
      noteEntries.forEach(([key, note]) => {
        const name = USERS[key]?.name || key;
        prompt += `\n${name}: "${note}"`;
      });
    }

    // Layer 2: Recent reflection history
    const recentEntries = [...entries]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 8);
    if (recentEntries.length > 0) {
      prompt += "\n\n=== MARK'S RECENT REFLECTIONS (most recent first) ===\nUse these to track Mark's development arc. Reference them when relevant — notice patterns, growth, and recurring gaps.\n";
      recentEntries.forEach(e => {
        const tags = (e.connectionTags || []).join(", ");
        prompt += `\n[${e.date} · ${e.context}${e.location ? ` · ${e.location}` : ""} · Depth: ${e.depthLevel || "unset"} · Connections: ${tags || "none"}]`;
        if (e.whatISaw) prompt += `\nSaw: ${e.whatISaw.slice(0, 200)}`;
        if (e.whatWasGoingOn) prompt += `\nRoot cause: ${e.whatWasGoingOn.slice(0, 200)}`;
        if (e.whatIDid) prompt += `\nAction: ${e.whatIDid.slice(0, 150)}`;
        if (e.whyThatApproach) prompt += `\nWhy: ${e.whyThatApproach.slice(0, 150)}`;
        prompt += "\n";
      });
    }

    // Layer 3: Reference materials
    if (referenceMaterials.trim()) {
      prompt += `\n\n=== PSIA REFERENCE MATERIALS ===\nUse this knowledge when coaching Mark. Reference these frameworks, concepts, and criteria in your feedback:\n\n${referenceMaterials.slice(0, 8000)}`;
    }

    // Layer 4: MA session transcripts and analysis
    const recentMA = [...maSessions].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 4);
    if (recentMA.length > 0) {
      prompt += "\n\n=== MARK'S MA SESSION TRANSCRIPTS ===\nThese are Mark's actual MA practice sessions with mentor feedback and AI analysis. Use them to identify patterns in how he analyzes, articulates, and prioritizes. Push on recurring gaps.\n";
      recentMA.forEach(s => {
        prompt += `\n[${s.date} · ${s.context || ""} · Analyzing: ${s.who || "unknown"} · Activity: ${s.activity || ""}]`;
        // Use structured summary if available, otherwise raw transcript
        if (s.summary) {
          try {
            const parsed = typeof s.summary === "string" ? JSON.parse(s.summary) : s.summary;
            if (parsed.scores) {
              prompt += `\nScores: Describe=${parsed.scores.describe} Cause/Effect=${parsed.scores.cause_effect} Evaluate=${parsed.scores.evaluate} Prescription=${parsed.scores.prescription} Bio/Physics=${parsed.scores.biomechanics} Communication=${parsed.scores.communication}`;
            }
            if (parsed.gaps) prompt += `\nGaps: ${parsed.gaps.join(", ")}`;
            if (parsed.mentor_corrections) prompt += `\nMentor corrections: ${parsed.mentor_corrections}`;
            if (parsed.key_learning) prompt += `\nKey focus: ${parsed.key_learning}`;
          } catch(e) {
            prompt += `\n${(s.summary || "").slice(0, 400)}`;
          }
        } else {
          prompt += `\nMA: ${(s.transcript || "").slice(0, 400)}`;
          if (s.notes) prompt += `\nMentor: ${s.notes.slice(0, 200)}`;
        }
        prompt += "\n";
      });
    }

    return prompt;
  };

  const activeThemes = themes.filter(t => t.active);
  const isSubView = !!editingEntry || !!viewingEntry || !!editingTheme || !!editingCheckpoint;
  const isMentor = currentUser?.role === "mentor";
  const isCandidate = currentUser?.role === "candidate";

  const CANDIDATE_TABS = ["journal", "themes", "resources", "growth", "checkpoints", "videos", "timeline", "clinics", "sparring"];
  const MENTOR_TABS = ["journal", "themes", "growth", "checkpoints", "videos", "timeline"];
  const VISIBLE_TABS = isCandidate ? CANDIDATE_TABS : MENTOR_TABS;

  // ── Styles (aliased from constants for brevity) ──
  const inp = INP_STYLE;
  const txta = TXTA_STYLE;
  const lbl = LBL_STYLE;

  // ── Login ──────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(178deg, #070c18 0%, #0d1828 35%, #101e34 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ width: "100%", maxWidth: 340, padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#e8a050", letterSpacing: "-0.03em" }}>AT Journal</div>
            <div style={{ fontSize: 14, color: "#7a9ab5", marginTop: 6 }}>Alpine Trainer Development</div>
          </div>
          {Object.entries(USERS).map(([key, user]) => (
            <button key={key} onClick={() => { setPinInput(""); setPinError(false); setCurrentUser({ ...user, key, pendingAuth: true }); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px", marginBottom: 8,
              borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "left",
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${user.color}20`, border: `2px solid ${user.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: user.color }}>{user.name[0]}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#d0d8e0" }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "#7a9ab5" }}>{user.role === "candidate" ? "Candidate" : "Mentor / Assessor"}</div>
              </div>
            </button>
          ))}
          {currentUser?.pendingAuth && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#d0d8e0", marginBottom: 8 }}>PIN for {currentUser.name}</div>
              <input type="password" maxLength={4} value={pinInput} autoFocus onChange={e => {
                const v = e.target.value;
                setPinInput(v);
                setPinError(false);
                if (v.length === 4) {
                  if (v === currentUser.pin) { setCurrentUser(prev => ({ ...prev, pendingAuth: false })); }
                  else { setPinError(true); setPinInput(""); }
                }
              }} style={{ width: 120, textAlign: "center", padding: "10px", fontSize: 22, letterSpacing: 8, color: "#d0d8e0", background: "rgba(255,255,255,0.03)", border: `2px solid ${pinError ? "#e05028" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, outline: "none", fontFamily: "inherit" }} />
              {pinError && <div style={{ color: "#e05028", fontSize: 13, marginTop: 6 }}>Wrong PIN</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentUser.pendingAuth) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(178deg, #070c18 0%, #0d1828 35%, #101e34 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, color: "#d0d8e0", marginBottom: 12 }}>PIN for {currentUser.name}</div>
          <input type="password" maxLength={4} value={pinInput} autoFocus onChange={e => {
            const v = e.target.value;
            setPinInput(v);
            setPinError(false);
            if (v.length === 4) {
              if (v === currentUser.pin) { setCurrentUser(prev => ({ ...prev, pendingAuth: false })); }
              else { setPinError(true); setPinInput(""); }
            }
          }} style={{ width: 120, textAlign: "center", padding: "10px", fontSize: 22, letterSpacing: 8, color: "#d0d8e0", background: "rgba(255,255,255,0.03)", border: `2px solid ${pinError ? "#e05028" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, outline: "none", fontFamily: "inherit" }} />
          {pinError && <div style={{ color: "#e05028", fontSize: 13, marginTop: 6 }}>Wrong PIN</div>}
          <div><button onClick={() => setCurrentUser(null)} style={{ background: "none", border: "none", color: "#7a9ab5", fontSize: 13, cursor: "pointer", marginTop: 12 }}>← Back</button></div>
        </div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(178deg, #070c18 0%, #0d1828 35%, #101e34 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a9ab5" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        Loading...
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(178deg, #070c18 0%, #0d1828 35%, #101e34 100%)", color: "#e0e8f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "18px 16px 12px", background: "rgba(255,255,255,0.01)" }}>
        <div className="at-container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: "#f0f4f8" }}>AT Journal</span>
              <span style={{ fontSize: 13, color: "#4d6888", fontWeight: 500 }}>Mark · Keystone</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${currentUser.color}20`, border: `1.5px solid ${currentUser.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: currentUser.color }}>{currentUser.name[0]}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e0" }}>{currentUser.name}</span>
              <button onClick={() => { setCurrentUser(null); setPinInput(""); }} style={{ background: "none", border: "none", color: "#4d6888", fontSize: 12, cursor: "pointer" }}>logout</button>
            </div>
          </div>

          {/* Tabs */}
          {!isSubView && (
            <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { id: "journal", label: `Journal (${entries.length})` },
                { id: "themes", label: "Themes" },
                { id: "resources", label: "Resources" },
                { id: "growth", label: "Growth" },
                { id: "checkpoints", label: "Checkpoints" },
                { id: "videos", label: `Videos (${videos.length})` },
                { id: "timeline", label: "Timeline" },
                { id: "clinics", label: `Clinics (${clinicFeedback.length})` },
                { id: "sparring", label: "Sparring Partner" },
              ].filter(t => VISIBLE_TABS.includes(t.id)).map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                  border: tab === t.id ? "1.5px solid rgba(224,120,48,0.45)" : "1.5px solid rgba(255,255,255,0.07)",
                  background: tab === t.id ? "rgba(224,120,48,0.1)" : "rgba(255,255,255,0.015)",
                  color: tab === t.id ? "#e8a050" : "#7a9ab5", cursor: "pointer",
                }}>{t.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="at-container" style={{ padding: "16px 16px 60px" }}>

        {/* ═══ JOURNAL — Entry List ═══ */}
        {tab === "journal" && !isSubView && (
          <>
            {isCandidate && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, color: "#7a9ab5" }}>Reflect on your on-snow experiences. Go deeper than what happened — explore <em>why</em>.</div>
                <button onClick={() => setEditingEntry({
                  id: uid(), date: today(), context: "Clinic", location: "", conditions: "",
                  whatISaw: "", whatWasGoingOn: "", whatIDid: "", whyThatApproach: "", whatHappened: "", whatIdDoDifferently: "",
                  videoUrl: "", connectionTags: [], themeIds: [], depthLevel: "", resourceId: "",
                  season: getCurrentSeason(), mentorPulse: {}, mentorComments: [], timestamp: new Date().toISOString(),
                })} style={{
                  padding: "7px 14px", borderRadius: 6, border: "1px solid rgba(224,120,48,0.4)",
                  background: "rgba(224,120,48,0.1)", color: "#e8a050", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0, marginLeft: 10,
                }}>+ New Reflection</button>
              </div>
            )}

            {/* Theme filter */}
            {activeThemes.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                <button onClick={() => setSelectedThemeFilter(null)} style={{
                  padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: !selectedThemeFilter ? "rgba(224,120,48,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${!selectedThemeFilter ? "rgba(224,120,48,0.3)" : "rgba(255,255,255,0.05)"}`,
                  color: !selectedThemeFilter ? "#e8a050" : "#7a9ab5",
                }}>All</button>
                {activeThemes.map(t => (
                  <button key={t.id} onClick={() => setSelectedThemeFilter(t.id)} style={{
                    padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: selectedThemeFilter === t.id ? "rgba(224,120,48,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedThemeFilter === t.id ? "rgba(224,120,48,0.3)" : "rgba(255,255,255,0.05)"}`,
                    color: selectedThemeFilter === t.id ? "#e8a050" : "#7a9ab5",
                  }}>{t.question.length > 30 ? t.question.slice(0, 30) + "…" : t.question}</button>
                ))}
              </div>
            )}

            {entries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#3a5068" }}>
                <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.4 }}>📓</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#7a9ab5" }}>No reflections yet</div>
                <div style={{ fontSize: 14, color: "#3a5068", marginTop: 4 }}>After your next on-snow session, come here and reflect on what happened.</div>
              </div>
            ) : (
              entries
                .filter(e => !selectedThemeFilter || (e.themeIds || []).includes(selectedThemeFilter))
                .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                .map(e => {
                  const depth = DEPTH_LEVELS.find(d => d.id === e.depthLevel);
                  const pulse = Object.values(e.mentorPulse || {});
                  const commentCount = (e.mentorComments || []).length;
                  return (
                    <div key={e.id} onClick={() => setViewingEntry(e)} style={{ cursor: "pointer" }}>
                      <Card style={{ borderLeft: `3px solid ${depth ? depth.color : "rgba(255,255,255,0.06)"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 12, color: "#7a9ab5", marginBottom: 4 }}>
                              {e.date} · {e.context}{e.location ? ` · ${e.location}` : ""}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#d0d8e0", lineHeight: 1.4 }}>
                              {e.whatISaw ? (e.whatISaw.length > 100 ? e.whatISaw.slice(0, 100) + "…" : e.whatISaw) : "Untitled reflection"}
                            </div>
                          </div>
                          {depth && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${depth.color}15`, border: `1px solid ${depth.color}30`, color: depth.color, flexShrink: 0, marginLeft: 8 }}>
                              {depth.label}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                          {(e.connectionTags || []).map(tagId => {
                            const dom = DOMAINS.find(d => d.id === tagId);
                            return dom ? <span key={tagId} style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: `${dom.color}12`, color: dom.color }}>{dom.label}</span> : null;
                          })}
                          {pulse.length > 0 && (
                            <span style={{ fontSize: 10, color: "#7a9ab5", marginLeft: 4 }}>
                              {pulse.map(p => PULSE_OPTIONS.find(o => o.id === p)?.icon || "").join(" ")}
                            </span>
                          )}
                          {commentCount > 0 && <span style={{ fontSize: 10, color: "#28a858" }}>💬 {commentCount}</span>}
                          {e.videoUrl && <span style={{ fontSize: 10, color: "#3088cc" }}>🎥</span>}
                        </div>
                      </Card>
                    </div>
                  );
                })
            )}
          </>
        )}

        {/* ═══ JOURNAL — View Entry ═══ */}
        {viewingEntry && !editingEntry && (() => {
          const e = viewingEntry;
          const depth = DEPTH_LEVELS.find(d => d.id === e.depthLevel);
          return (
            <div>
              <button onClick={() => { setViewingEntry(null); setChallengeResponse(null); }} style={{ background: "none", border: "none", color: "#7a9ab5", fontSize: 14, cursor: "pointer", padding: "0 0 10px", fontWeight: 600 }}>← Back</button>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#7a9ab5" }}>{e.date} · {e.context}{e.location ? ` · ${e.location}` : ""}{e.conditions ? ` · ${e.conditions}` : ""}</div>
                  {isCandidate && <button onClick={() => setEditingEntry({ ...e })} style={{ padding: "4px 10px", borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#7a9ab5", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>}
                </div>

                {PROMPTS.map(p => {
                  const val = e[p.id];
                  if (!val) return null;
                  return (
                    <div key={p.id} style={{ marginBottom: 14 }}>
                      <SectionLabel>{p.label}</SectionLabel>
                      <p style={{ fontSize: 15, color: "#d0d8e0", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{val}</p>
                    </div>
                  );
                })}

                {e.videoUrl && (
                  <div style={{ marginBottom: 14 }}>
                    <SectionLabel>Video</SectionLabel>
                    <a href={e.videoUrl} target="_blank" rel="noreferrer" style={{ color: "#3088cc", fontSize: 14, wordBreak: "break-all" }}>{e.videoUrl}</a>
                  </div>
                )}

                {/* Connection tags */}
                {(e.connectionTags || []).length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <SectionLabel>Connections</SectionLabel>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {e.connectionTags.map(tagId => {
                        const dom = DOMAINS.find(d => d.id === tagId);
                        return dom ? <span key={tagId} style={{ fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: `${dom.color}12`, border: `1px solid ${dom.color}25`, color: dom.color }}>{dom.label}</span> : null;
                      })}
                    </div>
                  </div>
                )}

                {depth && (
                  <div style={{ marginBottom: 14 }}>
                    <SectionLabel>Self-Assessed Depth</SectionLabel>
                    <span style={{ fontSize: 14, fontWeight: 700, color: depth.color }}>{depth.label}</span>
                    <span style={{ fontSize: 13, color: "#7a9ab5", marginLeft: 8 }}>— {depth.desc}</span>
                  </div>
                )}
              </Card>

              {/* Challenge Me button */}
              {isCandidate && (
                <Card style={{ borderLeft: "3px solid #c060a0" }}>
                  <button onClick={async () => {
                    setChallengeLoading(true);
                    setChallengeResponse(null);
                    const reflectionText = PROMPTS.map(p => e[p.id] ? `${p.label}\n${e[p.id]}` : "").filter(Boolean).join("\n\n");
                    const resp = await callClaude([
                      { role: "user", content: `Here is my reflection from ${e.date} (${e.context}${e.location ? `, ${e.location}` : ""}):\n\n${reflectionText}\n\nI tagged these connections: ${(e.connectionTags || []).join(", ")}. I assessed my depth as: ${e.depthLevel || "not set"}.\n\nChallenge my thinking. Push me to go deeper. What am I missing? What connections haven't I made?` }
                    ], buildSystemPrompt(AT_COACH_SYSTEM));
                    setChallengeResponse(resp);
                    setChallengeLoading(false);
                  }} disabled={challengeLoading} style={{
                    padding: "10px 16px", borderRadius: 7, border: "1px solid rgba(192,96,160,0.3)",
                    background: challengeLoading ? "rgba(255,255,255,0.03)" : "rgba(192,96,160,0.08)",
                    color: challengeLoading ? "#7a9ab5" : "#c060a0", fontSize: 14, fontWeight: 700, cursor: challengeLoading ? "default" : "pointer", width: "100%",
                  }}>
                    {challengeLoading ? "Thinking..." : "🧠 Challenge My Thinking"}
                  </button>
                  {challengeResponse && (
                    <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(192,96,160,0.04)", border: "1px solid rgba(192,96,160,0.1)" }}>
                      <div style={{ fontSize: 14, color: "#d0d8e0", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{challengeResponse}</div>
                    </div>
                  )}
                </Card>
              )}

              {/* Mentor pulse check + comments */}
              <Card>
                <SectionLabel>Mentor Feedback</SectionLabel>

                {/* Existing pulse checks */}
                {Object.entries(e.mentorPulse || {}).map(([mentorKey, pulseId]) => {
                  const mentor = USERS[mentorKey];
                  const pulse = PULSE_OPTIONS.find(p => p.id === pulseId);
                  if (!mentor || !pulse) return null;
                  return (
                    <div key={mentorKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 8px", borderRadius: 5, background: `${pulse.color}08` }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${mentor.color}20`, border: `1.5px solid ${mentor.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: mentor.color }}>{mentor.name[0]}</div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: pulse.color }}>{pulse.icon} {pulse.label}</span>
                      <span style={{ fontSize: 11, color: "#4d6888" }}>{pulse.desc}</span>
                    </div>
                  );
                })}

                {/* Mentor can set pulse */}
                {isMentor && !e.mentorPulse?.[currentUser.key] && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {PULSE_OPTIONS.map(p => (
                      <button key={p.id} onClick={() => {
                        const updated = { ...e, mentorPulse: { ...(e.mentorPulse || {}), [currentUser.key]: p.id } };
                        saveEntry(updated);
                        setViewingEntry(updated);
                      }} style={{
                        flex: 1, padding: "8px 6px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        background: `${p.color}10`, border: `1.5px solid ${p.color}30`, color: p.color,
                      }}>{p.icon} {p.label}</button>
                    ))}
                  </div>
                )}

                {/* Comments */}
                {(e.mentorComments || []).map((c, ci) => {
                  const commenter = USERS[c.userId] || { name: c.userId, color: "#7a9ab5" };
                  return (
                    <div key={ci} style={{ display: "flex", gap: 8, marginBottom: 6, padding: "8px 10px", borderRadius: 6, background: `${commenter.color}06`, border: `1px solid ${commenter.color}12` }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: `${commenter.color}20`, border: `1.5px solid ${commenter.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: commenter.color }}>{commenter.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: commenter.color }}>{commenter.name}</span>
                          <span style={{ fontSize: 10, color: "#4d6888" }}>{c.timestamp ? new Date(c.timestamp).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}</span>
                        </div>
                        <div style={{ fontSize: 14, color: "#d0d8e0", lineHeight: 1.5, whiteSpace: "pre-wrap", marginTop: 2 }}>{c.text}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Add comment */}
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 6 }}>
                  <textarea id="entry-comment" placeholder={isMentor ? "Coach Mark on this reflection..." : "Respond to mentor feedback..."} style={{ ...txta, minHeight: 36, flex: 1, fontSize: 13 }} />
                  <button onClick={() => {
                    const el = document.getElementById("entry-comment");
                    const text = el.value.trim();
                    if (!text) return;
                    const updated = { ...e, mentorComments: [...(e.mentorComments || []), { userId: currentUser.key, text, timestamp: new Date().toISOString() }] };
                    saveEntry(updated);
                    setViewingEntry(updated);
                    el.value = "";
                  }} style={{ padding: "6px 12px", borderRadius: 5, fontSize: 13, fontWeight: 700, background: `${currentUser.color}12`, border: `1px solid ${currentUser.color}30`, color: currentUser.color, cursor: "pointer", flexShrink: 0 }}>Post</button>
                </div>
              </Card>
            </div>
          );
        })()}

        {/* ═══ JOURNAL — Edit Entry ═══ */}
        {editingEntry && (() => {
          const e = editingEntry;
          const upd = (f, v) => setEditingEntry(p => ({ ...p, [f]: v }));
          const filledPrompts = PROMPTS.filter(p => e[p.id]?.trim()).length;
          return (
            <div>
              <button onClick={() => setEditingEntry(null)} style={{ background: "none", border: "none", color: "#7a9ab5", fontSize: 14, cursor: "pointer", padding: "0 0 10px", fontWeight: 600 }}>← Cancel</button>
              <Card>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: "#e0e8f0" }}>
                  {entries.find(x => x.id === e.id) ? "Edit Reflection" : "New Reflection"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div><label style={lbl}>Date</label><input type="date" value={e.date} onChange={ev => upd("date", ev.target.value)} style={inp} /></div>
                  <div>
                    <label style={lbl}>Context</label>
                    <select value={e.context} onChange={ev => upd("context", ev.target.value)} style={{ ...inp, cursor: "pointer", appearance: "auto" }}>
                      {CONTEXTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Location</label><input value={e.location} onChange={ev => upd("location", ev.target.value)} placeholder="e.g., Keystone — Run 6" style={inp} /></div>
                </div>

                {/* 6 Prompts */}
                {PROMPTS.map((p, pi) => {
                  const prevFilled = pi === 0 || e[PROMPTS[pi - 1].id]?.trim();
                  const showNudge = pi > 0 && p.nudge && prevFilled && !e[p.id]?.trim() && filledPrompts >= 2;
                  return (
                    <div key={p.id} style={{ marginBottom: 14 }}>
                      <label style={lbl}>{pi + 1}. {p.label}</label>
                      {showNudge && (
                        <div style={{ fontSize: 12, color: "#c060a0", marginBottom: 4, fontStyle: "italic" }}>💡 {p.nudge}</div>
                      )}
                      <textarea value={e[p.id] || ""} onChange={ev => upd(p.id, ev.target.value)} placeholder={p.placeholder} style={txta} />
                    </div>
                  );
                })}

                {/* Video */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Video Link (optional)</label>
                  <input value={e.videoUrl || ""} onChange={ev => upd("videoUrl", ev.target.value)} placeholder="YouTube or Google Drive link" style={inp} />
                </div>

                {/* Connection Tags */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>What domains did you connect? (select all that apply)</label>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {DOMAINS.map(d => {
                      const on = (e.connectionTags || []).includes(d.id);
                      return (
                        <button key={d.id} onClick={() => upd("connectionTags", on ? e.connectionTags.filter(x => x !== d.id) : [...(e.connectionTags || []), d.id])} style={{
                          padding: "5px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          background: on ? `${d.color}15` : "rgba(255,255,255,0.02)",
                          border: `1.5px solid ${on ? d.color : "rgba(255,255,255,0.06)"}`,
                          color: on ? d.color : "#7a9ab5",
                        }}>{d.label}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Tags */}
                {activeThemes.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Which themes does this push on?</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {activeThemes.map(t => {
                        const on = (e.themeIds || []).includes(t.id);
                        return (
                          <label key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: on ? "rgba(224,120,48,0.06)" : "rgba(255,255,255,0.015)", border: `1px solid ${on ? "rgba(224,120,48,0.2)" : "rgba(255,255,255,0.04)"}` }}>
                            <input type="checkbox" checked={on} onChange={() => upd("themeIds", on ? e.themeIds.filter(x => x !== t.id) : [...(e.themeIds || []), t.id])} style={{ marginTop: 2, accentColor: "#e07830" }} />
                            <span style={{ fontSize: 13, color: on ? "#d0d8e0" : "#7a9ab5", lineHeight: 1.4 }}>{t.question}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Depth self-assessment */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>How deep did your thinking go?</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {DEPTH_LEVELS.map(d => (
                      <button key={d.id} onClick={() => upd("depthLevel", d.id)} style={{
                        flex: 1, padding: "10px 8px", borderRadius: 7, cursor: "pointer", textAlign: "center",
                        background: e.depthLevel === d.id ? `${d.color}15` : "rgba(255,255,255,0.02)",
                        border: `2px solid ${e.depthLevel === d.id ? d.color : "rgba(255,255,255,0.06)"}`,
                        color: e.depthLevel === d.id ? d.color : "#7a9ab5",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{d.label}</div>
                        <div style={{ fontSize: 11, marginTop: 2 }}>{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resource link */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Inspired by a resource? (optional)</label>
                  <select value={e.resourceId || ""} onChange={ev => upd("resourceId", ev.target.value)} style={{ ...inp, cursor: "pointer", appearance: "auto" }}>
                    <option value="">— None —</option>
                    {Object.entries(RESOURCES).map(([cat, r]) => (
                      <optgroup key={cat} label={cat}>
                        {r.items.map(item => <option key={item.id} value={item.id}>{item.id} — {item.title}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <button onClick={() => { saveEntry(e); setEditingEntry(null); setViewingEntry(null); }} style={{
                  width: "100%", padding: "12px", borderRadius: 7, border: "none",
                  background: "linear-gradient(135deg, #e07830, #c06020)", color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>Save Reflection</button>
              </Card>
            </div>
          );
        })()}

        {/* ═══ THEMES ═══ */}
        {tab === "themes" && !isSubView && (
          <>
            <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 14, lineHeight: 1.5 }}>
              Big developmental questions — not skills to check off. These evolve as you grow.
            </div>

            {themes.filter(t => t.active).map(t => {
              const count = entries.filter(e => (e.themeIds || []).includes(t.id)).length;
              return (
                <Card key={t.id} style={{ borderLeft: "3px solid #e07830" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#d0d8e0", marginBottom: 4, lineHeight: 1.4 }}>"{t.question}"</div>
                  <div style={{ fontSize: 13, color: "#7a9ab5", lineHeight: 1.5, marginBottom: 8 }}>{t.description}</div>
                  <div style={{ fontSize: 12, color: "#4d6888" }}>{count} reflection{count !== 1 ? "s" : ""} tagged to this theme</div>
                </Card>
              );
            })}

            {themes.filter(t => !t.active).length > 0 && (
              <>
                <SectionLabel>Retired Themes</SectionLabel>
                {themes.filter(t => !t.active).map(t => (
                  <Card key={t.id} style={{ opacity: 0.5 }}>
                    <div style={{ fontSize: 14, color: "#7a9ab5" }}>"{t.question}"</div>
                  </Card>
                ))}
              </>
            )}

            {isMentor && (
              <button onClick={() => setEditingTheme({ id: uid(), question: "", description: "", active: true, createdAt: new Date().toISOString() })} style={{
                padding: "8px 14px", borderRadius: 6, border: "1px solid rgba(224,120,48,0.3)", background: "rgba(224,120,48,0.08)",
                color: "#e8a050", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8,
              }}>+ Add Theme</button>
            )}

            {/* Mentor Coaching Notes for AI */}
            {isMentor && (
              <Card style={{ marginTop: 20, borderLeft: "3px solid #c060a0" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#c060a0", marginBottom: 4 }}>Your Coaching Notes for the AI Sparring Partner</div>
                <div style={{ fontSize: 13, color: "#7a9ab5", marginBottom: 12, lineHeight: 1.5 }}>
                  These notes are fed into Claude when Mark practices. Tell the AI what Mark tends to miss, where he needs pushing, what patterns you've observed. This makes the sparring partner smarter and more personalized.
                </div>
                <textarea
                  value={mentorCoachNotes[currentUser.key] || ""}
                  onChange={ev => {
                    const updated = { ...mentorCoachNotes, [currentUser.key]: ev.target.value };
                    setMentorCoachNotes(updated);
                    if (saveTimerRef.current._cn) clearTimeout(saveTimerRef.current._cn);
                    saveTimerRef.current._cn = setTimeout(() => saveCoachNotes(updated), 1500);
                  }}
                  placeholder={`e.g., "Mark tends to jump to rotary explanations first. Push him to consider pressure and edge interactions. His self-MA is weaker than his student MA — push harder when he talks about his own skiing."`}
                  style={{
                    width: "100%", minHeight: 80, padding: "10px 12px", fontSize: 14, color: "#d0d8e0",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 6, outline: "none", fontFamily: "inherit", resize: "vertical",
                    lineHeight: 1.6, boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 10, color: "#4d6888", marginTop: 4 }}>Auto-saves · Only you and the AI see your notes — Mark doesn't see them</div>
              </Card>
            )}

            {/* Show all mentor notes to candidate (read-only, without content — just who has contributed) */}
            {isCandidate && Object.values(mentorCoachNotes).some(n => n?.trim()) && (
              <Card style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, color: "#c060a0", fontWeight: 600 }}>
                  🧠 Your sparring partner has been enhanced with coaching notes from: {Object.entries(mentorCoachNotes).filter(([,v]) => v?.trim()).map(([k]) => USERS[k]?.name || k).join(", ")}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ═══ RESOURCES ═══ */}
        {tab === "resources" && !isSubView && (
          <>
            <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 14, lineHeight: 1.5 }}>
              Suggested activities from the AT Program Guide. Not a checklist — a menu of ideas for your development.
            </div>
            {Object.entries(RESOURCES).map(([catName, cat]) => (
              <div key={catName} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: cat.color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${cat.color}25` }}>{catName}</div>
                {cat.items.map(item => {
                  const usedCount = entries.filter(e => e.resourceId === item.id).length;
                  return (
                    <Card key={item.id} style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{item.id}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e0", marginLeft: 8 }}>{item.title}</span>
                          <div style={{ fontSize: 13, color: "#7a9ab5", marginTop: 3, lineHeight: 1.5 }}>{item.desc}</div>
                        </div>
                        {usedCount > 0 && <span style={{ fontSize: 11, color: "#28a858", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{usedCount} reflection{usedCount !== 1 ? "s" : ""}</span>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ))}

            {/* MA Session Transcripts */}
            <Card style={{ marginTop: 20, borderLeft: "3px solid #e8a050" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e8a050", marginBottom: 2 }}>MA Session Transcripts</div>
                  <div style={{ fontSize: 12, color: "#7a9ab5" }}>Record your MA practice sessions. The AI reads these to identify your analysis patterns.</div>
                </div>
                <button onClick={() => {
                  const newSession = { id: uid(), date: today(), context: "", who: "", activity: "", transcript: "", notes: "", summary: "" };
                  saveMaSessions([newSession, ...maSessions]);
                }} style={{
                  padding: "5px 12px", borderRadius: 5, fontSize: 12, fontWeight: 700,
                  background: "rgba(232,160,80,0.08)", border: "1px solid rgba(232,160,80,0.25)",
                  color: "#e8a050", cursor: "pointer", flexShrink: 0,
                }}>+ Add Session</button>
              </div>

              {maSessions.length === 0 && (
                <div style={{ fontSize: 13, color: "#4d6888", padding: "12px 0", fontStyle: "italic" }}>
                  No MA sessions recorded yet. After practicing MA with a mentor or peer, add a transcript here.
                </div>
              )}

              {maSessions.map((s, si) => (
                <div key={s.id} style={{
                  padding: "10px 12px", marginBottom: 8, borderRadius: 8,
                  background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>DATE</div>
                      <input type="date" value={s.date} onChange={ev => {
                        const updated = maSessions.map(x => x.id === s.id ? { ...x, date: ev.target.value } : x);
                        saveMaSessions(updated);
                      }} style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>WHO I ANALYZED</div>
                      <input value={s.who} onChange={ev => {
                        const updated = maSessions.map(x => x.id === s.id ? { ...x, who: ev.target.value } : x);
                        saveMaSessions(updated);
                      }} placeholder="e.g., L2 candidate, peer" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>ACTIVITY</div>
                      <input value={s.activity} onChange={ev => {
                        const updated = maSessions.map(x => x.id === s.id ? { ...x, activity: ev.target.value } : x);
                        saveMaSessions(updated);
                      }} placeholder="e.g., Dynamic Short Turns" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>CONTEXT</div>
                    <input value={s.context} onChange={ev => {
                      const updated = maSessions.map(x => x.id === s.id ? { ...x, context: ev.target.value } : x);
                      saveMaSessions(updated);
                    }} placeholder="e.g., Practice session with Chris on groomed blue, icy conditions" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>TRANSCRIPT / YOUR ANALYSIS</div>
                    <textarea value={s.transcript} onChange={ev => {
                      const updated = maSessions.map(x => x.id === s.id ? { ...x, transcript: ev.target.value } : x);
                      saveMaSessions(updated);
                    }} placeholder="Paste or type your MA here — exactly how you described what you saw, the skill interactions, root cause, and prescription..." style={{ ...txta, fontSize: 12, minHeight: 80 }} />
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>YOUR NOTES / MENTOR FEEDBACK</div>
                    <textarea value={s.notes} onChange={ev => {
                      const updated = maSessions.map(x => x.id === s.id ? { ...x, notes: ev.target.value } : x);
                      saveMaSessions(updated);
                    }} placeholder="What did your mentor say? What did you learn? What would you do differently?" style={{ ...txta, fontSize: 12, minHeight: 40 }} />
                  </div>

                  {/* Analyze button */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                    <button onClick={async () => {
                      if (!s.transcript?.trim()) return;
                      setAnalyzingMA(s.id);
                      const input = `MY MA:\n${s.transcript}\n\n${s.notes ? `MENTOR FEEDBACK:\n${s.notes}` : ""}\n\nContext: ${s.context || ""}, Analyzing: ${s.who || ""}, Activity: ${s.activity || ""}`;
                      const resp = await callClaude([{ role: "user", content: input }], MA_ANALYZER_SYSTEM);
                      try {
                        const clean = resp.replace(/```json|```/g, "").trim();
                        const parsed = JSON.parse(clean);
                        const updated = maSessions.map(x => x.id === s.id ? { ...x, summary: JSON.stringify(parsed) } : x);
                        saveMaSessions(updated);
                      } catch(e) {
                        const updated = maSessions.map(x => x.id === s.id ? { ...x, summary: resp } : x);
                        saveMaSessions(updated);
                      }
                      setAnalyzingMA(null);
                    }} disabled={analyzingMA === s.id || !s.transcript?.trim()} style={{
                      padding: "6px 14px", borderRadius: 5, fontSize: 12, fontWeight: 700,
                      background: analyzingMA === s.id ? "rgba(255,255,255,0.03)" : "rgba(192,96,160,0.08)",
                      border: "1px solid rgba(192,96,160,0.25)",
                      color: analyzingMA === s.id ? "#4d6888" : "#c060a0", cursor: analyzingMA === s.id ? "default" : "pointer",
                    }}>{analyzingMA === s.id ? "Analyzing..." : "🧠 Analyze My MA"}</button>
                    <button onClick={() => {
                      if (confirm("Delete this MA session?")) {
                        saveMaSessions(maSessions.filter(x => x.id !== s.id));
                      }
                    }} style={{
                      background: "none", border: "none", color: "#4d6888", fontSize: 11, cursor: "pointer",
                    }}>Delete</button>
                  </div>

                  {/* Summary display */}
                  {s.summary && (() => {
                    let parsed = null;
                    try { parsed = typeof s.summary === "string" ? JSON.parse(s.summary) : s.summary; } catch(e) {}
                    if (!parsed || !parsed.scores) {
                      return (
                        <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(192,96,160,0.04)", border: "1px solid rgba(192,96,160,0.1)", fontSize: 13, color: "#d0d8e0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                          {typeof s.summary === "string" ? s.summary : JSON.stringify(s.summary)}
                        </div>
                      );
                    }
                    const scoreColor = (v) => v >= 4 ? "#28a858" : v >= 3 ? "#e07830" : "#e05028";
                    return (
                      <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(192,96,160,0.04)", border: "1px solid rgba(192,96,160,0.1)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#c060a0", marginBottom: 8, textTransform: "uppercase" }}>AI Analysis</div>

                        {/* Scores */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                          {[
                            { key: "describe", label: "Describe" },
                            { key: "cause_effect", label: "Cause/Effect" },
                            { key: "evaluate", label: "Evaluate" },
                            { key: "prescription", label: "Prescription" },
                            { key: "biomechanics", label: "Bio/Physics" },
                            { key: "communication", label: "Communication" },
                          ].map(sc => (
                            <div key={sc.key} style={{ textAlign: "center", minWidth: 55 }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor(parsed.scores[sc.key] || 0) }}>{parsed.scores[sc.key] || "—"}</div>
                              <div style={{ fontSize: 9, color: "#7a9ab5", fontWeight: 600 }}>{sc.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Strengths and gaps */}
                        {parsed.strengths?.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#28a858" }}>STRENGTHS: </span>
                            <span style={{ fontSize: 12, color: "#d0d8e0" }}>{parsed.strengths.join(" · ")}</span>
                          </div>
                        )}
                        {parsed.gaps?.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#e07830" }}>GAPS: </span>
                            <span style={{ fontSize: 12, color: "#d0d8e0" }}>{parsed.gaps.join(" · ")}</span>
                          </div>
                        )}
                        {parsed.mentor_corrections && (
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#3088cc" }}>MENTOR CORRECTIONS: </span>
                            <span style={{ fontSize: 12, color: "#d0d8e0" }}>{parsed.mentor_corrections}</span>
                          </div>
                        )}
                        {parsed.key_learning && (
                          <div style={{ padding: "6px 8px", borderRadius: 4, background: "rgba(224,120,48,0.06)", border: "1px solid rgba(224,120,48,0.12)", marginTop: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#e8a050" }}>KEY FOCUS: </span>
                            <span style={{ fontSize: 12, color: "#d0d8e0" }}>{parsed.key_learning}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}

              {maSessions.length > 0 && (
                <div style={{ fontSize: 10, color: "#4d6888", marginTop: 4 }}>
                  {maSessions.length} session{maSessions.length !== 1 ? "s" : ""} recorded · Last 4 are sent to the AI sparring partner
                </div>
              )}
            </Card>

            {/* Reference Materials for AI */}
            <Card style={{ marginTop: 20, borderLeft: "3px solid #c060a0" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#c060a0", marginBottom: 4 }}>PSIA Reference Materials for AI Coach</div>
              <div style={{ fontSize: 13, color: "#7a9ab5", marginBottom: 12, lineHeight: 1.5 }}>
                Paste key PSIA content here — Skills Concept, Center Line, Common Threads, AT assessment criteria, or anything you want your sparring partner to reference when coaching you. The more context it has, the smarter it gets.
              </div>
              <textarea
                value={referenceMaterials}
                onChange={ev => saveReferenceMaterials(ev.target.value)}
                placeholder={"Paste PSIA reference content here. For example:\n\nSKILLS CONCEPT\nThe four skills — edging, pressure, rotary, and balance/stance — interact simultaneously...\n\nCENTER LINE\nLevel 1: Wedge Turn — ...\nLevel 2: Wedge Christie / Basic Parallel — ...\n\nAT ASSESSMENT CRITERIA\nModule 1 (Technical/MA): Demonstrate blended MA using 3+ skills..."}
                style={{
                  width: "100%", minHeight: 150, padding: "10px 12px", fontSize: 13, color: "#d0d8e0",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 6, outline: "none", fontFamily: "inherit", resize: "vertical",
                  lineHeight: 1.6, boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "#4d6888" }}>Auto-saves · {referenceMaterials.length > 0 ? `${referenceMaterials.length} characters` : "Empty"}</div>
                {referenceMaterials.length > 7500 && (
                  <div style={{ fontSize: 10, color: "#e07830" }}>Note: Only the first ~8000 characters are sent to the AI</div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* ═══ GROWTH ═══ */}
        {tab === "growth" && !isSubView && (() => {
          const sorted = [...entries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
          const depthCounts = { surface: 0, connecting: 0, integrated: 0 };
          sorted.forEach(e => { if (e.depthLevel) depthCounts[e.depthLevel]++; });
          const totalTagged = sorted.filter(e => (e.connectionTags || []).length > 0).length;
          const avgTags = totalTagged > 0 ? (sorted.reduce((sum, e) => sum + (e.connectionTags || []).length, 0) / totalTagged).toFixed(1) : "—";

          // Domain frequency
          const domainFreq = {};
          DOMAINS.forEach(d => { domainFreq[d.id] = 0; });
          entries.forEach(e => (e.connectionTags || []).forEach(t => { domainFreq[t] = (domainFreq[t] || 0) + 1; }));

          // Pulse stats
          const pulseStats = { "keep-going": 0, "go-deeper": 0, "revisit": 0 };
          entries.forEach(e => Object.values(e.mentorPulse || {}).forEach(p => { pulseStats[p] = (pulseStats[p] || 0) + 1; }));
          const totalPulse = Object.values(pulseStats).reduce((a, b) => a + b, 0);

          return (
            <>
              <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 14, lineHeight: 1.5 }}>
                How your thinking is developing over time.
              </div>

              {/* Development Matrix — auto-derived from app data */}
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8a050", marginBottom: 10 }}>Development matrix</div>

                {/* MA Development — from MA session auto-summaries */}
                {(() => {
                  const analyzedSessions = maSessions.filter(s => s.summary);
                  const maScoreKeys = ["describe", "cause_effect", "evaluate", "prescription", "biomechanics", "communication"];
                  const maScoreLabels = { describe: "Describe", cause_effect: "Cause/Effect", evaluate: "Evaluate", prescription: "Prescription", biomechanics: "Bio/Physics", communication: "Communication" };
                  const scoreColor = (v) => v >= 4 ? "#28a858" : v >= 3 ? "#e07830" : v > 0 ? "#e05028" : "#4d6888";

                  // Build score history per criteria from all analyzed sessions
                  const scoreHistory = {};
                  maScoreKeys.forEach(k => { scoreHistory[k] = []; });
                  analyzedSessions.sort((a, b) => (a.date || "").localeCompare(b.date || "")).forEach(s => {
                    try {
                      const parsed = typeof s.summary === "string" ? JSON.parse(s.summary) : s.summary;
                      if (parsed?.scores) {
                        maScoreKeys.forEach(k => {
                          if (parsed.scores[k]) scoreHistory[k].push({ score: parsed.scores[k], date: s.date, context: s.activity || s.who || "" });
                        });
                      }
                    } catch(e) {}
                  });

                  // Collect all gaps and strengths across sessions
                  const allGaps = [];
                  const allStrengths = [];
                  analyzedSessions.forEach(s => {
                    try {
                      const parsed = typeof s.summary === "string" ? JSON.parse(s.summary) : s.summary;
                      if (parsed?.gaps) allGaps.push(...parsed.gaps);
                      if (parsed?.strengths) allStrengths.push(...parsed.strengths);
                    } catch(e) {}
                  });

                  return (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e8a050", textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 0", borderBottom: "1.5px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
                        Module 1 — MA / Technical ({analyzedSessions.length} analyzed session{analyzedSessions.length !== 1 ? "s" : ""})
                      </div>

                      {analyzedSessions.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#4d6888", fontStyle: "italic", padding: "8px 0" }}>
                          Add MA sessions in Resources tab and tap "Analyze My MA" to populate scores
                        </div>
                      ) : (
                        <>
                          {maScoreKeys.map(k => {
                            const hist = scoreHistory[k];
                            if (hist.length === 0) return null;
                            const latest = hist[hist.length - 1];
                            const first = hist[0];
                            const totalDelta = hist.length > 1 ? latest.score - first.score : 0;
                            return (
                              <div key={k} style={{ padding: "6px 0", borderBottom: "0.5px solid rgba(255,255,255,0.03)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "#d0d8e0", flex: 1 }}>{maScoreLabels[k]}</span>
                                  {totalDelta !== 0 && (
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: totalDelta > 0 ? "rgba(40,168,88,0.1)" : "rgba(224,80,40,0.1)", color: totalDelta > 0 ? "#28a858" : "#e05028" }}>
                                      {totalDelta > 0 ? `↑ +${totalDelta}` : `↓ ${totalDelta}`}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
                                  {hist.map((h, hi) => {
                                    const delta = hi > 0 ? h.score - hist[hi - 1].score : null;
                                    const dateStr = h.date ? new Date(h.date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }) : "";
                                    return (
                                      <div key={hi} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 38 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: scoreColor(h.score), background: `${scoreColor(h.score)}12`, border: `1.5px solid ${scoreColor(h.score)}30` }}>{h.score}</div>
                                        {delta !== null && delta !== 0 && <div style={{ fontSize: 9, fontWeight: 700, color: delta > 0 ? "#28a858" : "#e05028", marginTop: 1 }}>{delta > 0 ? `+${delta}` : delta}</div>}
                                        <div style={{ fontSize: 9, color: "#4d6888", marginTop: 1 }}>{dateStr}</div>
                                        <div style={{ fontSize: 8, color: "#3a5068", maxWidth: 50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{h.context}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}

                          {/* Recurring patterns */}
                          {allGaps.length > 0 && (
                            <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 5, background: "rgba(224,120,48,0.04)", border: "1px solid rgba(224,120,48,0.1)" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#e07830", marginBottom: 3 }}>RECURRING GAPS</div>
                              <div style={{ fontSize: 12, color: "#d0d8e0", lineHeight: 1.5 }}>{[...new Set(allGaps)].slice(0, 5).join(" · ")}</div>
                            </div>
                          )}
                          {allStrengths.length > 0 && (
                            <div style={{ marginTop: 4, padding: "6px 8px", borderRadius: 5, background: "rgba(40,168,88,0.04)", border: "1px solid rgba(40,168,88,0.1)" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#28a858", marginBottom: 3 }}>CONSISTENT STRENGTHS</div>
                              <div style={{ fontSize: 12, color: "#d0d8e0", lineHeight: 1.5 }}>{[...new Set(allStrengths)].slice(0, 5).join(" · ")}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Clinic Leading — from clinic feedback entries */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e8a050", textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 0", borderBottom: "1.5px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
                    Module 3 — Clinic leading ({clinicFeedback.length} clinic{clinicFeedback.length !== 1 ? "s" : ""} logged)
                  </div>
                  {clinicFeedback.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#4d6888", fontStyle: "italic", padding: "8px 0" }}>Log clinics in the Clinics tab to track clinic leading development</div>
                  ) : (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>CLINICS LED</div><div style={{ fontSize: 20, fontWeight: 700, color: "#e8a050" }}>{clinicFeedback.length}</div></div>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>WITH SELF-REFLECTION</div><div style={{ fontSize: 20, fontWeight: 700, color: "#28a858" }}>{clinicFeedback.filter(c => c.selfReflection?.trim() || c.whatWorked?.trim()).length}</div></div>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>WITH FEEDBACK</div><div style={{ fontSize: 20, fontWeight: 700, color: "#3088cc" }}>{clinicFeedback.filter(c => c.participantFeedback?.trim() || c.notes?.trim()).length}</div></div>
                    </div>
                  )}
                </div>

                {/* Reflection depth + mentor engagement */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e8a050", textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 0", borderBottom: "1.5px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
                    Reflection quality
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>REFLECTIONS</div><div style={{ fontSize: 20, fontWeight: 700, color: "#d0d8e0" }}>{entries.length}</div></div>
                    <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>INTEGRATED DEPTH</div><div style={{ fontSize: 20, fontWeight: 700, color: "#28a858" }}>{entries.filter(e => e.depthLevel === "integrated").length}</div></div>
                    <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>MENTOR COMMENTS</div><div style={{ fontSize: 20, fontWeight: 700, color: "#3088cc" }}>{entries.reduce((sum, e) => sum + (e.mentorComments || []).length, 0)}</div></div>
                    <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600 }}>MA SESSIONS</div><div style={{ fontSize: 20, fontWeight: 700, color: "#c060a0" }}>{maSessions.length}</div></div>
                  </div>
                </div>
              </Card>

              {entries.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 40, opacity: 0.4 }}>📊</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#7a9ab5", marginTop: 8 }}>No data yet — write some reflections first</div>
                </Card>
              ) : (
                <>
                  {/* Summary stats */}
                  <Card>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#7a9ab5", fontWeight: 700, textTransform: "uppercase" }}>Reflections</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#d0d8e0" }}>{entries.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#7a9ab5", fontWeight: 700, textTransform: "uppercase" }}>Avg Connections</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#e07830" }}>{avgTags}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#7a9ab5", fontWeight: 700, textTransform: "uppercase" }}>Mentor Feedback</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#28a858" }}>{totalPulse}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Depth distribution */}
                  <Card>
                    <SectionLabel>Depth Distribution</SectionLabel>
                    {DEPTH_LEVELS.map(d => {
                      const pct = entries.length > 0 ? (depthCounts[d.id] / entries.length) * 100 : 0;
                      return (
                        <div key={d.id} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.label}</span>
                            <span style={{ fontSize: 13, color: "#7a9ab5" }}>{depthCounts[d.id]} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </Card>

                  {/* Domain map */}
                  <Card>
                    <SectionLabel>Connection Domains</SectionLabel>
                    {DOMAINS.sort((a, b) => (domainFreq[b.id] || 0) - (domainFreq[a.id] || 0)).map(d => {
                      const count = domainFreq[d.id] || 0;
                      const pct = totalTagged > 0 ? (count / totalTagged) * 100 : 0;
                      return (
                        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: d.color, width: 140, flexShrink: 0 }}>{d.label}</span>
                          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#7a9ab5", width: 24, textAlign: "right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </Card>

                  {/* Mentor pulse pattern */}
                  {totalPulse > 0 && (
                    <Card>
                      <SectionLabel>Mentor Pulse Pattern</SectionLabel>
                      <div style={{ display: "flex", gap: 16 }}>
                        {PULSE_OPTIONS.map(p => (
                          <div key={p.id} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{pulseStats[p.id]}</div>
                            <div style={{ fontSize: 12, color: "#7a9ab5" }}>{p.label}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
            </>
          );
        })()}

        {/* ═══ CHECKPOINTS ═══ */}
        {tab === "checkpoints" && !isSubView && (
          <>
            <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 14, lineHeight: 1.5 }}>
              Portfolio reviews every 6-8 weeks. Mentors read your recent reflections and videos, then share what they see in your development.
            </div>

            {isMentor && (
              <button onClick={() => setEditingCheckpoint({
                id: uid(), date: today(), mentorId: currentUser.key,
                whatImSeeing: "", pushOnNext: "", connectionsWell: "", connectionsMissing: "",
                markResponse: "", timestamp: new Date().toISOString(),
              })} style={{
                padding: "8px 14px", borderRadius: 6, border: "1px solid rgba(224,120,48,0.3)", background: "rgba(224,120,48,0.08)",
                color: "#e8a050", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12,
              }}>+ New Checkpoint Review</button>
            )}

            {checkpoints.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, opacity: 0.4 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#7a9ab5", marginTop: 8 }}>No checkpoint reviews yet</div>
              </Card>
            ) : (
              checkpoints.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map(cp => {
                const mentor = USERS[cp.mentorId] || { name: "Unknown", color: "#7a9ab5" };
                return (
                  <Card key={cp.id} style={{ borderLeft: `3px solid ${mentor.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: mentor.color }}>{mentor.name}'s Review</span>
                        <span style={{ fontSize: 12, color: "#7a9ab5", marginLeft: 8 }}>{cp.date}</span>
                      </div>
                    </div>
                    {[
                      { label: "What I'm Seeing", val: cp.whatImSeeing },
                      { label: "Push On Next", val: cp.pushOnNext },
                      { label: "Connections You're Making Well", val: cp.connectionsWell },
                      { label: "Connections You're Missing", val: cp.connectionsMissing },
                    ].filter(s => s.val).map(s => (
                      <div key={s.label} style={{ marginBottom: 10 }}>
                        <SectionLabel>{s.label}</SectionLabel>
                        <p style={{ fontSize: 14, color: "#d0d8e0", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{s.val}</p>
                      </div>
                    ))}
                    {cp.markResponse && (
                      <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "rgba(224,120,48,0.04)", border: "1px solid rgba(224,120,48,0.1)" }}>
                        <SectionLabel>Mark's Response</SectionLabel>
                        <p style={{ fontSize: 14, color: "#d0d8e0", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{cp.markResponse}</p>
                      </div>
                    )}
                    {isCandidate && !cp.markResponse && (
                      <div style={{ marginTop: 8 }}>
                        <textarea id={`cp-response-${cp.id}`} placeholder="Your response to this review..." style={{ ...txta, minHeight: 40, fontSize: 13 }} />
                        <button onClick={() => {
                          const el = document.getElementById(`cp-response-${cp.id}`);
                          const text = el.value.trim();
                          if (!text) return;
                          const updated = checkpoints.map(c => c.id === cp.id ? { ...c, markResponse: text } : c);
                          saveCheckpoints(updated);
                        }} style={{ padding: "6px 12px", borderRadius: 5, fontSize: 13, fontWeight: 700, background: "rgba(224,120,48,0.08)", border: "1px solid rgba(224,120,48,0.2)", color: "#e8a050", cursor: "pointer", marginTop: 4 }}>Save Response</button>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </>
        )}

        {/* ═══ CHECKPOINT EDIT ═══ */}
        {editingCheckpoint && (() => {
          const cp = editingCheckpoint;
          const upd = (f, v) => setEditingCheckpoint(p => ({ ...p, [f]: v }));
          return (
            <div>
              <button onClick={() => setEditingCheckpoint(null)} style={{ background: "none", border: "none", color: "#7a9ab5", fontSize: 14, cursor: "pointer", padding: "0 0 10px", fontWeight: 600 }}>← Cancel</button>
              <Card>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#e0e8f0", marginBottom: 14 }}>Portfolio Review</div>
                <div style={{ marginBottom: 12 }}><label style={lbl}>Date</label><input type="date" value={cp.date} onChange={e => upd("date", e.target.value)} style={inp} /></div>
                {[
                  { f: "whatImSeeing", l: "What I'm seeing in Mark's development", p: "Based on recent reflections and videos..." },
                  { f: "pushOnNext", l: "What I'd push on next", p: "Where should Mark focus his attention?" },
                  { f: "connectionsWell", l: "Connections he's making well", p: "Where is his thinking strongest?" },
                  { f: "connectionsMissing", l: "Connections he's missing", p: "Where is he still thinking in pieces?" },
                ].map(field => (
                  <div key={field.f} style={{ marginBottom: 12 }}>
                    <label style={lbl}>{field.l}</label>
                    <textarea value={cp[field.f] || ""} onChange={e => upd(field.f, e.target.value)} placeholder={field.p} style={txta} />
                  </div>
                ))}
                <button onClick={() => {
                  const isNew = !checkpoints.find(c => c.id === cp.id);
                  const updated = isNew ? [cp, ...checkpoints] : checkpoints.map(c => c.id === cp.id ? cp : c);
                  saveCheckpoints(updated);
                  setEditingCheckpoint(null);
                }} style={{
                  width: "100%", padding: "12px", borderRadius: 7, border: "none",
                  background: "linear-gradient(135deg, #e07830, #c06020)", color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>Save Review</button>
              </Card>
            </div>
          );
        })()}

        {/* ═══ VIDEOS ═══ */}
        {tab === "videos" && !isSubView && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: "#7a9ab5", lineHeight: 1.5 }}>Track your skiing with video. Film IDP tasks, link YouTube or Drive, get mentor feedback.</div>
              {isCandidate && (
                <button onClick={() => {
                  saveVideos([{ id: uid(), date: today(), activity: "", url: "", notes: "", conditions: "", selfScore: "", season: getCurrentSeason(), comments: [] }, ...videos]);
                }} style={{
                  padding: "7px 14px", borderRadius: 6, border: "1px solid rgba(48,136,204,0.4)",
                  background: "rgba(48,136,204,0.1)", color: "#3088cc", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 10,
                }}>+ Add Video</button>
              )}
            </div>

            {videos.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 40, opacity: 0.4 }}>🎥</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#7a9ab5", marginTop: 8 }}>No videos yet</div>
                <div style={{ fontSize: 14, color: "#3a5068", marginTop: 4 }}>Film yourself performing IDP tasks. Track your progression over time.</div>
              </Card>
            ) : videos.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map(v => {
              // Extract YouTube thumbnail
              const ytMatch = (v.url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
              const thumbUrl = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : null;

              return (
                <Card key={v.id} style={{ borderLeft: "3px solid #3088cc" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {/* Thumbnail */}
                    {thumbUrl ? (
                      <a href={v.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                        <img src={thumbUrl} alt="" style={{ width: 120, height: 68, borderRadius: 6, objectFit: "cover", display: "block" }} />
                      </a>
                    ) : v.url ? (
                      <a href={v.url} target="_blank" rel="noreferrer" style={{ width: 120, height: 68, borderRadius: 6, background: "rgba(48,136,204,0.08)", border: "1px solid rgba(48,136,204,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 24, color: "#3088cc", textDecoration: "none" }}>▶</a>
                    ) : null}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#7a9ab5", marginBottom: 2 }}>
                        {v.date}{v.conditions ? ` · ${v.conditions}` : ""}{v.selfScore ? ` · Score: ${v.selfScore}/6` : ""}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#d0d8e0" }}>{v.activity || "Untitled"}</div>
                      {v.notes && <div style={{ fontSize: 13, color: "#7a9ab5", marginTop: 3, lineHeight: 1.4 }}>{v.notes.length > 100 ? v.notes.slice(0, 100) + "…" : v.notes}</div>}
                    </div>
                  </div>

                  {/* Edit fields (collapsed by default for clean list view) */}
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ fontSize: 12, color: "#4d6888", cursor: "pointer" }}>Edit details</summary>
                    <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>DATE</div><input type="date" value={v.date} onChange={ev => { saveVideos(videos.map(x => x.id === v.id ? { ...x, date: ev.target.value } : x)); }} style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>IDP ACTIVITY</div><input value={v.activity} onChange={ev => { saveVideos(videos.map(x => x.id === v.id ? { ...x, activity: ev.target.value } : x)); }} placeholder="e.g., Pivot Slips" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                    </div>
                    <div style={{ marginTop: 6 }}><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>VIDEO LINK</div><input value={v.url} onChange={ev => { saveVideos(videos.map(x => x.id === v.id ? { ...x, url: ev.target.value } : x)); }} placeholder="YouTube or Google Drive link" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>CONDITIONS</div><input value={v.conditions || ""} onChange={ev => { saveVideos(videos.map(x => x.id === v.id ? { ...x, conditions: ev.target.value } : x)); }} placeholder="e.g., Groomed blue, firm" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                      <div><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>SELF-ASSESSMENT (1-6)</div><select value={v.selfScore || ""} onChange={ev => { saveVideos(videos.map(x => x.id === v.id ? { ...x, selfScore: ev.target.value } : x)); }} style={{ ...inp, fontSize: 12, padding: "4px 6px", cursor: "pointer", appearance: "auto" }}><option value="">—</option>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                    </div>
                    <div style={{ marginTop: 6 }}><div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>NOTES</div><textarea value={v.notes || ""} onChange={ev => { saveVideos(videos.map(x => x.id === v.id ? { ...x, notes: ev.target.value } : x)); }} placeholder="What did you see? What's improving?" style={{ ...txta, fontSize: 12, minHeight: 40 }} /></div>
                    <button onClick={() => { if (confirm("Delete this video?")) saveVideos(videos.filter(x => x.id !== v.id)); }} style={{ background: "none", border: "none", color: "#4d6888", fontSize: 11, cursor: "pointer", marginTop: 4 }}>Delete</button>
                  </details>

                  {/* Comments */}
                  {(v.comments || []).map((c, ci) => {
                    const commenter = USERS[c.userId] || { name: c.userId, color: "#7a9ab5" };
                    return (
                      <div key={ci} style={{ display: "flex", gap: 6, marginTop: 6, padding: "6px 8px", borderRadius: 5, background: `${commenter.color}06`, border: `1px solid ${commenter.color}12` }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: `${commenter.color}20`, border: `1px solid ${commenter.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: commenter.color }}>{commenter.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: commenter.color }}>{commenter.name}</span>
                          <span style={{ fontSize: 10, color: "#4d6888", marginLeft: 6 }}>{c.timestamp ? new Date(c.timestamp).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}</span>
                          <div style={{ fontSize: 13, color: "#d0d8e0", lineHeight: 1.4, marginTop: 2, whiteSpace: "pre-wrap" }}>{c.text}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 6 }}>
                    <textarea id={`vid-comment-${v.id}`} placeholder={isMentor ? "Coach on this video..." : "Add a note..."} style={{ ...txta, minHeight: 30, flex: 1, fontSize: 12 }} />
                    <button onClick={() => {
                      const el = document.getElementById(`vid-comment-${v.id}`);
                      const text = el.value.trim();
                      if (!text) return;
                      const updated = videos.map(x => x.id === v.id ? { ...x, comments: [...(x.comments || []), { userId: currentUser.key, text, timestamp: new Date().toISOString() }] } : x);
                      saveVideos(updated);
                      el.value = "";
                    }} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(48,136,204,0.08)", border: "1px solid rgba(48,136,204,0.2)", color: "#3088cc", cursor: "pointer", flexShrink: 0 }}>Post</button>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {/* ═══ TIMELINE ═══ */}
        {tab === "timeline" && !isSubView && (() => {
          // Combine all events into one chronological feed
          const events = [];
          entries.forEach(e => events.push({ type: "reflection", date: e.date, data: e }));
          videos.forEach(v => events.push({ type: "video", date: v.date, data: v }));
          maSessions.forEach(m => events.push({ type: "ma", date: m.date, data: m }));
          checkpoints.forEach(c => events.push({ type: "checkpoint", date: c.date, data: c }));
          clinicFeedback.forEach(c => events.push({ type: "clinic", date: c.date, data: c }));
          events.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

          const typeColors = { reflection: "#e07830", video: "#3088cc", ma: "#c060a0", checkpoint: "#28a858", clinic: "#e8a050" };
          const typeIcons = { reflection: "📓", video: "🎥", ma: "🧠", checkpoint: "📋", clinic: "🎤" };
          const typeLabels = { reflection: "Reflection", video: "Video", ma: "MA Session", checkpoint: "Checkpoint", clinic: "Clinic" };

          return (
            <>
              <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 14, lineHeight: 1.5 }}>
                Everything in one chronological view — reflections, videos, MA sessions, checkpoints, and clinics.
              </div>

              {events.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "50px 20px" }}>
                  <div style={{ fontSize: 40, opacity: 0.4 }}>📅</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#7a9ab5", marginTop: 8 }}>Nothing yet</div>
                </Card>
              ) : events.map((ev, i) => {
                const color = typeColors[ev.type];
                const d = ev.data;
                let title = "";
                let subtitle = "";
                if (ev.type === "reflection") { title = d.whatISaw ? (d.whatISaw.length > 80 ? d.whatISaw.slice(0, 80) + "…" : d.whatISaw) : "Reflection"; subtitle = `${d.context || ""}${d.location ? ` · ${d.location}` : ""}`; }
                else if (ev.type === "video") { title = d.activity || "Video"; subtitle = `${d.conditions || ""}${d.selfScore ? ` · Score: ${d.selfScore}` : ""}`; }
                else if (ev.type === "ma") { title = `MA: ${d.activity || d.who || "Session"}`; subtitle = d.context || ""; }
                else if (ev.type === "checkpoint") { const m = USERS[d.mentorId]; title = `${m?.name || "Mentor"}'s Review`; subtitle = d.whatImSeeing ? d.whatImSeeing.slice(0, 60) + "…" : ""; }
                else if (ev.type === "clinic") { title = d.topic || "Clinic"; subtitle = `${d.audience || ""}${d.duration ? ` · ${d.duration} min` : ""}`; }
                return (
                  <div key={`${ev.type}-${i}`} style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 40 }}>
                      <div style={{ fontSize: 11, color: "#4d6888", fontWeight: 600 }}>{ev.date ? new Date(ev.date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}</div>
                      <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />
                    </div>
                    <Card style={{ flex: 1, borderLeft: `3px solid ${color}`, padding: "10px 12px", marginBottom: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span>{typeIcons[ev.type]}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase" }}>{typeLabels[ev.type]}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e0", lineHeight: 1.4 }}>{title}</div>
                      {subtitle && <div style={{ fontSize: 12, color: "#7a9ab5", marginTop: 2 }}>{subtitle}</div>}
                    </Card>
                  </div>
                );
              })}
            </>
          );
        })()}

        {/* ═══ CLINIC FEEDBACK ═══ */}
        {tab === "clinics" && !isSubView && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: "#7a9ab5", lineHeight: 1.5 }}>Track your clinic leading development. Reflect on what worked, what you'd change, and capture participant feedback.</div>
              <button onClick={() => {
                saveClinicFeedback([{ id: uid(), date: today(), topic: "", audience: "", duration: "", selfReflection: "", whatWorked: "", whatIdChange: "", participantFeedback: "", notes: "" }, ...clinicFeedback]);
              }} style={{
                padding: "7px 14px", borderRadius: 6, border: "1px solid rgba(232,160,80,0.4)",
                background: "rgba(232,160,80,0.1)", color: "#e8a050", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 10,
              }}>+ Add Clinic</button>
            </div>

            {clinicFeedback.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 40, opacity: 0.4 }}>🎤</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#7a9ab5", marginTop: 8 }}>No clinics logged yet</div>
                <div style={{ fontSize: 14, color: "#3a5068", marginTop: 4 }}>After leading a training clinic for instructors, reflect here.</div>
              </Card>
            ) : clinicFeedback.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map(c => (
              <Card key={c.id} style={{ borderLeft: "3px solid #e8a050" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>DATE</div>
                    <input type="date" value={c.date} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, date: ev.target.value } : x)); }} style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>TOPIC</div>
                    <input value={c.topic} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, topic: ev.target.value } : x)); }} placeholder="e.g., Carved Turns for L2s" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>AUDIENCE</div>
                    <input value={c.audience} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, audience: ev.target.value } : x)); }} placeholder="e.g., 6 L1/L2 instructors" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>DURATION (minutes)</div>
                  <input value={c.duration || ""} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, duration: ev.target.value } : x)); }} placeholder="e.g., 25" style={{ ...inp, fontSize: 12, padding: "4px 6px", maxWidth: 100 }} />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>WHAT WORKED</div>
                  <textarea value={c.whatWorked || ""} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, whatWorked: ev.target.value } : x)); }} placeholder="What went well? What did participants respond to?" style={{ ...txta, fontSize: 12, minHeight: 40 }} />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>WHAT I'D CHANGE</div>
                  <textarea value={c.whatIdChange || ""} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, whatIdChange: ev.target.value } : x)); }} placeholder="What would you do differently next time?" style={{ ...txta, fontSize: 12, minHeight: 40 }} />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>SELF-REFLECTION</div>
                  <textarea value={c.selfReflection || ""} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, selfReflection: ev.target.value } : x)); }} placeholder="How did you address CAP? Did you develop understanding or just give exercises? How did you manage the group dynamics?" style={{ ...txta, fontSize: 12, minHeight: 50 }} />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>PARTICIPANT FEEDBACK</div>
                  <textarea value={c.participantFeedback || ""} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, participantFeedback: ev.target.value } : x)); }} placeholder="What did participants say? Any direct quotes or observations?" style={{ ...txta, fontSize: 12, minHeight: 40 }} />
                </div>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 10, color: "#7a9ab5", fontWeight: 600, marginBottom: 2 }}>MENTOR NOTES</div>
                  <textarea value={c.notes || ""} onChange={ev => { saveClinicFeedback(clinicFeedback.map(x => x.id === c.id ? { ...x, notes: ev.target.value } : x)); }} placeholder="Mentor feedback on this clinic" style={{ ...txta, fontSize: 12, minHeight: 40 }} />
                </div>
                <button onClick={() => { if (confirm("Delete this clinic?")) saveClinicFeedback(clinicFeedback.filter(x => x.id !== c.id)); }} style={{ background: "none", border: "none", color: "#4d6888", fontSize: 11, cursor: "pointer" }}>Delete</button>
              </Card>
            ))}
          </>
        )}

        {/* ═══ SPARRING PARTNER ═══ */}
        {tab === "sparring" && !isSubView && (
          <>
            <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 10, lineHeight: 1.5 }}>
              Practice your thinking. Your sparring partner will push you to go deeper and make connections.
            </div>

            {/* Mode selector */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              {Object.entries(SPARRING_MODES).map(([id, mode]) => (
                <button key={id} onClick={() => {
                  if (id !== sparringMode) {
                    setSparringMode(id);
                    setSparringMessages([]);
                    setWrittenMAScenario(null);
                    setWrittenMAResult(null);
                    setWrittenMADialog([]);
                    setWrittenMAPhase("setup");
                    setWrittenMA({ who: "", activity: "", conditions: "", transcript: "", videoUrl: "" });
                  }
                }} style={{
                  padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: sparringMode === id ? `${mode.color}12` : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${sparringMode === id ? mode.color : "rgba(255,255,255,0.06)"}`,
                  color: sparringMode === id ? mode.color : "#7a9ab5",
                }}>{mode.icon} {mode.label}</button>
              ))}
            </div>

            <Card style={{ minHeight: 300, display: "flex", flexDirection: "column" }}>
              {/* Mode description */}
              <div style={{
                fontSize: 12, color: SPARRING_MODES[sparringMode].color, marginBottom: 10,
                padding: "6px 10px", borderRadius: 5,
                background: `${SPARRING_MODES[sparringMode].color}08`,
                border: `1px solid ${SPARRING_MODES[sparringMode].color}15`,
              }}>
                {SPARRING_MODES[sparringMode].icon} <strong>{SPARRING_MODES[sparringMode].label}</strong> — {SPARRING_MODES[sparringMode].desc}
              </div>

              {/* Quick start buttons for specific modes */}
              {sparringMessages.length === 0 && (
                <div style={{ marginBottom: 12 }}>
                  {sparringMode === "open" && (
                    <div style={{ textAlign: "center", padding: "20px 16px", color: "#3a5068" }}>
                      <div style={{ fontSize: 14, color: "#7a9ab5", marginBottom: 6 }}>Try something like:</div>
                      <div style={{ fontSize: 13, color: "#4d6888", lineHeight: 1.8 }}>
                        "I'm leading a clinic tomorrow on carved turns for L2 candidates."<br />
                        "Help me think through a progression for teaching parallel turns."<br />
                        "What should I focus on to improve my own short turns in bumps?"
                      </div>
                    </div>
                  )}
                  {sparringMode === "scenario" && (
                    <button onClick={async () => {
                      setSparringLoading(true);
                      const resp = await callClaude(
                        [{ role: "user", content: "Give me a scenario to analyze. Describe a student skiing in vivid detail — I'll do a blended MA." }],
                        buildSystemPrompt(MA_SCENARIO_SYSTEM)
                      );
                      setSparringMessages([
                        { role: "user", content: "Give me a scenario to analyze." },
                        { role: "assistant", content: resp },
                      ]);
                      setSparringLoading(false);
                    }} disabled={sparringLoading} style={{
                      width: "100%", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: sparringLoading ? "default" : "pointer",
                      background: sparringLoading ? "rgba(255,255,255,0.03)" : "rgba(224,120,48,0.08)",
                      border: "1px solid rgba(224,120,48,0.25)", color: sparringLoading ? "#4d6888" : "#e07830",
                    }}>{sparringLoading ? "Generating scenario..." : "🎯 Give Me a Scenario"}</button>
                  )}
                  {sparringMode === "reverse" && (
                    <button onClick={async () => {
                      setSparringLoading(true);
                      const resp = await callClaude(
                        [{ role: "user", content: "Give me a reverse MA drill. Describe what a trainer did — the exercise, terrain, and progression — and I'll work backwards to figure out what they probably saw." }],
                        buildSystemPrompt(MA_REVERSE_SYSTEM)
                      );
                      setSparringMessages([
                        { role: "user", content: "Give me a reverse MA drill." },
                        { role: "assistant", content: resp },
                      ]);
                      setSparringLoading(false);
                    }} disabled={sparringLoading} style={{
                      width: "100%", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: sparringLoading ? "default" : "pointer",
                      background: sparringLoading ? "rgba(255,255,255,0.03)" : "rgba(40,168,88,0.08)",
                      border: "1px solid rgba(40,168,88,0.25)", color: sparringLoading ? "#4d6888" : "#28a858",
                    }}>{sparringLoading ? "Generating..." : "🔄 Give Me a Prescription to Diagnose"}</button>
                  )}
                  {sparringMode === "compare" && (
                    <button onClick={async () => {
                      setSparringLoading(true);
                      const resp = await callClaude(
                        [{ role: "user", content: "Give me a compare and contrast drill. Describe two students with a similar symptom but different root causes. I'll analyze both and try to differentiate." }],
                        buildSystemPrompt(MA_COMPARE_SYSTEM)
                      );
                      setSparringMessages([
                        { role: "user", content: "Give me two students to compare." },
                        { role: "assistant", content: resp },
                      ]);
                      setSparringLoading(false);
                    }} disabled={sparringLoading} style={{
                      width: "100%", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: sparringLoading ? "default" : "pointer",
                      background: sparringLoading ? "rgba(255,255,255,0.03)" : "rgba(48,136,204,0.08)",
                      border: "1px solid rgba(48,136,204,0.25)", color: sparringLoading ? "#4d6888" : "#3088cc",
                    }}>{sparringLoading ? "Generating..." : "⚖️ Give Me Two Students to Compare"}</button>
                  )}
                  {sparringMode === "video" && (
                    <div style={{ textAlign: "center", padding: "20px 16px", color: "#3a5068" }}>
                      <div style={{ fontSize: 14, color: "#e8a050", marginBottom: 6 }}>🎥 Video Analysis Mode</div>
                      <div style={{ fontSize: 13, color: "#4d6888", lineHeight: 1.8 }}>
                        Watch your video, then describe what you see below.<br />
                        Include: what the student/skier is doing, the terrain, the conditions.<br />
                        Your sparring partner will challenge the depth of your analysis.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Written MA Practice — full exam simulation */}
              {sparringMode === "writtenma" ? (
                <div>
                  {/* Phase 1: Setup — choose video/scenario/free write */}
                  {writtenMAPhase === "setup" && (
                    <>
                      {/* Video link */}
                      <div style={{ marginBottom: 10 }}>
                        <label style={lbl}>Video link (optional)</label>
                        <input value={writtenMA.videoUrl || ""} onChange={ev => setWrittenMA(p => ({ ...p, videoUrl: ev.target.value }))} placeholder="Paste a YouTube or Google Drive link to analyze" style={{ ...inp, fontSize: 13 }} />
                      </div>
                      {/* YouTube thumbnail preview */}
                      {(() => {
                        const ytMatch = (writtenMA.videoUrl || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
                        return ytMatch ? (
                          <a href={writtenMA.videoUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginBottom: 10 }}>
                            <img src={`https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`} alt="" style={{ width: "100%", maxWidth: 320, borderRadius: 8, display: "block" }} />
                          </a>
                        ) : writtenMA.videoUrl ? (
                          <a href={writtenMA.videoUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", marginBottom: 10, borderRadius: 6, background: "rgba(48,136,204,0.06)", border: "1px solid rgba(48,136,204,0.15)", color: "#3088cc", fontSize: 13, textDecoration: "none" }}>▶ Open video</a>
                        ) : null;
                      })()}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                        <div><label style={lbl}>Who</label><input value={writtenMA.who} onChange={ev => setWrittenMA(p => ({ ...p, who: ev.target.value }))} placeholder="e.g., L2 candidate" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                        <div><label style={lbl}>Activity</label><input value={writtenMA.activity} onChange={ev => setWrittenMA(p => ({ ...p, activity: ev.target.value }))} placeholder="e.g., Dynamic Short Turns" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                        <div><label style={lbl}>Conditions</label><input value={writtenMA.conditions} onChange={ev => setWrittenMA(p => ({ ...p, conditions: ev.target.value }))} placeholder="e.g., Groomed blue, firm" style={{ ...inp, fontSize: 12, padding: "4px 6px" }} /></div>
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setWrittenMAPhase("write")} style={{
                          flex: 1, padding: "12px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer",
                          background: "rgba(160,160,208,0.08)", border: "1px solid rgba(160,160,208,0.25)", color: "#a0a0d0",
                        }}>📝 Write my MA</button>
                        <button onClick={async () => {
                          setWrittenMALoading(true);
                          const resp = await callClaude(
                            [{ role: "user", content: "Generate a detailed skiing scenario for me to analyze. Describe an instructor — their cert level, the terrain, conditions, what their skiing looks like. Give me enough detail for a blended MA. Don't include any analysis — just the observation." }],
                            buildSystemPrompt(MA_SCENARIO_SYSTEM)
                          );
                          setWrittenMAScenario(resp);
                          setWrittenMAPhase("write");
                          setWrittenMALoading(false);
                        }} disabled={writtenMALoading} style={{
                          flex: 1, padding: "12px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: writtenMALoading ? "default" : "pointer",
                          background: writtenMALoading ? "rgba(255,255,255,0.03)" : "rgba(224,120,48,0.08)",
                          border: "1px solid rgba(224,120,48,0.25)", color: writtenMALoading ? "#4d6888" : "#e07830",
                        }}>{writtenMALoading ? "Generating..." : "🎯 Generate a scenario"}</button>
                      </div>
                    </>
                  )}

                  {/* Phase 2: Write — MA text area */}
                  {writtenMAPhase === "write" && (
                    <>
                      {writtenMAScenario && (
                        <div style={{ padding: "10px 12px", borderRadius: 7, background: "rgba(224,120,48,0.04)", border: "1px solid rgba(224,120,48,0.1)", marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#e07830", marginBottom: 4 }}>SCENARIO</div>
                          <div style={{ fontSize: 13, color: "#d0d8e0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{writtenMAScenario}</div>
                        </div>
                      )}
                      {writtenMA.videoUrl && (
                        <a href={writtenMA.videoUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", marginBottom: 8, borderRadius: 4, background: "rgba(48,136,204,0.06)", color: "#3088cc", fontSize: 12, textDecoration: "none" }}>▶ Rewatch video</a>
                      )}
                      <div style={{ fontSize: 12, color: "#7a9ab5", marginBottom: 4 }}>{writtenMA.who && `Analyzing: ${writtenMA.who}`}{writtenMA.activity && ` · ${writtenMA.activity}`}{writtenMA.conditions && ` · ${writtenMA.conditions}`}</div>

                      <label style={lbl}>Your MA — write your full analysis</label>
                      <textarea value={writtenMA.transcript} onChange={ev => setWrittenMA(p => ({ ...p, transcript: ev.target.value }))} placeholder={"Write your complete MA:\n\n• What did you observe? (by turn phase)\n• What skill interactions do you see?\n• What's the root cause?\n• What would you prescribe? Why?\n• What terrain? Why?"} style={{ ...txta, minHeight: 150, marginBottom: 8, fontSize: 14, lineHeight: 1.7 }} />

                      <button onClick={async () => {
                        if (!writtenMA.transcript.trim()) return;
                        setWrittenMALoading(true);
                        // Send to AI for follow-up questions (examiner dialog)
                        const input = `Mark just delivered this MA:\n\n${writtenMA.transcript}\n\n${writtenMAScenario ? `The scenario was: ${writtenMAScenario.slice(0, 300)}` : `He was analyzing: ${writtenMA.who || "unknown"} doing ${writtenMA.activity || "unknown"} in ${writtenMA.conditions || "unknown conditions"}`}\n\nAsk your first follow-up question.`;
                        const resp = await callClaude([{ role: "user", content: input }], buildSystemPrompt(MA_DIALOG_SYSTEM));
                        setWrittenMADialog([{ role: "assistant", content: resp }]);
                        setWrittenMAPhase("dialog");
                        setWrittenMALoading(false);
                      }} disabled={writtenMALoading || !writtenMA.transcript.trim()} style={{
                        width: "100%", padding: "12px", borderRadius: 7, fontSize: 15, fontWeight: 700, cursor: writtenMALoading ? "default" : "pointer",
                        background: writtenMALoading ? "rgba(255,255,255,0.03)" : "rgba(160,160,208,0.08)",
                        border: "1px solid rgba(160,160,208,0.3)", color: writtenMALoading ? "#4d6888" : "#a0a0d0",
                      }}>{writtenMALoading ? "Preparing follow-up..." : "Submit MA → Examiner Q&A"}</button>
                    </>
                  )}

                  {/* Phase 3: Dialog — examiner follow-up questions */}
                  {writtenMAPhase === "dialog" && (
                    <>
                      {/* Show original MA collapsed */}
                      <details style={{ marginBottom: 10 }}>
                        <summary style={{ fontSize: 12, color: "#7a9ab5", cursor: "pointer" }}>Your MA (tap to review)</summary>
                        <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)", fontSize: 13, color: "#d0d8e0", lineHeight: 1.5, whiteSpace: "pre-wrap", marginTop: 4 }}>{writtenMA.transcript}</div>
                      </details>

                      {/* Dialog messages */}
                      <div style={{ marginBottom: 10, maxHeight: 300, overflowY: "auto" }}>
                        {writtenMADialog.map((m, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 6 }}>
                            <div style={{
                              maxWidth: "85%", padding: "10px 14px", borderRadius: 10,
                              background: m.role === "user" ? "rgba(160,160,208,0.08)" : "rgba(224,120,48,0.06)",
                              border: `1px solid ${m.role === "user" ? "rgba(160,160,208,0.15)" : "rgba(224,120,48,0.12)"}`,
                            }}>
                              <div style={{ fontSize: 14, color: "#d0d8e0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</div>
                            </div>
                          </div>
                        ))}
                        {writtenMALoading && <div style={{ fontSize: 13, color: "#a0a0d0", padding: "6px" }}>Thinking...</div>}
                      </div>

                      {/* Response input */}
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginBottom: 6 }}>
                        <textarea id="ma-dialog-input" placeholder="Answer the examiner's question..." style={{ ...txta, minHeight: 40, flex: 1, fontSize: 14 }}
                          onKeyDown={async ev => {
                            if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) {
                              const text = ev.target.value.trim();
                              if (!text || writtenMALoading) return;
                              const newDialog = [...writtenMADialog, { role: "user", content: text }];
                              setWrittenMADialog(newDialog);
                              ev.target.value = "";
                              setWrittenMALoading(true);
                              const fullMessages = [{ role: "user", content: `Mark's initial MA:\n${writtenMA.transcript}` }, ...newDialog];
                              const resp = await callClaude(fullMessages, buildSystemPrompt(MA_DIALOG_SYSTEM));
                              setWrittenMADialog([...newDialog, { role: "assistant", content: resp }]);
                              setWrittenMALoading(false);
                            }
                          }}
                        />
                        <button onClick={async () => {
                          const el = document.getElementById("ma-dialog-input");
                          const text = el.value.trim();
                          if (!text || writtenMALoading) return;
                          const newDialog = [...writtenMADialog, { role: "user", content: text }];
                          setWrittenMADialog(newDialog);
                          el.value = "";
                          setWrittenMALoading(true);
                          const fullMessages = [{ role: "user", content: `Mark's initial MA:\n${writtenMA.transcript}` }, ...newDialog];
                          const resp = await callClaude(fullMessages, buildSystemPrompt(MA_DIALOG_SYSTEM));
                          setWrittenMADialog([...newDialog, { role: "assistant", content: resp }]);
                          setWrittenMALoading(false);
                        }} disabled={writtenMALoading} style={{
                          padding: "8px 14px", borderRadius: 6, fontSize: 14, fontWeight: 700,
                          background: "rgba(160,160,208,0.08)", border: "1px solid rgba(160,160,208,0.25)", color: "#a0a0d0",
                          cursor: writtenMALoading ? "default" : "pointer", flexShrink: 0,
                        }}>Reply</button>
                      </div>
                      <div style={{ fontSize: 10, color: "#3a5068", marginBottom: 8 }}>Ctrl+Enter to send</div>

                      {/* Score button — available after at least 1 exchange */}
                      {writtenMADialog.filter(m => m.role === "user").length >= 1 && (
                        <button onClick={async () => {
                          setWrittenMALoading(true);
                          // Build scoring input with dialog + past sessions for comparison
                          const dialogText = writtenMADialog.map(m => `${m.role === "user" ? "Mark" : "Examiner"}: ${m.content}`).join("\n");
                          const pastSessions = maSessions.filter(s => s.summary).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3);
                          let pastContext = "";
                          if (pastSessions.length > 0) {
                            pastContext = "\n\nPREVIOUS SESSIONS FOR COMPARISON:\n";
                            pastSessions.forEach(s => {
                              try {
                                const p = typeof s.summary === "string" ? JSON.parse(s.summary) : s.summary;
                                if (p?.scores) pastContext += `[${s.date} · ${s.activity}] Scores: D=${p.scores.describe} C/E=${p.scores.cause_effect} E=${p.scores.evaluate} P=${p.scores.prescription} B=${p.scores.biomechanics} C=${p.scores.communication}. Gaps: ${(p.gaps||[]).join(", ")}\n`;
                              } catch(e) {}
                            });
                          }

                          const input = `INITIAL MA:\n${writtenMA.transcript}\n\nEXAMINER DIALOG:\n${dialogText}${pastContext}\n\nContext: ${writtenMA.who || ""}, ${writtenMA.activity || ""}, ${writtenMA.conditions || ""}`;
                          const resp = await callClaude([{ role: "user", content: input }], MA_TREND_SCORER_SYSTEM);
                          let parsed = null;
                          try { parsed = JSON.parse(resp.replace(/```json|```/g, "").trim()); } catch(e) { parsed = resp; }
                          setWrittenMAResult(parsed);
                          setWrittenMAPhase("scored");

                          // Auto-save to MA sessions
                          const newSession = {
                            id: uid(), date: today(),
                            context: writtenMAScenario ? "AI scenario + examiner Q&A" : "Free write + examiner Q&A",
                            who: writtenMA.who, activity: writtenMA.activity,
                            transcript: writtenMA.transcript + "\n\n--- EXAMINER Q&A ---\n" + dialogText,
                            notes: writtenMA.videoUrl ? `Video: ${writtenMA.videoUrl}` : "",
                            summary: typeof parsed === "object" ? JSON.stringify(parsed) : parsed,
                          };
                          saveMaSessions([newSession, ...maSessions]);
                          setWrittenMALoading(false);
                        }} disabled={writtenMALoading} style={{
                          width: "100%", padding: "12px", borderRadius: 7, fontSize: 15, fontWeight: 700, cursor: writtenMALoading ? "default" : "pointer",
                          background: writtenMALoading ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg, rgba(160,160,208,0.12), rgba(224,120,48,0.08))",
                          border: "1px solid rgba(160,160,208,0.3)", color: writtenMALoading ? "#4d6888" : "#e8a050",
                        }}>{writtenMALoading ? "Scoring full session..." : "Score Full Session + Compare to Past"}</button>
                      )}
                    </>
                  )}

                  {/* Phase 4: Scored — results with trends */}
                  {writtenMAPhase === "scored" && writtenMAResult && (() => {
                    const p = typeof writtenMAResult === "object" ? writtenMAResult : null;
                    if (!p || !p.scores) return <div style={{ padding: "12px", borderRadius: 8, background: "rgba(160,160,208,0.04)", fontSize: 13, color: "#d0d8e0", whiteSpace: "pre-wrap" }}>{typeof writtenMAResult === "string" ? writtenMAResult : JSON.stringify(writtenMAResult)}</div>;
                    const scoreColor = (v) => v >= 4 ? "#28a858" : v >= 3 ? "#e07830" : "#e05028";
                    return (
                      <div style={{ padding: "14px", borderRadius: 8, background: "rgba(160,160,208,0.04)", border: "1px solid rgba(160,160,208,0.1)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#a0a0d0", marginBottom: 10 }}>AT SCORECARD — {today()}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                          {[{ key: "describe", label: "Describe" }, { key: "cause_effect", label: "Cause/Effect" }, { key: "evaluate", label: "Evaluate" }, { key: "prescription", label: "Prescription" }, { key: "biomechanics", label: "Bio/Physics" }, { key: "communication", label: "Comm" }].map(sc => (
                            <div key={sc.key} style={{ textAlign: "center", minWidth: 50 }}>
                              <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(p.scores[sc.key] || 0) }}>{p.scores[sc.key] || "—"}</div>
                              <div style={{ fontSize: 9, color: "#7a9ab5", fontWeight: 600 }}>{sc.label}</div>
                            </div>
                          ))}
                        </div>
                        {p.strengths?.length > 0 && <div style={{ marginBottom: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: "#28a858" }}>STRENGTHS: </span><span style={{ fontSize: 12, color: "#d0d8e0" }}>{p.strengths.join(" · ")}</span></div>}
                        {p.gaps?.length > 0 && <div style={{ marginBottom: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: "#e07830" }}>GAPS: </span><span style={{ fontSize: 12, color: "#d0d8e0" }}>{p.gaps.join(" · ")}</span></div>}
                        {p.improvements?.length > 0 && <div style={{ marginBottom: 6, padding: "6px 8px", borderRadius: 4, background: "rgba(40,168,88,0.06)", border: "1px solid rgba(40,168,88,0.12)" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#28a858" }}>IMPROVED VS PREVIOUS: </span><span style={{ fontSize: 12, color: "#d0d8e0" }}>{p.improvements.join(" · ")}</span></div>}
                        {p.persistent_gaps?.length > 0 && <div style={{ marginBottom: 6, padding: "6px 8px", borderRadius: 4, background: "rgba(224,120,48,0.06)", border: "1px solid rgba(224,120,48,0.12)" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#e07830" }}>PERSISTENT GAPS: </span><span style={{ fontSize: 12, color: "#d0d8e0" }}>{p.persistent_gaps.join(" · ")}</span></div>}
                        {p.key_learning && <div style={{ padding: "8px 10px", borderRadius: 5, background: "rgba(224,120,48,0.06)", border: "1px solid rgba(224,120,48,0.15)", marginTop: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: "#e8a050" }}>KEY FOCUS: </span><span style={{ fontSize: 13, color: "#d0d8e0" }}>{p.key_learning}</span></div>}
                        <div style={{ fontSize: 10, color: "#28a858", marginTop: 10 }}>Saved to MA Sessions · Feeds into Growth matrix</div>

                        <button onClick={() => {
                          setWrittenMAPhase("setup");
                          setWrittenMAScenario(null);
                          setWrittenMAResult(null);
                          setWrittenMADialog([]);
                          setWrittenMA({ who: "", activity: "", conditions: "", transcript: "", videoUrl: "" });
                        }} style={{
                          marginTop: 10, width: "100%", padding: "10px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer",
                          background: "rgba(160,160,208,0.08)", border: "1px solid rgba(160,160,208,0.2)", color: "#a0a0d0",
                        }}>Start New MA Practice</button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
              <>
              {/* Regular chat interface for all other modes */}
              <div style={{ flex: 1, marginBottom: 12, maxHeight: 400, overflowY: "auto" }}>
                {sparringMessages.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8,
                  }}>
                    <div style={{
                      maxWidth: "85%", padding: "10px 14px", borderRadius: 10,
                      background: m.role === "user" ? "rgba(224,120,48,0.08)" : `${SPARRING_MODES[sparringMode].color}06`,
                      border: `1px solid ${m.role === "user" ? "rgba(224,120,48,0.15)" : `${SPARRING_MODES[sparringMode].color}12`}`,
                    }}>
                      <div style={{ fontSize: 14, color: "#d0d8e0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</div>
                    </div>
                  </div>
                ))}
                {sparringLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: `${SPARRING_MODES[sparringMode].color}06`, border: `1px solid ${SPARRING_MODES[sparringMode].color}12` }}>
                      <div style={{ fontSize: 14, color: SPARRING_MODES[sparringMode].color }}>Thinking...</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                <textarea
                  value={sparringInput}
                  onChange={e => setSparringInput(e.target.value)}
                  placeholder={sparringMode === "video" ? "Describe what you see in the video — body position, ski behavior, timing, terrain..." :
                    sparringMode === "scenario" ? "Write your MA analysis here..." :
                    sparringMode === "reverse" ? "What did the trainer probably see? What's the diagnosis?" :
                    sparringMode === "compare" ? "Analyze both students — what's different about the root cause?" :
                    "Ask a question or describe a scenario..."}
                  style={{ ...txta, minHeight: 40, flex: 1, fontSize: 14 }}
                  onKeyDown={async ev => {
                    if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) {
                      const text = sparringInput.trim();
                      if (!text || sparringLoading) return;
                      const newMessages = [...sparringMessages, { role: "user", content: text }];
                      setSparringMessages(newMessages);
                      setSparringInput("");
                      setSparringLoading(true);
                      const resp = await callClaude(newMessages, buildSystemPrompt(SPARRING_MODES[sparringMode].system));
                      setSparringMessages([...newMessages, { role: "assistant", content: resp }]);
                      setSparringLoading(false);
                    }
                  }}
                />
                <button onClick={async () => {
                  const text = sparringInput.trim();
                  if (!text || sparringLoading) return;
                  const newMessages = [...sparringMessages, { role: "user", content: text }];
                  setSparringMessages(newMessages);
                  setSparringInput("");
                  setSparringLoading(true);
                  const resp = await callClaude(newMessages, buildSystemPrompt(SPARRING_MODES[sparringMode].system));
                  setSparringMessages([...newMessages, { role: "assistant", content: resp }]);
                  setSparringLoading(false);
                }} disabled={sparringLoading} style={{
                  padding: "8px 14px", borderRadius: 6, fontSize: 14, fontWeight: 700,
                  background: sparringLoading ? "rgba(255,255,255,0.03)" : `${SPARRING_MODES[sparringMode].color}08`,
                  border: `1px solid ${SPARRING_MODES[sparringMode].color}25`,
                  color: sparringLoading ? "#4d6888" : SPARRING_MODES[sparringMode].color,
                  cursor: sparringLoading ? "default" : "pointer", flexShrink: 0,
                }}>Send</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <div style={{ fontSize: 10, color: "#3a5068" }}>Ctrl+Enter to send</div>
                {sparringMessages.length > 0 && (
                  <button onClick={() => setSparringMessages([])} style={{
                    background: "none", border: "none", color: "#3a5068", fontSize: 10, cursor: "pointer",
                  }}>Clear conversation</button>
                )}
              </div>
              </>
              )}
            </Card>
          </>
        )}
      </div>

      <style>{`
        .at-container { max-width: 720px; margin: 0 auto; }
        @media (min-width: 768px) { .at-container { max-width: 1024px; } }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(224,120,48,0.35) !important;
          box-shadow: 0 0 0 2px rgba(224,120,48,0.06);
        }
        select { appearance: auto; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }
      `}</style>
    </div>
  );
}
