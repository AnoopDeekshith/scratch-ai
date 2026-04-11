# Scratch.ai — Action Plan & To-Do List

## Week 1: Validation Sprint (April 9 – April 16)

### Track 1: Proof of Value (Technical) — 2-3 Evenings

- [ ] Attend a real lecture at UCSC and collect two things:
  - The Zoom transcript (.vtt or copy from Zoom)
  - The lecture slides/PDF from Canvas
- [ ] Set up the Claude API (get API key from console.anthropic.com)
- [ ] Run the Scratch.ai proof-of-concept Python script with real lecture data
- [ ] Evaluate the output honestly — is this something you'd actually use?
- [ ] Tweak the prompts based on what's weak (too verbose? missing key points? bad structure?)
- [ ] Try it on a second lecture from a different subject to test versatility

### Track 2: Proof of Demand (Market) — Coffee Chats

- [ ] Identify 10 UCSC students to talk to (aim for different majors, especially heavy-lecture courses: bio, econ, history, CS)
- [ ] Have conversations using these 5 questions:
  1. How do you take notes during lecture right now?
  2. What happens when you miss something important the professor said?
  3. Do you use Zoom recordings after class? How often?
  4. If a tool automatically turned your lecture into structured study notes with summaries and review questions, would you use it?
  5. Would you pay $5/month for that?
- [ ] Write down their exact words (emotional reactions matter more than polite interest)
- [ ] Document patterns — what phrases keep coming up?
- [ ] Identify 3-5 people who were most excited (these are your future beta testers)

### Track 1 + 2 Decision Matrix

| Tech works? | People want it? | Next step |
|---|---|---|
| Yes | Yes | Green light — build the MVP |
| Yes | No | Pivot the use case — the tech is good, find the right audience |
| No | Yes | Improve prompts/pipeline — demand is there, tech needs work |
| No | No | Rethink the idea — you saved yourself months |

---

## Week 2–3: Bare-Bones Web App (if validated)

- [ ] Build a simple web page (Flask or Next.js) with:
  - Upload field for transcript file
  - Upload field for lecture slides/PDF
  - "Normal" vs "Simplified" toggle
  - Output display for structured notes
- [ ] No auth, no payments, no polish — just the core flow
- [ ] Give it to 5 classmates for free
- [ ] Collect feedback: What's useful? What's missing? What's confusing?

---

## Week 4–6: Real-Time & Core Features

- [ ] Investigate Zoom live transcript API integration
- [ ] Add the Normal / Layman explanation toggle as a proper feature
- [ ] Add user accounts (simple email-based auth)
- [ ] Auto-generate review questions and Q&A section
- [ ] Auto-extract to-do items (assignments, readings, deadlines mentioned in lecture)
- [ ] Open up to 20-30 students

---

## Week 7–8: Monetization

- [ ] Add payment wall (Stripe — simple monthly subscription)
- [ ] Pricing: Free tier (3 lectures/week) + Pro ($5-8/month unlimited)
- [ ] Track retention — are students coming back every week?
- [ ] If yes, you have a business. If no, dig into why.

---

## Future Roadmap (v2+)

- [ ] Auto-generated diagrams and flowcharts (Mermaid.js)
- [ ] Summary cards for quick review
- [ ] "Teach it back" mode — AI quizzes you by asking you to explain concepts
- [ ] Canvas LMS integration (auto-pull slides)
- [ ] Study group features (shared notes, collaborative annotations)
- [ ] Professor dashboard (opt-in — provides teacher with engagement data)

---

## Things NOT To Do Yet

- Do not buy a domain
- Do not design a logo
- Do not build a frontend before validating
- Do not set up a business entity
- Do not write a business plan
- Do not spend money on ads

---

## Key Metrics to Track

- **Validation:** X out of 10 students said they'd use it / pay for it
- **Engagement:** How often do beta users come back?
- **Retention:** After 2 weeks, are they still using it?
- **NPS:** Would they recommend it to a classmate?

---

## Competitive Landscape (Research)

- [ ] Otter.ai — general transcription, not lecture-specific
- [ ] Zoom AI Companion — built-in summaries, but generic
- [ ] Notion AI — note enhancement, but requires manual input
- [ ] Your edge: purpose-built for college lectures + Canvas + dual explanation modes
