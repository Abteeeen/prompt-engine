# 📊 DATA ANALYSIS PROMPT TEMPLATE

**Domain**: Data Science & Analytics  
**Best For**: Analyzing datasets, generating insights, creating visualizations  
**Effectiveness**: ⭐⭐⭐⭐⭐ (Highest for insight generation)  

---

## 🎯 TEMPLATE

```
You are a senior data scientist with 10+ years analyzing [INDUSTRY] data.
Your specialty: [STATISTICAL_SKILL], [DISCOVERY_SKILL], and actionable insights.

TASK: Analyze [DATASET/DATA] and [SPECIFIC_ANALYSIS]

DATA DESCRIPTION:
- Source: [WHERE DATA COMES FROM]
- Size: [NUMBER OF ROWS/COLUMNS]
- Types: [DATA TYPES: categorical, numeric, time-series, etc]
- Time period: [IF APPLICABLE]
- Known issues: [ANY DATA QUALITY ISSUES]

YOUR ANALYSIS SHOULD:
1. [SPECIFIC ANALYSIS 1] - [WHY IT MATTERS]
2. [SPECIFIC ANALYSIS 2] - [WHY IT MATTERS]
3. [SPECIFIC ANALYSIS 3] - [WHY IT MATTERS]

AUDIENCE: [WHO WILL READ THIS]
- Expertise level: [CEO / Manager / Analyst / Technical]
- Decision they're making: [WHAT DECISION AWAITS]
- Format preference: [Markdown / Executive summary / Technical report]

CONSTRAINTS:
- Focus on actionable insights (not just descriptive stats)
- Use [LANGUAGE: Python/R/SQL]
- Include visualizations recommendations
- Highlight risk factors
- Quantify impact where possible

EXPECTED OUTPUT FORMAT:
# Analysis of [TOPIC]

## Executive Summary
- [Key finding 1]
- [Key finding 2]
- [Recommendation based on data]

## Detailed Findings
### [Finding 1]
- Metric: [What shows this]
- Significance: [Why it matters]
- Impact: [Quantified impact]

### [Finding 2]
...

## Recommendations
1. [Action based on data]
2. [Action based on data]

## Data Quality Notes
- Confident in findings: [HIGH/MEDIUM/LOW]
- Limitations: [List limitations]
```

---

## 📝 QUICK FILL TEMPLATE

```
You are a data scientist analyzing [INDUSTRY] data.

TASK: Analyze [DATA] for [WHAT YOU WANT TO KNOW]

DATA:
- [ROWS] rows, [COLUMNS] columns
- [TYPES AND TIMEFRAME]
- Issues: [IF ANY]

FIND:
1. [ANALYSIS TYPE 1]
2. [ANALYSIS TYPE 2]
3. [ANALYSIS TYPE 3]

AUDIENCE: [WHO READS THIS]

Format as:
- Key insights (top 3)
- Detailed findings
- Actionable recommendations
- Confidence level
```

---

## 🎨 REAL EXAMPLES

### Example 1: Customer Churn Analysis
```
You are a senior data analyst specializing in customer retention.

TASK: Analyze customer churn data to identify risk factors and predict at-risk customers

DATA DESCRIPTION:
- 50,000 customer records
- 3 years of transaction history
- Columns: customer_id, signup_date, churn_date, purchases, spend, support_tickets, feature_usage
- Churn rate: 15% (~7,500 customers)
- Time period: 2023-2026

YOUR ANALYSIS SHOULD:
1. Identify top 5 churn risk factors - quantify impact on each
2. Create customer risk segments (high/medium/low) - show % in each
3. Find patterns in churned vs retained customers
4. Recommend retention actions for each risk segment

AUDIENCE: VP of Product (business-focused, looking for actions)
- They need to justify retention budget spending
- They want to move customers from high→medium risk

CONSTRAINTS:
- Use Python (pandas/scikit-learn)
- Focus on actionable insights
- Include confidence intervals
- Highlight quick wins (easy to implement actions)
- Quantify expected impact of recommendations

EXPECTED OUTPUT:
# Churn Analysis Report

## Executive Summary
- Churn rate: [CURRENT]
- Top 3 risk factors: [FACTOR], [FACTOR], [FACTOR]
- Recommended action: [ACTION] 
- Expected impact: Reduce churn by [X]% = [REVENUE]

## Risk Segments
- High Risk: [X]% of customer base, churn rate [Y]%
- Medium Risk: [X]% of customer base, churn rate [Y]%
- Low Risk: [X]% of customer base, churn rate [Y]%

## Top 5 Churn Drivers
1. [Factor]: [Impact description] - Customers with this are [X]% more likely to churn
2. [Factor]: [Impact description]
...

## Recommendations
1. [Action for High Risk] - Expected impact: [X]% reduction
2. [Action for Medium Risk] - Expected impact: [X]% reduction
...
```

### Example 2: Product Performance Analysis
```
You are a product analytics expert.

TASK: Analyze feature adoption and engagement metrics

DATA:
- 100K daily active users
- 6 months usage data
- Events: feature_view, feature_use, feature_abandon, user_profile

FIND:
1. Which features have highest adoption? Lowest?
2. What predicts if a user will adopt a new feature?
3. How does feature adoption correlate with user lifetime value?

AUDIENCE: Product Manager (wants to prioritize roadmap)

Show: Feature adoption metrics, user segments, recommendations on what to invest in
```

---

## 🔧 ANALYSIS TYPES BY DOMAIN

### E-Commerce
- Customer segmentation (RFM)
- Product affinity analysis
- Price elasticity
- Cart abandonment drivers
- Lifetime value prediction

### SaaS
- Churn prediction
- Feature adoption rates
- Growth metrics cohort analysis
- Free→paid conversion funnels
- User engagement scoring

### Marketing
- Campaign performance analysis
- Channel attribution
- Customer acquisition cost by channel
- Lifetime value by cohort
- Engagement scoring

### Healthcare
- Patient outcome patterns
- Treatment efficacy analysis
- Population health risks
- Readmission predictors
- Resource utilization

---

## 🎯 KEY ELEMENTS TO INCLUDE

**Always Include**:
- Confidence level (HIGH/MEDIUM/LOW)
- Data quality notes
- Methodological limitations
- Quantified impact (not just "important")
- Actionable recommendations (not just insights)

**Visualization Recommendations**:
- For trends: Time series chart
- For comparisons: Bar chart
- For distribution: Histogram or box plot
- For relationships: Scatter plot
- For segments: Pie or stacked bar

---

## 🚀 ADVANCED VARIATIONS

### Variation 1: Predictive Analysis
```
TASK: Predict [OUTCOME] for [TIMEFRAME]

MODEL REQUIREMENTS:
- Predict: [TARGET VARIABLE]
- For: [CUSTOMER/PRODUCT/MARKET]
- Timeframe: [PERIOD]
- Accuracy target: [X]%

Provide:
1. Model accuracy on test set
2. Most important features
3. Confidence intervals
4. Business recommendations
```

### Variation 2: Anomaly Detection
```
TASK: Identify unusual patterns in [DATA]

WHAT'S NORMAL:
- [METRIC]: [TYPICAL RANGE]
- [METRIC]: [TYPICAL RANGE]

IF SOMETHING'S UNUSUAL, FLAG:
- [TYPE OF ANOMALY] - Severity HIGH/MEDIUM/LOW
- Business impact: [WHAT COULD BE WRONG]
- Recommended action: [WHAT TO INVESTIGATE]
```

### Variation 3: Cohort Analysis
```
TASK: Compare [GROUPS] across [DIMENSION]

GROUPS TO COMPARE:
- Group 1: [CRITERIA]
- Group 2: [CRITERIA]
- Group 3: [CRITERIA]

COMPARE ACROSS:
- [METRIC 1]
- [METRIC 2]
- [METRIC 3]

Show: Differences, trends over time, significance
```

---

## 💡 PRO TIPS

1. **Be Clear on Your Question**
   - "What's driving churn?" (vague)
   - "What % of customers churn due to lack of feature X?" (specific)

2. **Specify Audience**
   - CEO wants: Business impact, 1-2 recommendations
   - Analyst wants: Detailed findings, methodology, caveats
   - Different reports for same data!

3. **Ask for Confidence Levels**
   - "Include confidence intervals on all metrics"
   - "Rate your confidence: HIGH/MEDIUM/LOW"
   - Prevents over-confident bad analysis

4. **Quantify Everything**
   - Not "users don't like feature X"
   - But "Feature X adoption is 20% vs 80% for similar feature"

5. **Include Limitations**
   - Always ask "What could be wrong with this analysis?"
   - Data quality issues affect conclusion reliability

6. **Ask for Recommendations**
   - Analysis without actions = useless
   - Always ask "Based on this, what should we do?"

---

## 📊 EFFECTIVENESS METRICS

**Insight Quality**: 90%+ actionable insights  
**Accuracy**: 85%+ when analysis is data-driven  
**Usability**: 95% of insights inform decisions  

**Best When**:
- Clear business question stated
- Target audience specified
- Data quality documented
- Timeframe clear
- "So what?" (business impact) addressed

---

## 🔄 ITERATION WORKFLOW

1. **Identify** your analytical question
2. **Describe** your data and audience
3. **Generate** initial analysis
4. **Validate** findings (do they make sense?)
5. **Score** using quality framework
6. **Refine** based on gaps
7. **Add** deeper analysis if needed
8. **Document** limitations and confidence

---

**Domain**: Data Science / Analytics  
**Mastery Level**: Advanced (requires statistics knowledge)  
**Time to Craft Prompt**: 10-15 minutes  
**Quality Outcome**: Executive-ready insights  

