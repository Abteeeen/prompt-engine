"""Source of seeds/exemplars.json. Edit here, then run: python3 seeds/exemplars.py
Each entry: a rough idea a real user would type, and the expert prompt we want the engine to aim for.
"""
import json, os

S = []
def add(domain, ptype, request, prompt, score=29):
    S.append({"domain": domain, "promptType": ptype, "request": request, "prompt": prompt.strip(), "score": score})

add("code-generation", "code", "write a python function to dedupe a csv by email",
"""ROLE
You are a senior Python engineer who writes small, well-tested data utilities.

TASK
Write a function `dedupe_by_email(in_path: str, out_path: str) -> int` that removes duplicate rows from a CSV, keyed on the email column, and returns the number of rows removed.

REQUIREMENTS
- Python 3.11, standard library only (csv, pathlib).
- Email comparison is case-insensitive and ignores surrounding whitespace.
- Keep the first occurrence; preserve the original column order and header.
- Stream the file: it may be 2 GB, so never load all rows into memory at once (track seen emails in a set).
- Rows with an empty email are kept, not deduplicated.
- Raise ValueError with a clear message if there is no column named "email" (case-insensitive).

OUTPUT FORMAT
1. The function with type hints and a docstring.
2. Five pytest tests: basic duplicates, case/whitespace variants, empty emails, missing column, header-only file.
3. Two sentences on time and memory complexity.

CHECK BEFORE ANSWERING
Run the tests mentally against the edge cases above and fix any failure before you reply.""")

add("data-analysis", "research", "analyze our churn data and tell me why customers leave",
"""ROLE
You are a product analyst who explains churn to a non-technical leadership team.

CONTEXT
I will paste a CSV of customers with: signup_date, plan, seats, last_active_date, support_tickets, churned (yes/no), churn_reason (free text, often empty).

TASK
Find the three strongest drivers of churn and what we should do about each.

STEPS
1. State the overall churn rate and the date range covered.
2. Compare churned vs retained customers on plan, seats, tenure, days since last activity and ticket count. Report the differences as numbers.
3. Group the free-text churn_reason values into at most 6 themes with counts.
4. Rank the three drivers by how many churned customers they explain.

OUTPUT FORMAT
- A 3-line executive summary.
- A table: driver | evidence (numbers) | share of churn explained | recommended action | how we will know it worked.
- Data caveats: missing values, small groups (fewer than 30 customers), correlation vs cause.

RULES
Do not invent numbers. If the data cannot answer something, say what extra column would.""")

add("content-writing", "writing", "blog post about why small teams should document decisions",
"""ROLE
You are an editor at a respected engineering blog who writes for founders and team leads of 5 to 50 people.

TASK
Write a 1,100 to 1,300 word blog post arguing that small teams should write down decisions, with a lightweight method they can start this week.

AUDIENCE
Busy team leads who think documentation is bureaucracy. They will skim first and read only if the opening earns it.

STRUCTURE
1. Headline under 60 characters plus one alternative.
2. Opening: a concrete scene of a team re-arguing a decision made three months ago (no "In today's fast-paced world").
3. The cost: three specific failure modes with one realistic example each.
4. The method: a 5-field decision record (context, options, decision, owner, revisit date) with a filled example.
5. Objections and answers: "we move too fast", "nobody reads docs", "Notion is a graveyard".
6. A closing call to action that takes under 10 minutes.

STYLE
Plain words, short paragraphs, second person. One idea per paragraph. No buzzwords: avoid "leverage", "synergy", "game-changer".

DELIVER
The post in Markdown, then a 155-character meta description.""")

add("customer-service", "writing", "reply to an angry customer whose order arrived late",
"""ROLE
You are a senior support agent for an online store known for calm, human replies.

SITUATION
A customer's order arrived 6 days after the promised date. They are angry, have used capital letters, and threatened to leave a 1-star review. The delay was caused by our warehouse, not the courier.

TASK
Write one email reply.

REQUIREMENTS
- Open by acknowledging the specific problem in their words; no "we apologise for any inconvenience".
- Take responsibility plainly: the delay was ours.
- Offer one concrete remedy from this list, choosing the one that fits: refund of shipping cost, 15% credit on the next order, or free express shipping next time. Explain why you chose it.
- State one change we are making so it does not repeat.
- Do not ask for the review to be removed or mention reviews at all.
- 120 to 170 words. Sign with a first name.

TONE
Warm, direct, adult. No exclamation marks, no emoji.

OUTPUT
Subject line, then the email body. Then one sentence explaining the remedy choice for the support lead.""")

add("email-writing", "writing", "email my team about moving our weekly meeting",
"""ROLE
You are a team lead who writes short, unambiguous internal emails.

TASK
Write an email telling an 8-person team that the weekly planning meeting moves from Monday 10:00 to Tuesday 09:30, starting next week.

MUST INCLUDE
- The change in the first sentence, with day, time and time zone (CET).
- The reason in one sentence: Mondays are lost to incident follow-up.
- What stays the same: 45 minutes, same video link, same agenda doc.
- What people need to do: accept the new calendar invite by Friday.
- Who to tell if Tuesday does not work, and by when.

CONSTRAINTS
- Under 120 words. Subject line under 8 words that states the change.
- No "hope you're well", no apology for the change.
- Bullet points only for the "what stays the same" part.

OUTPUT
Subject line, then the email.""")

add("social-media", "writing", "linkedin post announcing our product launch",
"""ROLE
You are a B2B founder who writes LinkedIn posts that sound like a person, not a press release.

TASK
Write a LinkedIn post announcing the launch of [PRODUCT], a tool that [ONE-LINE WHAT IT DOES], for [AUDIENCE].

STRUCTURE
1. Hook (first 2 lines, under 200 characters total): a specific problem or a surprising number, not "Excited to announce".
2. The problem in 2 to 3 short lines, using a real moment the audience will recognise.
3. What we built and the one thing it does better than the obvious alternative.
4. Proof: one concrete result, quote or number. If none is provided, leave [PROOF] for me to fill.
5. A single call to action with a link placeholder [LINK].

RULES
- 120 to 200 words. Line breaks between every 1 to 2 sentences.
- At most 3 hashtags, at the end. No emoji bullets.
- Avoid: "revolutionary", "game-changer", "thrilled", "journey".

OUTPUT
The post, then two alternative hooks.""")

add("research-summarization", "research", "summarize this research paper for my team",
"""ROLE
You are a research lead who turns academic papers into decisions for a product team.

INPUT
I will paste the full text of a paper.

TASK
Summarise it so a product manager can decide in 5 minutes whether it matters for us.

OUTPUT FORMAT
1. One-sentence takeaway in plain English.
2. What they did: question, method, data size, in at most 4 bullets.
3. What they found: the 3 results that matter, each with the actual number and its uncertainty if reported.
4. How strong is it: sample size, study design, obvious confounders, whether it was peer reviewed. Rate evidence as strong, moderate or weak and say why.
5. So what for us: 2 to 3 implications for a [OUR PRODUCT/DOMAIN] team, each tagged "act now", "watch" or "ignore".
6. Quotes: up to 2 short verbatim sentences with section names.

RULES
- Do not add facts that are not in the paper. If something is unclear, say "the paper does not say".
- Under 400 words total.""")

add("teaching-explanation", "auto", "explain how compound interest works to a teenager",
"""ROLE
You are a patient maths teacher who explains money to 15-year-olds without talking down to them.

TASK
Explain compound interest so the student could explain it to a friend afterwards.

STRUCTURE
1. Start with a question about something they care about (a phone, a first car), not a definition.
2. Simple interest vs compound interest with one worked example: 1,000 saved at 5% for 10 years, showing year 1, 2, 3 and 10 for both.
3. The "interest on interest" idea in one sentence they could repeat.
4. The rule of 72 as a shortcut, with one example.
5. The flip side: how the same maths makes credit card debt grow.
6. Three quick check questions with answers hidden at the end.

STYLE
Short sentences, no jargon without a one-line explanation, numbers rounded to whole units. Under 450 words.""")

add("product-management", "planning", "write a PRD for adding team workspaces",
"""ROLE
You are a senior product manager writing a one-page PRD that engineers can estimate from.

TASK
Write a PRD for adding team workspaces to [PRODUCT], where today every account is single-user.

SECTIONS
1. Problem: who is hurt today and how we know (cite [EVIDENCE]: tickets, churn reasons, sales calls).
2. Goal and non-goals: 3 of each. Non-goals must include billing changes and SSO.
3. Users and jobs: owner, member, viewer; one job-to-be-done each.
4. Requirements: numbered, each testable, with MUST/SHOULD/COULD. Cover invites, roles, shared library, moving existing personal items, leaving a workspace.
5. Success metrics: one primary metric with target and timeframe, two guardrails.
6. Open questions: at most 5, each with an owner.
7. Rollout: beta cohort, flag, and the condition to go to 100%.

RULES
Under 900 words. No solution design beyond what is needed to remove ambiguity. Flag every assumption with "Assumption:".""")

add("creative-brainstorming", "auto", "ideas for a launch campaign for a budgeting app",
"""ROLE
You are a creative director who produces many ideas fast, then judges them hard.

BRIEF
Product: a budgeting app for people in their twenties who have never budgeted. Budget: under 2,000 USD. Channels: TikTok, Instagram, Reddit, campus partnerships. Goal: 5,000 sign-ups in 30 days.

TASK
1. Generate 15 campaign ideas, one line each, spanning at least 4 different mechanics (challenge, stunt, partnership, content series, tool, community).
2. Score each 1 to 5 on: cost fit, shareability, fit with the audience, how directly it drives sign-ups.
3. Pick the top 3 and develop each into: concept name, the hook in one sentence, 3 execution steps, what it costs, the metric that proves it is working in week 1.

RULES
- No celebrity or influencer deals above budget.
- At least 3 of the 15 ideas must be deliberately unusual.
- Be honest in scoring; most ideas should not score 5.""")

add("cold-outreach", "writing", "cold email to a saas founder about our tool",
"""ROLE
You are a founder writing to another founder. You are not a salesperson and the email must not read like one.

TASK
Write one cold email to the founder of a seed-stage SaaS company. The only goal is a reply agreeing to a 15-minute call.

CONTEXT
- Sender: [YOUR NAME], founder of [PRODUCT], which [WHAT IT DOES IN ONE LINE].
- Reader: technical founder of a 5 to 30 person team; reads email on a phone between meetings.
- Likely pain: [PAIN IN THEIR WORDS].

REQUIREMENTS
- Subject line of 6 words or fewer, lowercase, no clickbait.
- Body of 120 words or fewer, three short paragraphs.
- First sentence: one specific, checkable observation about their company. Leave [OBSERVATION] if none is given.
- Exactly one proof point with one number; use [PROOF] if none is given.
- One ask, as a yes/no question with two time windows.
- Do not use "hope this finds you well", "quick question", "game-changer", "10x".

OUTPUT
Subject, body, then two alternative first lines for different triggers (a funding round, a hiring post).

CHECK
If the first line could be sent to any founder, rewrite it.""", 30)

add("sales-call-script", "auto", "discovery call script for selling hr software",
"""ROLE
You are a sales coach who trains new account executives in consultative discovery.

TASK
Write a 25-minute discovery call guide for selling [HR SOFTWARE] to HR managers at 50 to 300 person companies.

STRUCTURE
1. Opening (2 min): agenda, time check, permission to ask questions. Word for word.
2. Current state (8 min): 6 open questions about how they handle hiring, onboarding and reviews today. For each, one follow-up that digs for numbers (hours, cost, error rate).
3. Impact (5 min): 3 questions that tie the problem to business cost and who feels it.
4. Decision process (5 min): budget, timeline, other stakeholders, what happened last time they bought software.
5. Next step (5 min): two scripted closes depending on fit, and a polite disqualification line if there is no fit.

RULES
- Questions must be open; no leading or yes/no questions in sections 2 and 3.
- The rep talks less than 30% of the time; mark where to stay silent.
- Include 3 red flags that mean the deal will not close.""")

add("objection-handling", "auto", "how to handle 'it's too expensive' objection",
"""ROLE
You are a B2B sales trainer who teaches reps to handle objections without discounting.

TASK
Write a response playbook for the objection "it's too expensive" for [PRODUCT] priced at [PRICE] per month.

FOR EACH OF THESE 4 VARIANTS
a) Real budget limit. b) Comparing to a cheaper competitor. c) Not convinced of the value yet. d) Negotiation tactic.

PROVIDE
- How to tell which variant it is: one diagnostic question and what each answer means.
- A word-for-word response (under 60 words) that acknowledges, asks, and reframes to value.
- The proof to bring: a calculation, a case study type, or a trial structure.
- What never to say.

RULES
- No discount is offered in the first response of any variant.
- Tone: calm and curious, never defensive.
- End with a one-page cheat sheet table: variant | signal | question | response | proof.""")

add("youtube-script", "writing", "youtube video script about learning to code at 30",
"""ROLE
You are a YouTube scriptwriter for an educational channel with high retention.

TASK
Write a 9 to 11 minute script titled around "Learning to code at 30" for career changers.

STRUCTURE
1. Hook (0:00 to 0:20): a specific, slightly uncomfortable truth, then the promise of the video. No channel intro.
2. Three myths, each busted with one real data point or story (use [SOURCE] where a citation is needed).
3. A 12-month plan in 4 phases with weekly hours, what to build in each phase, and how to know you are ready for the next.
4. The hardest moment (month 4 to 6) and how to get through it.
5. Close: one action for today and a natural lead into the next video.

FORMAT
Two columns per beat: SPOKEN (what I say) and ON SCREEN (b-roll, text overlay, graphic). Mark pattern interrupts every 60 to 90 seconds.

STYLE
Conversational, second person, short sentences that are easy to say out loud.""")

add("podcast-outline", "planning", "podcast episode outline interviewing a startup founder",
"""ROLE
You are a podcast producer preparing a host for a 45-minute founder interview.

GUEST
[NAME], founder of [COMPANY], which [WHAT IT DOES]; known for [ONE NOTABLE THING].

DELIVER
1. Episode title (3 options) and a 2-sentence description for the feed.
2. Cold open: the moment from the interview most likely to make someone keep listening, as a question to ask early.
3. Segments with timings: origin (8 min), the hardest decision (12 min), how they work (10 min), what they got wrong (8 min), rapid fire (5 min), close (2 min).
4. For each segment: 3 main questions and 2 follow-ups that push for specifics (numbers, names, moments).
5. Questions to avoid because the guest has answered them on 5 other shows.
6. Three clip-able moments to listen for, for social.

RULES
Open questions only. No question longer than 25 words.""")

add("tiktok-hook", "writing", "tiktok hooks for a meal prep business",
"""ROLE
You are a short-form video strategist who writes hooks that stop the scroll in the first second.

PRODUCT
A weekly meal prep service for busy professionals in [CITY]; meals from [PRICE] each.

TASK
Write 12 hooks for 15 to 30 second TikToks, across these patterns (at least 2 each): curiosity gap, bold claim, relatable pain, before/after, mistake callout, number list.

FOR EACH HOOK
- The spoken line (under 12 words).
- The first frame: what is on screen in the first second.
- On-screen text (under 7 words).
- The payoff that must come by second 8 so the hook is honest.

RULES
- No clickbait the video cannot pay off.
- No "you won't believe", "wait for it".
- Then pick the 3 strongest and explain in one line each why.""")

add("contract-drafting", "writing", "draft a simple freelance design contract",
"""ROLE
You are a contracts paralegal drafting plain-English agreements for freelancers. You are not giving legal advice.

TASK
Draft a freelance design services agreement between [DESIGNER] and [CLIENT] for [PROJECT], governed by the law of [JURISDICTION].

CLAUSES (numbered, plain English)
1. Scope and deliverables, with a schedule placeholder.
2. Revisions: [N] rounds included, extra rounds at [RATE].
3. Fees and payment: [AMOUNT], 50% upfront, balance on delivery, late fee after 14 days.
4. Timeline and what happens if the client is late with feedback.
5. Intellectual property: transfers on full payment; designer keeps portfolio rights.
6. Confidentiality.
7. Termination by either side with 14 days' notice; payment for work done.
8. Liability cap at fees paid.
9. Signatures.

RULES
- Every number and name is a [PLACEHOLDER].
- After the contract, list 5 points the user should have a local lawyer review.
- Add the line "This template is not legal advice." at the top.""")

add("privacy-policy", "writing", "privacy policy for my small saas app",
"""ROLE
You are a privacy specialist who writes readable privacy policies for small SaaS products. This is a draft, not legal advice.

PRODUCT FACTS (fill before use)
Company [NAME] in [COUNTRY]; collects [DATA LIST]; uses processors [PROCESSORS, e.g. hosting, email, analytics]; users in [REGIONS].

TASK
Write a privacy policy in plain English, under 1,200 words.

SECTIONS
Who we are; what we collect and why (table: data | purpose | legal basis | retention); who we share it with; international transfers; cookies; your rights and how to exercise them; children; security; changes; contact.

RULES
- Use only the facts provided; mark anything missing as [TO CONFIRM].
- No vague phrases like "we may share data with partners"; name the category of processor.
- Include a 5-line summary at the top.
- End with a checklist of what a lawyer should verify for [REGIONS] (for example GDPR, CCPA).""")

add("business-plan", "planning", "one page business plan for a coffee cart",
"""ROLE
You are a small-business advisor who writes one-page plans that banks and partners can read in 3 minutes.

BUSINESS
A mobile coffee cart in [CITY], operating at [LOCATIONS/EVENTS], owner-operated.

TASK
Write a one-page business plan.

SECTIONS
1. The opportunity in 2 sentences, with one local number (foot traffic, events per month) or [DATA NEEDED].
2. Offer and pricing: 5 core items with price and estimated cost per cup.
3. Customers: two segments and where to find them.
4. Operations: permits, suppliers, hours, weather plan.
5. Numbers: startup costs (itemised), monthly fixed costs, break-even cups per day, and a 12-month cash projection in a small table with conservative and expected cases.
6. Risks: top 3 with mitigation.
7. The ask: what funding or support is needed and what it buys.

RULES
Show the break-even calculation. Label every assumption. Fit on one page (about 550 words plus the table).""")

add("pitch-deck", "planning", "pitch deck outline for a seed round",
"""ROLE
You are a seed-stage investor who has seen 2,000 decks and helps founders tell a clear story.

COMPANY
[NAME]: [WHAT IT DOES] for [WHO]. Stage: [TRACTION]. Raising [AMOUNT].

TASK
Write a 12-slide pitch deck narrative.

FOR EACH SLIDE
- Title as a claim, not a label ("Teams lose 6 hours a week to X", not "Problem").
- 3 bullets maximum, each under 12 words.
- The one visual that proves the claim.
- Speaker note: what to say in 20 seconds.

SLIDES
Title; problem; why now; solution; demo moment; traction; market (bottom-up); business model; competition (2x2 with honest axes); team; use of funds with milestones; the ask.

RULES
- Every number is either provided or marked [DATA].
- Flag the 3 slides an investor will challenge hardest and the question they will ask.""")

add("financial-analysis", "research", "analyze this company's income statement",
"""ROLE
You are an equity analyst explaining a company's financials to a smart non-specialist.

INPUT
I will paste 3 years of income statement data for [COMPANY].

TASK
1. Calculate for each year: revenue growth, gross margin, operating margin, net margin, and operating expenses as % of revenue by line.
2. Present the results in a table with years as columns.
3. Explain the 3 most important trends in plain language, with the number behind each.
4. Identify 2 red flags and 2 strengths.
5. List 5 questions you would ask management, ordered by importance.

RULES
- Show formulas for each ratio once.
- Use only the numbers provided; if a line is missing, say so instead of estimating.
- Round percentages to one decimal place.
- Under 600 words plus the table. No investment recommendation.""")

add("daily-planning", "planning", "help me plan my day i have too much to do",
"""ROLE
You are a calm productivity coach who plans realistic days, not ideal ones.

INPUT
I will paste my task list, fixed meetings, and when I work best. Today I have [HOURS] hours of working time.

TASK
1. Ask nothing; work with what I give you and state assumptions.
2. Sort tasks into: must today (consequence if not done), should, can wait. Explain each "must" in under 10 words.
3. Estimate each task's time, then cut until planned work is at most 70% of available time.
4. Build a time-blocked schedule: deep work in my best hours, shallow tasks batched, a 15-minute buffer after every 2 hours, and lunch.
5. Name the one task that makes today a success if nothing else gets done.
6. List what I am explicitly not doing today and who to tell.

OUTPUT
A schedule table (time | block | task | done-when), then the not-today list. Under 300 words.""")

add("decision-making", "planning", "should i take a new job offer",
"""ROLE
You are a decision coach who helps people make hard choices with structure, not cheerleading.

INPUT
I will describe my current job, the new offer, and my situation.

TASK
1. Restate the decision in one sentence and what a good outcome looks like in 2 years.
2. List the criteria that matter to me (ask me to confirm weights 1 to 5 if I have not given them).
3. Score both options on each criterion with a one-line reason; compute a weighted total.
4. Run three checks: a pre-mortem (it is a year later and the choice failed, why?), the 10/10/10 test, and what I would advise a friend.
5. Identify the one piece of information that would change the answer and how to get it this week.
6. Give a recommendation with your confidence (low, medium, high) and why.

RULES
Be direct. Do not hide behind "it depends". Under 500 words plus the scoring table.""")

add("habit-building", "planning", "help me build a habit of exercising",
"""ROLE
You are a behaviour-change coach who designs habits that survive bad weeks.

PERSON
Currently exercises [FREQUENCY]; available times [TIMES]; constraints [INJURIES, EQUIPMENT, BUDGET].

TASK
Design a 6-week habit plan to exercise 3 times a week.

INCLUDE
1. The minimum version: a 10-minute session that counts on bad days.
2. Cue, routine, reward for each session, tied to something already in the day.
3. Week-by-week progression with exact sessions.
4. Friction to remove tonight (3 concrete actions).
5. A simple tracking method and the rule for a missed day ("never miss twice").
6. What to do in week 3, when motivation usually drops.

RULES
Specific times and actions, no generic advice like "stay motivated". Under 400 words plus a weekly table.""")

add("ux-copy", "writing", "error message copy for failed payment",
"""ROLE
You are a UX writer for a subscription app who writes interface copy that is clear, calm and useful.

TASK
Write the copy for a failed payment at checkout.

COVER THESE CASES
Card declined; insufficient funds; expired card; 3-D Secure failed; network error; unknown error.

FOR EACH CASE
- Title (under 6 words).
- Body (under 25 words): what happened, in human words, and what to do next.
- Primary button label (2 to 3 words) and secondary action.
- Whether the user's cart is kept (always say so).

RULES
- Never blame the user. No "Oops", no exclamation marks, no error codes in the title.
- Do not reveal the bank's decline reason when we do not know it.
- Reading level around grade 6.
- End with a short style note: voice rules used, so others can extend it.""")

add("brand-voice", "writing", "create a brand voice guide for my startup",
"""ROLE
You are a brand strategist who writes voice guides that writers can actually apply.

COMPANY
[NAME], [WHAT IT DOES], for [AUDIENCE]. Personality words the founder likes: [3 WORDS].

TASK
Write a one-page brand voice guide.

SECTIONS
1. Voice in one sentence.
2. Three voice traits, each with: what it means, what it does not mean, and a do/don't example pair.
3. Tone shifts: how the voice changes for a launch, an outage apology, an onboarding email, and a support reply (one example sentence each).
4. Word list: 10 words we use, 10 we avoid, with replacements.
5. Formatting rules: sentence length, contractions, emoji, exclamation marks, capitalisation.
6. A before/after rewrite of one generic paragraph into our voice.

RULES
Concrete examples beat adjectives. Under 700 words.""")

add("job-description", "writing", "job description for a senior frontend engineer",
"""ROLE
You are a hiring manager who writes job descriptions that attract strong candidates and filter out poor fits.

ROLE BEING HIRED
Senior Frontend Engineer at [COMPANY], [TEAM SIZE] engineers, stack [STACK], [REMOTE POLICY], salary [RANGE].

TASK
Write the job description.

SECTIONS
1. Two-sentence pitch: what the team ships and why this role matters now.
2. What you will do in the first 90 days (4 concrete bullets).
3. What we need: 5 must-haves, each observable (not "passionate", not "rockstar").
4. Nice to have: at most 3.
5. What we offer: salary range, benefits, how we work.
6. The hiring process: steps, total time, and what each step tests.

RULES
- Gender-neutral wording; no years-of-experience gate unless essential.
- Under 450 words.
- Add a line encouraging applicants who meet most but not all requirements.""")

add("performance-review", "writing", "write a performance review for an underperforming employee",
"""ROLE
You are an experienced engineering manager writing a fair, specific performance review.

INPUT
I will give you notes on the person's work this period, including examples.

TASK
Write a review that is honest about underperformance and gives a clear path to improve.

STRUCTURE
1. Summary: overall rating [RATING] and the two most important points.
2. What went well: 2 specific examples with impact.
3. Where expectations were not met: 2 to 3 behaviours, each with a dated example, the impact on the team, and the expected standard.
4. Improvement plan: goals for the next 60 days, each measurable, with how and when we check progress.
5. Support I will provide.

RULES
- Describe behaviour and outcomes, never personality.
- No surprises: flag anything not discussed before so I can raise it first.
- Neutral, respectful tone. Under 500 words.""")

add("course-outline", "planning", "outline for an online course on excel for beginners",
"""ROLE
You are an instructional designer who builds short practical courses for adult learners.

COURSE
Excel for complete beginners who use it at work. 6 modules, about 20 minutes each, self-paced.

TASK
Write the course outline.

FOR EACH MODULE
- Title and one learning outcome that starts with a verb the learner can demonstrate.
- 3 to 4 lessons with one-line descriptions.
- A practice task using a realistic work file (sales list, expenses, schedule).
- A 3-question check with answers.

ALSO
- Prerequisites (none beyond opening Excel).
- A final project that uses skills from every module.
- Common beginner mistakes to address explicitly.

RULES
Order modules by what learners need first at work, not by menu order. Under 700 words.""")

add("study-plan", "planning", "study plan for an exam in 6 weeks",
"""ROLE
You are a study coach who builds plans based on spaced repetition and practice testing.

STUDENT
Exam: [EXAM] on [DATE]; topics [TOPIC LIST]; available study time [HOURS PER WEEKDAY] on weekdays and [HOURS] on weekends; weakest topics [WEAK].

TASK
Build a 6-week study plan.

INCLUDE
1. Week 1 diagnostic: a practice test to rank topics by weakness.
2. A weekly table: day | topic | method (active recall, practice questions, past papers) | minutes.
3. Spaced reviews of each topic at increasing intervals.
4. Full timed practice exams in weeks 4, 5 and 6.
5. The last 3 days: what to review and what to stop doing.
6. A rule for falling behind: what to cut first.

RULES
At most 25% of time on re-reading or notes; the rest is retrieval and practice. Under 450 words plus the table.""")

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exemplars.json")
with open(out, "w") as f:
    json.dump(S, f, indent=1, ensure_ascii=False)
print(f"wrote {len(S)} exemplars to {out}")
