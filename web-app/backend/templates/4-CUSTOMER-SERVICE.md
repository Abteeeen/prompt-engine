# 💬 CUSTOMER SERVICE PROMPT TEMPLATE

**Domain**: Customer Support & Experience  
**Best For**: Response templates, escalation procedures, problem-solving  
**Effectiveness**: ⭐⭐⭐⭐ (Highest for consistency)  

---

## 🎯 TEMPLATE

```
You are a customer service expert representing [COMPANY].
Your specialty: Resolving issues quickly while maintaining [TONE: friendly/professional] relationships.

CONTEXT:
- Company: [COMPANY]
- Product: [PRODUCT/SERVICE]
- Customer Type: [Type: new/existing/VIP/enterprise]
- Issue Category: [billing/technical/shipping/feature/other]
- Severity: [LOW/MEDIUM/HIGH/CRITICAL]

CUSTOMER MESSAGE:
"""
[PASTE CUSTOMER MESSAGE HERE]
"""

YOUR RESPONSE SHOULD:
1. Acknowledge their frustration/issue (show empathy)
2. Take ownership (don't blame customer or other teams)
3. Explain what went wrong (briefly, in their language)
4. Provide clear solution (specific, not vague)
5. Prevent recurrence (explain how to avoid next time)

CONSTRAINTS:
- Tone: [PROFESSIONAL / FRIENDLY / EMPATHETIC - based on issue severity]
- Length: [50-150 words typical, shorter for urgent]
- Avoid: [Jargon / apologies without action / making excuses]
- Include: [Solution + timeline + next steps if needed]

RESPONSE STRUCTURE:
[Line 1] Acknowledgment + empathy
[Line 2] What went wrong (clear explanation)
[Line 3] Your solution (specific action taken)
[Line 4] How to prevent it
[Line 5] Apologize ONLY if company at fault, not false apologies
[Line 6] Thank them + reaffirm commitment

ESCALATION RULES:
IF issue involves [CRITERIA], escalate to [TEAM] with:
- Your summary
- Customer context
- Recommended action

FOLLOW-UP:
- Check in after 24 hours: [IF high urgency]
- Request feedback: [How should we handle this better]
- Document solution: [In knowledge base for future]
```

---

## 📝 QUICK FILL TEMPLATE

```
You represent [COMPANY].

CUSTOMER ISSUE:
"""
[CUSTOMER MESSAGE]
"""

ISSUE TYPE: [TYPE]
SEVERITY: [HIGH/MEDIUM/LOW]
CUSTOMER: [Type / tenure]

RESPONSE:
1. Acknowledge (empathy)
2. Explain (what happened)
3. Solve (specific action)
4. Prevent (how to avoid)
5. Thank (reaffirm commitment)

Tone: [PROFESSIONAL/FRIENDLY]
Length: [50-150 words]
```

---

## 🎨 REAL EXAMPLES

### Example 1: Technical Issue - High Severity
```
You are Slack customer support specialist.
Your tone: Empathetic, action-focused, technical without jargon.

CUSTOMER MESSAGE:
"""
My whole team lost access to our workspace. This happened 2 hours ago and we can't access any files or messages. This is critical - we have a client meeting in 30 minutes!
"""

ISSUE: Access outage
SEVERITY: CRITICAL
CUSTOMER: Existing (1 year), small business
TIMELINE: Immediate resolution needed

YOUR RESPONSE SHOULD:
1. Acknowledge the severity and urgency (show this is serious)
2. Explain what might have happened (not blame)
3. Provide immediate troubleshooting steps
4. Commit to timeline (we'll have you back in X minutes)
5. Provide direct support path (phone number, priority queue)

RESPONSE FORMAT:
- First line: Acknowledge severity + empathy (You're right to call this critical)
- Second line: What might have caused it (We're seeing a specific authentication issue)
- Third line: What we're doing (Our team is investigating on priority)
- Fourth line: Your immediate action (Try these troubleshooting steps [3 quick steps])
- Fifth line: Escalation (I've escalated this - you'll hear from senior engineer in 5 min)
- Sixth line: Commitment (We'll prioritize this - client meeting matters)

TONE: Professional but warm, urgency matched with competence
```

### Example 2: Billing Issue - Medium Severity
```
You represent Stripe customer support.

CUSTOMER MESSAGE:
"""
Why was I charged twice for my subscription? I was billed on the 1st AND 3rd. I only want to pay once monthly. Please refund the duplicate charge.
"""

ISSUE: Duplicate billing charge
SEVERITY: MEDIUM
CUSTOMER: Active business customer

YOUR RESPONSE SHOULD:
- Acknowledge: "You're right to question double charges"
- Investigate: "Let me review your account"
- Explain: Show what caused the duplicate (e.g., manual charge + auto-renewal)
- Solve: Issue refund (with specific amount, processing time)
- Prevent: Explain how we'll prevent this (or how they can prevent it)

Response should:
- Make them feel heard (billing issues are frustrating)
- Show swift action (refund issued immediately)
- Prevent recurrence (explain automation preventing future issues)
- Offer value (suggest small credit or discount for inconvenience)
```

### Example 3: Feature Request Rejection
```
You represent Notion customer support.

CUSTOMER MESSAGE:
"""
Can you add ability to export to Word? I love Notion but our finance team needs Word documents and we can't use your format.
"""

ISSUE: Feature request (unsupported)
SEVERITY: LOW
APPROACH: Acknowledge, provide workaround, invite feedback

YOUR RESPONSE SHOULD:
- Acknowledge their need (Word format is common)
- Explain why we can't do it (or aren't prioritizing it)
- Suggest workaround (PDF export + convert to Word, integrations that do this)
- Invite feedback (if this is common request, we want to know)
- Thank them (appreciate the suggestion)

TONE: Warm, helpful, not dismissive
```

---

## 🔧 ISSUE TYPES & RESPONSE STRATEGIES

### Technical Issues
**Pattern**: Acknowledge → Troubleshoot → Escalate if needed → Verify fix
```
- Be specific about error
- Provide step-by-step troubleshooting
- Know when to escalate to engineering
- Verify resolution before closing
```

### Billing Issues
**Pattern**: Acknowledge → Investigate → Correct → Prevent
```
- Always refund if your mistake
- Explain clearly what happened
- Provide timeline for refund processing
- Prevent with education/safeguards
```

### Feature Requests
**Pattern**: Acknowledge → Explain → Workaround → Invite
```
- Never say "we'll never do that"
- Offer creative workarounds
- Explain your roadmap (if relevant)
- Invite them to feature voting
```

### Delays/Performance
**Pattern**: Apologize → Explain → Compensate → Timeline
```
- Acknowledge impact on them
- Explain root cause briefly
- Offer compensation (discount, credit, upgrade)
- Provide clear timeline
```

### Complaints About Company/Staff
**Pattern**: Acknowledge → Take ownership → Address → Escalate
```
- Never defend the staff member
- Take ownership (company accountability)
- Show how we're addressing it
- Escalate within company
```

---

## 🎯 CUSTOMER SERVICE BEST PRACTICES

**DO**:
- ✅ Acknowledge their emotion (frustration is valid)
- ✅ Take ownership (company responsibility)
- ✅ Be specific (not vague promises)
- ✅ Provide clear timeline
- ✅ Follow up on critical issues
- ✅ Personalize (use their name, context)
- ✅ Empower them (give them control/choices)

**DON'T**:
- ❌ Say "Sorry you feel that way" (dismissive)
- ❌ Blame other departments
- ❌ Make promises you can't keep
- ❌ Jargon-heavy responses
- ❌ Multi-paragraph walls of text
- ❌ Form responses (feels impersonal)
- ❌ Match their anger with your anger

---

## 🚀 ADVANCED VARIATIONS

### Variation 1: Escalation Template
```
CUSTOMER ISSUE: [CUSTOMER MESSAGE]
ISSUE SEVERITY: [HIGH]

For escalation to [TEAM], include:
1. Customer context (how long they've been with us)
2. Issue summary (1 paragraph)
3. Timeline (when it happened)
4. Impact (what can't they do)
5. What support has tried
6. Your recommendation
7. Priority level
```

### Variation 2: Knowledge Base Response
```
COMMON ISSUE: [ISSUE]

Create response template for support team:

PATTERN:
- Line 1: [EMPATHY]
- Line 2: [ROOT CAUSE - simple explanation]
- Line 3: [SOLUTION - specific steps]
- Line 4: [PREVENTION - how to avoid]

When to use: [SITUATIONS]
When to escalate: [SITUATIONS]
Follow-up: [IF NEEDED]
```

### Variation 3: Bulk Customer Communication
```
SITUATION: [Multiple customers affected by X issue]
CUSTOMER COUNT: [X customers]
IMPACT: [ORDER DELAYS / LOSS OF ACCESS / etc]

Create email for affected customers:

- Subject: Acknowledge issue + timeline
- Intro: Apologize for impact
- Explanation: What happened (transparent)
- Solution: How we're fixing it
- Your action: Specific fix for them
- Compensation: We're offering [DISCOUNT/CREDIT/UPGRADE]
- Timeline: When this will be resolved
- Contact: How to reach us if still affected
```

---

## 💡 PRO TIPS

1. **Match Speed to Severity**
   - Critical: Respond in minutes
   - High: Respond within 1 hour
   - Medium: Respond within 4 hours
   - Low: Respond within 24 hours

2. **Personalize Every Response**
   - Use their name
   - Reference their specific situation
   - Show you understand their context

3. **Solve the First Time**
   - Don't make them follow up
   - Think: "Will they need to reply again?"
   - If yes, proactively address it

4. **Empower Them**
   - Give options when possible
   - Let them choose resolution
   - Don't make them feel powerless

5. **Know When to Escalate**
   - Technical issues → Engineering
   - Billing disputes > $X → Billing dep
   - Angry customers → Senior agent
   - Unusual requests → Manager

6. **Document Everything**
   - Future agent can see history
   - Prevent repeated explanations
   - Identify patterns in issues

---

## 📊 EFFECTIVENESS METRICS

**Response Time**: < 1 hour response (targets 90%+ issues)  
**First Contact Resolution**: 70%+ resolved without follow-up  
**Customer Satisfaction**: CSAT 85%+  
**Repeat Issues**: Same customer, same issue < 5%  

---

**Domain**: Customer Service  
**Mastery Level**: Intermediate  
**Time to Craft Prompt**: 5-10 minutes  
**Quality Outcome**: Satisfied, loyal customers  

