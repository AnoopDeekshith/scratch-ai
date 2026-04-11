# Scratch.ai — Full Build Prompt

> Use this prompt with Claude Code or any AI coding assistant to build the Scratch.ai application.
> Feed this entire document as context when starting a new coding session.

---

## PROJECT OVERVIEW

Build **Scratch.ai** — a real-time AI-powered lecture companion web application for college students.

The app connects to a live lecture (via Zoom transcript stream or browser mic), combines the transcript with uploaded lecture slides, and produces structured, AI-enhanced study notes in real time as the class progresses.

**Tech Stack:**
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API routes
- AI: Anthropic Claude API (claude-sonnet for speed, claude-opus for quality on summaries)
- Speech-to-Text: Deepgram API (real-time WebSocket streaming) OR Web Speech API (browser-native, free, good for MVP)
- Diagrams: Mermaid.js (rendered client-side)
- Database: Supabase (PostgreSQL + Auth + Realtime)
- File parsing: pdf-parse (PDFs), mammoth (PPTX/DOCX)
- Payments (later): Stripe

---

## CORE FEATURES TO BUILD

### Feature 1: Real-Time Lecture Transcription & Note Generation

**What it does:**
When a student opens Scratch.ai during a lecture, the app listens to the lecture audio (via browser microphone) and transcribes it in real time. As the lecture progresses, the AI processes chunks of transcript and generates structured notes live — not at the end, but incrementally as each sub-topic is covered.

**How to build it:**

1. **Audio capture:** Use the Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) for the MVP. It's free, runs in the browser, and requires no backend for transcription. Set `continuous = true` and `interimResults = true`. Fallback: Deepgram WebSocket API for production-grade accuracy.

2. **Transcript chunking:** Buffer the incoming transcript text. Every ~60 seconds OR when a natural pause is detected (3+ seconds of silence), send the accumulated chunk to the AI for processing. Don't send every sentence — batch them for coherent note generation.

3. **AI processing pipeline:** For each chunk, send to Claude API with this context:
   - The current transcript chunk
   - The lecture slides content (pre-uploaded)
   - The notes generated so far (for continuity)
   - The selected mode (detailed or simplified)
   - System prompt instructing the AI to generate structured notes for this sub-topic

4. **Streaming output:** Use Claude's streaming API to display notes as they're generated. The student sees notes appearing in real time on the right side of the screen while the transcript scrolls on the left.

5. **UI layout:**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  [Scratch.ai]    [Mode: Detailed ▼]   [● Recording] │
   ├──────────────────────┬──────────────────────────────┤
   │                      │                              │
   │   LIVE TRANSCRIPT    │     AI-GENERATED NOTES       │
   │                      │                              │
   │   Shows real-time    │   Structured notes appear    │
   │   speech-to-text     │   here as lecture progresses │
   │   as teacher speaks  │                              │
   │                      │   Each sub-topic gets its    │
   │   Current chunk is   │   own section with:          │
   │   highlighted        │   - Key concepts             │
   │                      │   - Explanations             │
   │   Previous chunks    │   - Diagrams (if applicable) │
   │   are grayed out     │                              │
   │                      │                              │
   ├──────────────────────┴──────────────────────────────┤
   │  [📎 Upload Slides]  [⏸ Pause]  [⏹ End Lecture]     │
   └─────────────────────────────────────────────────────┘
   ```

**Implementation details:**
- Create a React context `LectureSessionContext` that holds: transcript chunks array, generated notes array, current mode, recording state, uploaded slides content.
- Use a WebSocket or SSE connection for streaming AI responses.
- Store the full session in Supabase so students can review later.
- Implement auto-scroll on the notes panel with a "scroll lock" toggle (so students can scroll back without being yanked forward).

---

### Feature 2: Dual Explanation Modes (Detailed vs. Simplified)

**What it does:**
Before or during a lecture, the student selects one of two modes:
- **Detailed Mode:** Comprehensive, technical notes with proper terminology, formulas, citations, and depth. Suitable for someone who wants thorough understanding.
- **Simplified Mode:** Layman-term explanations using analogies, everyday language, and "think of it like..." framing. Suitable for someone encountering the topic for the first time.

The student can switch modes at any time, and the existing notes re-generate in the new mode.

**How to build it:**

1. **Mode toggle:** A dropdown or toggle switch in the header. Two options: "Detailed" and "Simplified". Default is "Detailed".

2. **System prompts:** Maintain two distinct system prompts (see below). When the mode changes, re-process the transcript chunks with the new system prompt.

3. **Detailed mode system prompt:**
   ```
   You are an expert academic note-taker. Transform this lecture segment into
   comprehensive study notes. Use proper terminology, include all technical
   details, reference formulas and definitions precisely. Structure with clear
   headings, sub-points, and highlight key terms in bold. Assume the reader
   has foundational knowledge in this subject and wants depth.
   ```

4. **Simplified mode system prompt:**
   ```
   You are a friendly tutor explaining things to someone with zero background
   in this topic. Transform this lecture segment into simple, clear notes.
   Rules: No jargon without a plain-English explanation. Use analogies from
   everyday life. Use "think of it like..." and "in simple terms..." often.
   Short sentences. If something is complex, break it into bite-sized pieces.
   Write like you're texting a friend who asked "what did I miss in class?"
   ```

5. **Mode switching behavior:**
   - When switched, show a loading indicator on the notes panel
   - Re-process all existing chunks with the new mode's prompt
   - Use streaming to show regenerated notes progressively
   - Cache both versions so switching back is instant (no re-processing)

---

### Feature 3: Visual Learning — Auto-Generated Diagrams & Flowcharts

**What it does:**
As the AI processes lecture content, it identifies concepts that benefit from visual representation and automatically generates diagrams, flowcharts, mind maps, and concept maps embedded directly in the notes.

**How to build it:**

1. **Mermaid.js integration:** Install `mermaid` and create a React component `<MermaidDiagram>` that renders Mermaid syntax into SVG diagrams.

2. **AI diagram generation:** In the note-generation prompt, add this instruction:
   ```
   When explaining relationships, processes, hierarchies, or flows, generate
   a Mermaid.js diagram. Wrap it in a ```mermaid code block. Types to use:
   - flowchart TD for processes and decision flows
   - graph LR for relationships and connections
   - sequenceDiagram for step-by-step processes
   - mindmap for topic overviews
   - classDiagram for hierarchies and structures

   Keep diagrams simple (max 8-10 nodes). Label edges clearly.
   Use short, readable node labels.
   ```

3. **Diagram rendering pipeline:**
   - AI returns notes in markdown with embedded ```mermaid blocks
   - Parse the markdown, extract mermaid blocks
   - Render each block using the `<MermaidDiagram>` component
   - Render remaining markdown normally with `react-markdown`
   - If mermaid syntax is invalid, show a fallback text description

4. **Visual learning enhancements:**
   - Add a "Visual Summary" section at the end of each sub-topic that shows a concept map connecting the key ideas
   - For math-heavy topics, render LaTeX equations using KaTeX
   - For comparison topics, auto-generate comparison tables

5. **Example output:**
   When the teacher explains "how attention mechanism works in transformers":
   ```mermaid
   flowchart TD
       A[Input Sequence] --> B[Generate Q, K, V]
       B --> C[Calculate Attention Scores]
       C --> D[Apply Softmax]
       D --> E[Weighted Sum of Values]
       E --> F[Output Representation]
       C -->|"Q × K^T / √d"| D
   ```

---

### Feature 4: Constructive Learning & "Teach It Back" Mode

**What it does:**
After each sub-topic (or at the end of the lecture), the app enters a "teach it back" mode where the AI asks the student to explain what they just learned. The AI then evaluates the student's understanding and provides targeted feedback.

**How to build it:**

1. **"Teach It Back" prompt cards:** After each major sub-topic in the notes, insert a collapsible card:
   ```
   ┌─────────────────────────────────────────────┐
   │  🎓 Can you explain this?                    │
   │                                               │
   │  "Explain the concept of [sub-topic] in      │
   │   your own words."                            │
   │                                               │
   │  [Type your explanation...]                   │
   │  [🎤 Voice]  [📸 Upload]  [✓ Submit]          │
   └─────────────────────────────────────────────┘
   ```

2. **Multi-modal input:** Students can respond by:
   - **Typing:** Free-text explanation
   - **Voice:** Record audio → transcribe with Web Speech API → process as text
   - **Image upload:** Upload a photo of handwritten work, calculations, or diagrams → send to Claude with vision capabilities to evaluate

3. **AI evaluation:** Send the student's response to Claude with context:
   ```
   You are evaluating a student's understanding. Here is what was taught:
   [sub-topic notes]

   Here is the student's explanation:
   [student response]

   Evaluate their understanding on a scale of 1-5:
   5 = Perfect understanding, could teach others
   4 = Good understanding, minor gaps
   3 = Partial understanding, some misconceptions
   2 = Weak understanding, significant gaps
   1 = Does not demonstrate understanding

   Provide:
   1. Score with brief justification
   2. What they got right (positive reinforcement)
   3. What they missed or got wrong (specific, kind correction)
   4. A one-sentence "try thinking of it this way..." tip if score < 4
   ```

4. **Feedback display:**
   ```
   ┌─────────────────────────────────────────────┐
   │  Understanding: ████░ 4/5 — Good!            │
   │                                               │
   │  ✅ You nailed: The core idea of attention     │
   │     as weighted relevance.                    │
   │                                               │
   │  📝 Missed: You didn't mention that the       │
   │     scaling factor (√d) prevents softmax      │
   │     from saturating with large dimensions.    │
   │                                               │
   │  💡 Tip: Think of √d like adjusting volume —  │
   │     without it, the signal gets too loud.     │
   │                                               │
   │  [Try Again]  [Next Topic →]                  │
   └─────────────────────────────────────────────┘
   ```

---

### Feature 5: Smart To-Do List & Reminder Extraction

**What it does:**
The AI monitors the lecture transcript for any mention of assignments, exams, deadlines, readings, or tasks. At the end of the lecture, it presents a structured to-do list with dates, and allows the student to set reminders.

**How to build it:**

1. **Extraction prompt (runs on each transcript chunk):**
   ```
   Analyze this lecture transcript segment for any mentions of:
   - Exam dates, quiz dates, test dates
   - Assignment due dates or deadlines
   - Required readings or textbook chapters
   - Homework problems or practice sets
   - Office hours or review sessions
   - Project milestones
   - Any other actionable tasks for students

   For each item found, extract:
   {
     "task": "description of the task",
     "due_date": "extracted date if mentioned, otherwise null",
     "urgency": "high/medium/low",
     "type": "exam | assignment | reading | project | other",
     "original_quote": "the exact words the teacher used"
   }

   If no actionable items are found in this segment, return an empty array.
   Return valid JSON only.
   ```

2. **To-Do panel:** A collapsible panel at the bottom of the notes page:
   ```
   ┌─────────────────────────────────────────────┐
   │  📋 Action Items from Today's Lecture         │
   ├─────────────────────────────────────────────┤
   │  🔴 Exam: Midterm on April 15th              │
   │     "midterm covers chapters 1 through 6"    │
   │     [Set Reminder ▼]                         │
   │                                               │
   │  🟡 Assignment: Problem Set 4 due April 12   │
   │     "submit on Canvas before midnight"        │
   │     [Set Reminder ▼]                         │
   │                                               │
   │  🟢 Reading: Chapter 7 for next class         │
   │     "focus on sections 7.1 and 7.3"          │
   │     [Set Reminder ▼]                         │
   │                                               │
   │  [Export to Google Calendar]                   │
   │  [Copy as text]                               │
   └─────────────────────────────────────────────┘
   ```

3. **Reminder system (MVP):**
   - For MVP: "Set Reminder" opens a dropdown with options: "1 day before", "3 days before", "1 week before"
   - Store reminders in Supabase with a scheduled notification
   - Send email reminders via a cron job (Supabase Edge Functions or Vercel Cron)
   - Future: Push notifications, Google Calendar API integration

4. **Google Calendar export (v2):**
   - Generate .ics file download for individual items
   - Or use Google Calendar API to add events directly

---

### Feature 6: End-of-Lecture Quiz (7-10 Questions with Multi-Modal Answers)

**What it does:**
When the student clicks "End Lecture" or the lecture concludes, the app generates a quiz of 7-10 questions based on the lecture content. The student can answer by typing, voice input, or uploading handwritten calculations/diagrams. The AI grades each answer and provides feedback.

**How to build it:**

1. **Quiz generation prompt:**
   ```
   Based on the following lecture notes, generate exactly 8 quiz questions.

   Question type distribution:
   - 2 factual recall questions (definitions, key facts)
   - 2 conceptual understanding questions (explain why/how)
   - 2 application questions (solve a problem, apply the concept)
   - 1 comparison/contrast question
   - 1 "teach it" question (explain this to someone who doesn't know it)

   For each question, also generate:
   - The ideal answer (for grading reference)
   - Key points that MUST be in a correct answer
   - Common misconceptions to watch for
   - Difficulty level (easy/medium/hard)

   Return as JSON:
   {
     "questions": [
       {
         "id": 1,
         "type": "factual|conceptual|application|comparison|teach",
         "difficulty": "easy|medium|hard",
         "question": "...",
         "ideal_answer": "...",
         "key_points": ["...", "..."],
         "common_mistakes": ["...", "..."]
       }
     ]
   }
   ```

2. **Quiz UI:**
   ```
   ┌─────────────────────────────────────────────────┐
   │  📝 Lecture Quiz — Question 3 of 8              │
   │  Difficulty: ●●○ Medium                         │
   ├─────────────────────────────────────────────────┤
   │                                                   │
   │  "Explain why the scaling factor √d_k is         │
   │   necessary in the attention score calculation.   │
   │   What would happen without it?"                  │
   │                                                   │
   │  ┌───────────────────────────────────────────┐   │
   │  │ Type your answer here...                   │   │
   │  │                                            │   │
   │  │                                            │   │
   │  └───────────────────────────────────────────┘   │
   │                                                   │
   │  [🎤 Answer by Voice]  [📸 Upload Handwritten]   │
   │                                                   │
   │  [← Previous]  [Submit Answer]  [Skip →]         │
   └─────────────────────────────────────────────────┘
   ```

3. **Answer evaluation prompt:**
   ```
   You are grading a student's quiz answer.

   Question: {question}
   Ideal answer: {ideal_answer}
   Key points required: {key_points}
   Common mistakes to check for: {common_mistakes}

   Student's answer: {student_answer}

   Evaluate and return JSON:
   {
     "is_correct": true/false,
     "score": 0-100,
     "feedback": "specific feedback on their answer",
     "correct_parts": ["what they got right"],
     "missing_parts": ["what they missed"],
     "misconceptions": ["any incorrect ideas to correct"],
     "model_answer": "a brief model answer for reference"
   }
   ```

4. **For image/handwritten uploads:**
   - Accept image upload (jpg, png, heic)
   - Send to Claude API with vision capability:
     ```
     "Look at this handwritten student answer/calculation.
      Transcribe the content, then evaluate it against the
      ideal answer. Check mathematical steps for correctness.
      If it's a diagram, evaluate if it accurately represents
      the concept."
     ```

5. **Results summary page:**
   ```
   ┌─────────────────────────────────────────────────┐
   │  🎓 Quiz Results                                 │
   │                                                   │
   │  Score: 6/8 (75%) — Good understanding!          │
   │                                                   │
   │  ✅ Q1: Correct — Definition of attention         │
   │  ✅ Q2: Correct — Query, Key, Value roles         │
   │  ✅ Q3: Correct — Scaling factor purpose          │
   │  ❌ Q4: Incorrect — Multi-head attention          │
   │     → You confused concatenation with averaging   │
   │  ✅ Q5: Correct — Positional encoding             │
   │  ✅ Q6: Correct — Self vs cross attention         │
   │  ❌ Q7: Incorrect — Computational complexity      │
   │     → It's O(n²·d), not O(n·d²)                  │
   │  ✅ Q8: Correct — Teaching explanation             │
   │                                                   │
   │  📊 Weak areas to review:                         │
   │  • Multi-head attention mechanism                 │
   │  • Computational complexity analysis              │
   │                                                   │
   │  [Review Notes]  [Retake Quiz]  [Save Results]   │
   └─────────────────────────────────────────────────┘
   ```

---

## DATABASE SCHEMA (Supabase / PostgreSQL)

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  university text,
  plan text default 'free', -- 'free' | 'pro'
  created_at timestamptz default now()
);

-- Lecture Sessions
create table lectures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  title text,
  course_name text,
  mode text default 'detailed', -- 'detailed' | 'simple'
  transcript_full text,
  slides_content text,
  notes_detailed text,
  notes_simple text,
  duration_minutes int,
  created_at timestamptz default now()
);

-- To-Do Items extracted from lectures
create table todos (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid references lectures(id),
  user_id uuid references users(id),
  task text not null,
  due_date date,
  urgency text, -- 'high' | 'medium' | 'low'
  type text, -- 'exam' | 'assignment' | 'reading' | 'project' | 'other'
  original_quote text,
  is_completed boolean default false,
  reminder_at timestamptz,
  created_at timestamptz default now()
);

-- Quiz results
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid references lectures(id),
  user_id uuid references users(id),
  questions jsonb not null,
  answers jsonb not null,
  score int, -- percentage 0-100
  created_at timestamptz default now()
);
```

---

## FILE & FOLDER STRUCTURE

```
scratch-ai/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── dashboard/
│   │   └── page.tsx               # Student dashboard — past lectures
│   ├── lecture/
│   │   ├── new/
│   │   │   └── page.tsx           # Start new lecture session
│   │   └── [id]/
│   │       ├── page.tsx           # Live lecture view (main UI)
│   │       ├── quiz/
│   │       │   └── page.tsx       # End-of-lecture quiz
│   │       └── review/
│   │           └── page.tsx       # Review past lecture notes
│   └── api/
│       ├── transcribe/
│       │   └── route.ts           # Process transcript chunks
│       ├── generate-notes/
│       │   └── route.ts           # AI note generation (streaming)
│       ├── generate-quiz/
│       │   └── route.ts           # Quiz question generation
│       ├── evaluate-answer/
│       │   └── route.ts           # Grade quiz answers
│       ├── extract-todos/
│       │   └── route.ts           # Extract action items
│       └── parse-slides/
│           └── route.ts           # Parse uploaded PDF/PPTX
├── components/
│   ├── lecture/
│   │   ├── TranscriptPanel.tsx    # Live transcript display
│   │   ├── NotesPanel.tsx         # AI-generated notes display
│   │   ├── ModeToggle.tsx         # Detailed/Simple switch
│   │   ├── RecordingControls.tsx  # Start/pause/stop buttons
│   │   ├── SlideUploader.tsx      # Upload lecture slides
│   │   └── MermaidDiagram.tsx     # Render mermaid diagrams
│   ├── quiz/
│   │   ├── QuizCard.tsx           # Single question display
│   │   ├── AnswerInput.tsx        # Text/voice/image answer input
│   │   ├── QuizResults.tsx        # Results summary
│   │   └── VoiceRecorder.tsx      # Voice input component
│   ├── todos/
│   │   ├── TodoPanel.tsx          # Action items panel
│   │   ├── TodoItem.tsx           # Single to-do item
│   │   └── ReminderPicker.tsx     # Set reminder dropdown
│   └── ui/                        # Shared UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── ai/
│   │   ├── prompts.ts             # All system prompts centralized
│   │   ├── claude.ts              # Claude API client wrapper
│   │   └── chunk-processor.ts     # Transcript chunking logic
│   ├── speech/
│   │   └── web-speech.ts          # Web Speech API wrapper
│   ├── parsers/
│   │   ├── pdf-parser.ts          # PDF text extraction
│   │   ├── pptx-parser.ts         # PPTX text extraction
│   │   └── vtt-parser.ts          # VTT transcript parsing
│   ├── supabase/
│   │   ├── client.ts              # Supabase client setup
│   │   └── queries.ts             # Database query functions
│   └── utils/
│       ├── markdown.ts            # Markdown parsing with mermaid
│       └── date-extractor.ts      # Date/deadline extraction helpers
├── contexts/
│   └── LectureContext.tsx         # Lecture session state management
├── hooks/
│   ├── useSpeechRecognition.ts    # Speech recognition hook
│   ├── useStreamingNotes.ts       # Streaming AI response hook
│   └── useLectureSession.ts       # Session management hook
├── public/
│   └── ...
├── .env.local                     # API keys (ANTHROPIC_API_KEY, SUPABASE_URL, etc.)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## IMPLEMENTATION ORDER (Build Sequence)

Follow this exact order. Each step should be fully working before moving to the next.

### Step 1: Project Setup & Landing Page
- `npx create-next-app@latest scratch-ai --typescript --tailwind --app`
- Set up Supabase project and create tables
- Build a simple landing page explaining what Scratch.ai does
- Set up environment variables

### Step 2: Slide Upload & Parsing
- Build the SlideUploader component
- Implement PDF and PPTX parsing on the backend
- Test with real lecture slides from Canvas
- Display parsed slide content

### Step 3: Speech Recognition (Core)
- Implement the `useSpeechRecognition` hook using Web Speech API
- Build the TranscriptPanel to display live text
- Build the RecordingControls (start/pause/stop)
- Test with a real lecture or YouTube video of a lecture

### Step 4: AI Note Generation (Core)
- Set up Claude API integration
- Implement the transcript chunking logic
- Build the streaming note generation endpoint
- Build the NotesPanel to display streaming notes
- Implement the dual-mode system prompts
- Build the ModeToggle component

### Step 5: Mermaid Diagram Integration
- Build the MermaidDiagram component
- Update the AI prompts to generate mermaid blocks
- Integrate mermaid rendering into the NotesPanel markdown parser
- Test with various lecture topics

### Step 6: To-Do Extraction
- Build the todo extraction API endpoint
- Build the TodoPanel and TodoItem components
- Build the ReminderPicker
- Store todos in Supabase
- Set up email reminder cron job

### Step 7: End-of-Lecture Quiz
- Build the quiz generation endpoint
- Build QuizCard and AnswerInput components
- Implement text answer evaluation
- Implement voice answer (record → transcribe → evaluate)
- Implement image upload answer (photo → Claude Vision → evaluate)
- Build the QuizResults summary page

### Step 8: Dashboard & History
- Build the student dashboard showing past lectures
- Allow reviewing old notes, retaking quizzes
- Implement search across past lectures

### Step 9: Auth & Payments
- Set up Supabase Auth (email/password + Google OAuth)
- Implement free tier limits (3 lectures/week)
- Set up Stripe for Pro subscriptions ($5-8/month)

---

## KEY TECHNICAL NOTES

1. **API cost management:** Each lecture will use roughly 10-30 Claude API calls (one per transcript chunk + quiz + todos). At ~$0.003-0.015 per call with Sonnet, a full lecture costs approximately $0.10-0.50. Build in token counting and cost tracking from day one.

2. **Web Speech API limitations:** It requires Chrome/Edge. Safari support is limited. For the MVP this is fine since most students use Chrome. Show a "please use Chrome" message for unsupported browsers.

3. **Streaming is essential:** Notes MUST stream in real-time using Claude's streaming API. Do not wait for full completion — students need to see notes appearing as the lecture happens. Use Server-Sent Events (SSE) from the API route to the frontend.

4. **Mermaid error handling:** AI-generated Mermaid syntax will sometimes be invalid. Always wrap the Mermaid renderer in a try-catch and show the raw text as fallback. Validate basic syntax before rendering.

5. **Mobile responsiveness:** Many students will use this on tablets or phones in lecture halls. The layout should stack vertically on mobile (transcript on top, notes below) with easy mode switching.

6. **Offline resilience:** Cache notes locally in IndexedDB so students don't lose their notes if WiFi drops. Sync to Supabase when connection returns.
