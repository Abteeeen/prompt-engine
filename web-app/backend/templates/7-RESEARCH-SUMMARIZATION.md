# 📚 RESEARCH SUMMARIZATION PROMPT TEMPLATE

**Domain**: Academic & Professional  
**Best For**: Summarizing papers, reports, articles  
**Effectiveness**: ⭐⭐⭐⭐⭐ (Highest for compression)  

---

## 🎯 TEMPLATE

```
You are an expert research analyst specializing in [FIELD].
Your specialty: Making complex research accessible without losing accuracy.

RESEARCH MATERIAL:
- Type: [ACADEMIC PAPER / REPORT / ARTICLE / WHITEPAPER]
- Length: [PAGES / WORD COUNT]
- Topic: [GENERAL TOPIC]
- Difficulty: [HIGHLY TECHNICAL / MODERATELY TECHNICAL / ACCESSIBLE]

SUMMARY SHOULD:
1. Identify main research question/hypothesis
2. Explain methodology in simple terms
3. Highlight key findings with numbers
4. Show implications/significance
5. Note limitations or caveats
6. Suggest next steps or related questions

TARGET AUDIENCE:
- Role: [WHO WILL READ: Researcher / Manager / Student / Investor]
- Expertise: [THEIR BACKGROUND]
- Use case: [WHY THEY NEED THIS: Quick overview / Decision-making / Teaching / Research]

SUMMARY LENGTH:
- Brief: [2-3 paragraphs, 200-300 words]
- Standard: [1-2 pages, 500-800 words]
- Detailed: [3-5 pages, 1,500-2,000 words]

FORMAT:
1. **Title & Citation**: [Full reference]
2. **Research Question**: [What were they trying to answer?]
3. **Methodology**: [How did they get their answer?]
4. **Key Findings**: [Top 3-5 results with metrics]
5. **Significance**: [Why does this matter?]
6. **Limitations**: [What could be wrong with this?]
7. **Implications**: [If this is true, then what?]
8. **Questions Raised**: [What should we study next?]

TONE:
- Accurate (don't oversimplify to the point of wrong)
- Accessible (clear language for target audience)
- Critical (note strengths and weaknesses)
- Fair (don't cherry-pick - show whole picture)

INCLUDE:
- Key statistics/numbers
- Direct quotes [IF IMPORTANT]
- Visual description [IF APPLICABLE]
- Confidence level in findings
- Relevance to current/related work

AVOID:
- Oversimplification to the point of inaccuracy
- Author's specific jargon without translation
- Missing important caveats
- Cherry-picking only positive results
```

---

## 📝 QUICK FILL TEMPLATE

```
You are a research expert in [FIELD].

SUMMARIZE: [PAPER/REPORT TITLE]

FOR: [WHO IS READING]

WANT: [BRIEF / STANDARD / DETAILED]

FORMAT:
- Research question: [WHAT THEY STUDIED]
- How they studied it: [METHODS]
- What they found: [KEY RESULTS]
- Why it matters: [SIGNIFICANCE]
- What's uncertain: [LIMITATIONS]
```

---

## 🎨 REAL EXAMPLES

### Example 1: Academic Paper Summary
```
You are an AI research analyst.

SUMMARIZE: "Attention Is All You Need" (Vaswani et al., 2017)

FOR: Software engineer (understands code but not deep learning)

WANT: Standard (500-800 words)

REQUESTED STRUCTURE:
1. What problem were they solving?
   - Explain RNNs/sequence models in simple terms
   - Show their limitation

2. What's their solution? (The transformer)
   - How attention works (use analogy)
   - Why it's better than RNNs

3. Results
   - Tested on translation, other tasks
   - How much better? (percentage improvements)
   - Compare to prior state-of-art

4. Why it matters?
   - Changed AI research
   - Enabled GPT, BERT, transformers everywhere
   - Still used in basically all LLMs today

5. What's the catch?
   - Requires more data
   - More compute
   - How well does it generalize?

6. What we still don't know?
   - Why is it so powerful?
   - How scalable can it get?
   - What comes after transformers?

TONE: Explain like you're teaching a smart friend, not a researcher
INCLUDE: 2-3 key findings with quantification
CITE: Original paper [with link if possible]
```

### Example 2: Industry Report Summary
```
You are a market analyst.

SUMMARIZE: McKinsey AI Report [2024]

FOR: Startup founder (wants business insights)

WANT: Detailed (executive brief, 1,500 words)

REQUESTED STRUCTURE:
1. What's the report about?
   - Overall theme
   - Scope (which countries, industries)
   - When was this published

2. Market size + growth
   - AI market size (current + projected)
   - Growth rate
   - Which segments growing fastest

3. Key findings
   - Top 5 findings with supporting data
   - Surprising insights
   - Contradictions to prior beliefs

4. Winners vs losers
   - Who's winning: Companies, countries, industries
   - Who's struggling or disrupted
   - Why?

5. Predictions
   - What will change by [DATE]
   - Investment implications
   - Risk factors

6. Limitations
   - Is this data representative?
   - Any biases in the analysis?
   - How confident are they?

TONE: Actionable for business decision-making
INCLUDE: Specific percentages, forecasts, company examples
CITE: Original report with date/author
ADD: Your assessment of accuracy/relevance
```

### Example 3: Scientific Paper for Public
```
You are a science communicator.

SUMMARIZE: Study: "Effects of Sleep on Memory Consolidation"

FOR: General public (no scientific background)

WANT: Brief (2-3 paragraphs, 250 words)

TRANSLATE:
- Technical terms → plain English
- Methodology → what they actually did
- Results → what they found
- Significance → why you should care

INCLUDE: Relatable examples
TELL: How does this change what we should do?
TONE: Educational but engrossing
```

---

## 🔧 SUMMARY TYPES

### 1-Sentence Summary
```
[Research] found that [KEY FINDING], suggesting [IMPLICATION].
```

### Abstract-Style Summary
```
{Background] [Methods] [Results] [Conclusion]
(150-300 words)
```

### Narrative Summary
```
Story-style explanation of research journey
- What was studied
- How they did it
- What happened
- Why it matters
(500-800 words)
```

### Data Summary
```
Key metrics only
- Main finding: [METRIC]
- Result: [CHANGE PERCENTAGE]
- Confidence: [LEVEL]
- Implication: [WHAT IF TRUE]
```

---

## 🚀 ADVANCED VARIATIONS

### Variation 1: Comparative Summary
```
COMPARE two research papers/reports:

Paper A: [TITLE]
Paper B: [TITLE]

Show:
- Their research questions (same/different?)
- Their methodologies (different approaches?)
- Their findings (agree/contradict?)
- Implications of differences

CONCLUSION: Which is more credible? Why?
```

### Variation 2: Critical Analysis
```
SUMMARIZE with critical lens:

Research: [TITLE]

Question:
- Is their methodology sound?
- Could there be confounding variables?
- Are their conclusions supported by data?
- What are alternative explanations?

Rate credibility:
- Data quality: [1-10]
- Methodology: [1-10]
- Relevance: [1-10]
- Overall: [1-10]
```

### Variation 3: Trend Summary
```
FIND trends across multiple papers/reports:

Topic: [GENERAL AREA]
Papers: [5-10 papers on this topic]

Show:
- Common findings (what do they agree on?)
- Areas of disagreement (what's debated?)
- Evolution over time (how has thinking changed?)
- Future directions (where's research heading?)

CONCLUSION: State of knowledge on this topic
```

---

## 💡 PRO TIPS

1. **Keep Original Meaning**
   - Don't simplify to the point of wrong
   - "Conference call" ≠ "meeting" if detail matters
   - Use analogies but note where they break

2. **Maintain Proportionality**
   - If paper spends 30% on methods, your summary should too
   - Give space to main findings
   - Don't blow up minor points

3. **Flag Uncertainty**
   - "The researchers suggest..." not "This proves..."
   - Note confidence intervals
   - Mention what they don't know

4. **Question Everything**
   - Ask: Could this be wrong?
   - Consider: What wasn't studied?
   - Check: Who funded this research?

5. **Use Original Language**
   - Quote important phrases
   - Don't paraphrase key finding
   - Preserves accuracy

6. **Show Your Work**
   - When you simplify, show the translation
   - "In other words..." helps readers follow
   - Quote then explain format works well

---

## 📊 EFFECTIVENESS METRICS

**Comprehension**: Reader understands without reading original  
**Accuracy**: 95%+ of key findings captured correctly  
**Usefulness**: 80%+ of readers say it helped them decide  

**Best When**:
- Source material is complex/long
- Time constraints exist
- Multiple stakeholders need quick overview
- Decision-making awaits

---

## 🔄 ITERATION WORKFLOW

1. **Read** full source material
2. **Extract** key findings
3. **Draft** summary (audience-appropriate level)
4. **Verify** accuracy against original
5. **Simplify** where possible without losing meaning
6. **Add** context (why should reader care)
7. **Review** for completeness and fairness

---

**Domain**: Research / Analysis  
**Mastery Level**: Advanced  
**Time to Craft Prompt**: 10-15 minutes  
**Quality Outcome**: Accurate, accessible summaries  

