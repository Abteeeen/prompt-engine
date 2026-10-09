**Best For**: Microcopy for buttons, onboarding flows, error messages, and product interfaces
**Effectiveness**: ⭐⭐⭐⭐⭐ (Critical for product UX)

---

## 🎯 TEMPLATE

```
ROLE: You are a senior UX writer and microcopy specialist who has crafted copy for top-tier SaaS products and mobile apps used by millions.
Your specialty: Creating interface copy that guides users, reduces friction, and reinforces brand voice in every interaction.

CONTEXT: I need UX copy for [PRODUCT_TYPE: web app/mobile app/dashboard] in the [INDUSTRY] space.
Our users are [USER_TYPE: beginners/power users/business consumers] who primarily need to [USER_GOAL].
Our brand voice is [VOICE: friendly/professional/playful/technical].
The copy is needed for: [SPECIFIC_ELEMENTS: buttons/forms/onboarding/errors].

TASK: Create UX copy for specific interface elements that is clear, actionable, and on-brand.

REQUIREMENTS:
- BUTTON COPY: Action-oriented, specific, scannable (2-4 words)
- FORM LABELS: Clear, scannable, hint text for complex fields
- ERROR MESSAGES: What happened + how to fix it, no blame language
- EMPTY STATES: Helpful guidance, clear next step, brand personality
- ONBOARDING: Progressive disclosure, value-first, skippable
- TOOLTIPS/HINTS: Contextual help without clutter
- CONFIRMATION MESSAGES: Clear outcome, clear next step
- NOTIFICATIONS: Relevant, timely, actionable
- LOADING/EMPTY STATES: Set expectations, reduce anxiety
- CTA COPY: Urgency without pressure, benefit-forward

CONSTRAINTS:
- NO "Submit" or "Click here" — be specific about the action
- NEVER blame users in errors ("You entered invalid data")
- NO all caps (except acronyms) — it's shouting
- NEVER use "simply" or "just" — it implies things should be easy
- No jargon unless your users are 100% technical
- Don't explain the UI — use the UI to guide
- Every word must earn its place — microcopy is micro for a reason

AUDIENCE: [USER_PERSONA] with [TECHNICAL_SAVVY: low/medium/high] who are [EMOTIONAL_STATE: frustrated/excited/confused/rushed]

OUTPUT FORMAT:
**COPY REQUEST: [ELEMENT_TYPE]**
Context: [Where this appears, what triggers it]
User goal: [What they're trying to do]
Brand tone: [How we want to sound]

**COPY OPTIONS** (3 variations)

Option 1: [Voice variation — straightforward/action-focused]
[Exact copy]

Option 2: [Voice variation — friendly/encouraging]
[Exact copy]

Option 3: [Voice variation — minimal/direct]
[Exact copy]

**RECOMMENDATION**: Option [#]
Rationale: [Why this works best]

**ALTERNATIVE STATES** (if applicable)
Loading state: [Copy]
Success state: [Copy]
Error state: [Copy]
Empty state: [Copy]

**ACCESSIBILITY NOTES**
[Screen reader considerations, character count, contrast]

SELF-CHECK BEFORE RESPONDING:
Rate your copy:
- Clarity (1-3): Is the action/next step obvious?
- Brevity (1-3): Is it as short as possible?
- Voice fit (1-3): Does it sound like the brand?
If total < 7 — cut words or clarify the action.
```

---

## 📝 QUICK FILL TEMPLATE

```
**Element**: [BUTTON/LABEL/ERROR/ONBOARDING/EMPTY_STATE]
**Product**: [APP_NAME]
**User**: [PERSONA]
**Context**: [WHERE_THIS_APPEARS]
**Action**: [WHAT_USER_DOES]
**Tone**: [VOICE_QUALITY]
**Current Copy**: [IF_EXISTING]
**Problem**: [WHATS_WRONG_WITH_CURRENT]
```

---

## 🎨 REAL EXAMPLES

**Example 1: Button Copy**
```
ELEMENT: Primary CTA on pricing page

❌ BAD:
"Submit"
"Click Here"
"Continue"

✅ GOOD:
"Start Free Trial"
"Upgrade to Pro — $29/month"
"Create Your First Project"

CONTEXT: User has reviewed pricing and is ready to convert.
USER GOAL: Get started with the product.

RECOMMENDED:
"Start My Free 14-Day Trial"
Why: Specific action (Start), personal (My), clear value (Free, 14-Day), clear outcome (Trial)

VARIANTS:
Mobile: "Start Free Trial" (shorter)
Loading: "Creating your account..."
Success: "Welcome! Let's set up your first project."
```

**Example 2: Error Message**
```
ELEMENT: Form validation error — email already exists

❌ BAD:
"Error: Invalid input"
"You entered an email that's already registered"
"Email exists"

✅ GOOD:
"This email already has an account. Sign in instead or use a different email."

STRUCTURE:
What happened: "This email already has an account"
How to fix: "Sign in instead or use a different email"
No blame: "Already has" vs. "You already used"

CTA OPTIONS:
• "Sign In" (links to login)
• "Use Different Email" (clears field, keeps cursor there)

ACCESSIBILITY:
Role: alert
Announced by screen readers immediately
```

**Example 3: Empty State**
```
ELEMENT: Dashboard with no data yet

CONTEXT: New user, first time seeing dashboard
USER GOAL: Understand what this space is for and how to populate it

HEADLINE: "Your dashboard is ready — let's add some data"
SUBTEXT: "Import your existing data or connect an integration to see insights here."

CTA PRIMARY: "Import Data"
CTA SECONDARY: "Connect Integration"

ILLUSTRATION: Friendly empty-state illustration showing sample dashboard

PROGRESSIVE DISCLOSURE:
Link: "Not ready yet? See a sample dashboard"
→ Opens preview mode with demo data

TONE CHECK: Helpful, not apologetic. Sets expectation that this is a starting point.
```

---

## 🔧 VARIATIONS

**Variation 1: Onboarding Flow**
```
Structure:
1. Welcome screen (value proposition, not feature list)
2. Quick win tutorial (complete one task immediately)
3. Progressive feature introduction (don't show everything at once)
4. Contextual tips (appear when relevant, dismissible)
5. Celebration moments (positive reinforcement)

Principles:
• Users can skip any step
• Show, don't tell (interactive over explanatory)
• One concept per screen
• Always clear next step
```

**Variation 2: Mobile App Copy**
```
Constraints: Smaller screens, touch interfaces, distracted users
Approach: Even shorter, larger touch targets, clearer hierarchy
Examples:
• Buttons: 2-3 words max
• Labels: Above fields, not inline
• Errors: Inline when possible, modals only for blocking issues
• Gestures: Explain on first use, not in documentation
```

**Variation 3: Technical/Developer Tools**
```
Audience: Developers, power users, technical decision-makers
Tone: Precise, efficient, no fluff
Considerations:
• Use correct technical terminology
• Error codes alongside friendly messages
• Link to documentation
• API references where relevant
• Terminal/command examples if applicable
```

---

## ✅ QUALITY CHECKLIST

- [ ] Button copy is specific about the action (not "Submit")
- [ ] Error messages explain what happened AND how to fix it
- [ ] No blame language in errors (avoid "you failed")
- [ ] No "simply" or "just" or "easily" (implies it should be effortless)
- [ ] Empty states guide toward next action
- [ ] Onboarding can be skipped or dismissed
- [ ] Copy is scannable (short, clear hierarchy)
- [ ] Voice matches brand guidelines
- [ ] Accessibility: Screen reader friendly, appropriate ARIA labels
- [ ] Character counts work in constrained spaces (mobile, small buttons)

---

## 💡 PRO TIPS

- **The "so what" test**: Every piece of copy should answer "so what?" for the user
- **Front-load meaning**: Most important words first (users scan, don't read)
- **Active voice**: "Save your changes" not "Your changes will be saved"
- **Positive framing**: "Keep your password safe" not "Don't forget your password"
- **One idea per element**: Button does one thing, label asks one thing
- **Test with real users**: Watch where they hesitate or get confused
- **Error message formula**: What happened + How to fix it + (Optional) Why it matters

---

## 📊 EFFECTIVENESS METRICS

| Metric | Good | Great | Exceptional |
|--------|------|-------|-------------|
| Task Completion Rate | 70% | 85% | 95%+ |
| Error Recovery | 50% | 75% | 90%+ |
| Time on Task | Baseline | -20% | -40% |
| Support Tickets | Baseline | -30% | -60% |
| User Satisfaction | 7/10 | 8.5/10 | 9.5/10 |

---

## 🔄 ITERATION WORKFLOW

1. **Audit current copy**: List all copy in user flows, identify pain points
2. **Draft improvements**: Rewrite using principles above
3. **Review**: Check against brand voice, accessibility, clarity
4. **Test with users**: Watch real people use the interface
5. **Measure**: Track task completion, error rates, support tickets
6. **Refine**: A/B test variations where volume permits
7. **Maintain**: Review copy quarterly or when features change

---

## 🔗 RELATED TEMPLATES

- Brand Voice Guide (for tone and style consistency)
- Content Writing (for longer-form product content)
- Product Management (for feature context)
