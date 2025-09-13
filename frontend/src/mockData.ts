// Mock data for the Chat UI template
// Replace these with real API calls when integrating with backend

import type { Topic, Chat, Message, RelevantChat, PinnedContext } from './types';

export const topics: Topic[] = [
  { id: 't1', name: 'Regression', color: '#5b9bd5' },
  { id: 't2', name: 'Microbiome', color: '#70ad47' },
  { id: 't3', name: 'Networking', color: '#ed7d31' },
  { id: 't4', name: 'Machine Learning', color: '#a5a5a5' },
  { id: 't5', name: 'Statistics', color: '#ffc000' },
];

export const chats: Chat[] = [
  { 
    id: 'c1', 
    title: 'OLS assumptions', 
    last: 'Let\'s list them…', 
    updatedAt: '10:24', 
    topicId: 't1', 
    starred: true 
  },
  { 
    id: 'c2', 
    title: 'Skew-normal priors', 
    last: 'Paper notes…', 
    updatedAt: 'Yesterday', 
    topicId: 't2', 
    starred: false 
  },
  { 
    id: 'c3', 
    title: 'TCP vs UDP', 
    last: 'Throughput tradeoffs', 
    updatedAt: 'Tue', 
    topicId: 't3', 
    starred: true 
  },
  { 
    id: 'c4', 
    title: 'Neural Networks', 
    last: 'Backpropagation explanation', 
    updatedAt: 'Mon', 
    topicId: 't4', 
    starred: false 
  },
  { 
    id: 'c5', 
    title: 'Bayesian Inference', 
    last: 'Prior vs posterior', 
    updatedAt: 'Last week', 
    topicId: 't5', 
    starred: false 
  },
];

export const messages: Message[] = [
  { 
    id: 'm1', 
    role: 'assistant', 
    text: '**Hi!** How can I help you today?' 
  },
  { 
    id: 'm2', 
    role: 'user', 
    text: 'Can you summarize the OLS assumptions for me?' 
  },
  { 
    id: 'm3', 
    role: 'assistant', 
    text: `The **Ordinary Least Squares (OLS)** assumptions are:

1. **Linearity**: The relationship between X and Y is linear
2. **Independence**: Observations are independent of each other
3. **Homoscedasticity**: Constant variance of errors
4. **Normality**: Errors are normally distributed (for inference)
5. **No multicollinearity**: Independent variables are not highly correlated

\`\`\`python
# Example diagnostic checks
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan

# Check homoscedasticity
bp_stat, p_value, _, _ = het_breuschpagan(residuals, X)
\`\`\`

These assumptions ensure that OLS estimators are BLUE (Best Linear Unbiased Estimators).` 
  },
  { 
    id: 'm4', 
    role: 'user', 
    text: 'What about robust standard errors?' 
  },
  { 
    id: 'm5', 
    role: 'assistant', 
    text: `**Robust standard errors** (Huber-White standard errors) relax the homoscedasticity assumption:

- They provide consistent estimates even with heteroscedasticity
- Use when you suspect non-constant variance
- Available in most statistical packages

\`\`\`python
# In statsmodels
model = sm.OLS(y, X).fit()
robust_results = model.get_robustcov_results(cov_type='HC3')
\`\`\`

This is often a good default choice for real-world data!` 
  },
];

export const suggestedTopics: Topic[] = [
  { id: 't1', name: 'Regression', color: '#5b9bd5' },
  { id: 't2', name: 'Microbiome', color: '#70ad47' },
  { id: 't3', name: 'Networking', color: '#ed7d31' },
];

export const relevantChats: RelevantChat[] = [
  { 
    chatId: 'c2', 
    title: 'Skew-normal priors', 
    snippet: 'Zero-inflation notes and Bayesian approach...' 
  },
  { 
    chatId: 'c4', 
    title: 'Neural Networks', 
    snippet: 'Backpropagation and gradient descent optimization...' 
  },
  { 
    chatId: 'c5', 
    title: 'Bayesian Inference', 
    snippet: 'MCMC methods and prior selection...' 
  },
];

export const pinnedContext: PinnedContext[] = [
  { id: 'p1', label: 'OLS assumptions summary' },
  { id: 'p2', label: 'Diagnostic checks list' },
  { id: 'p3', label: 'Robust standard errors' },
  { id: 'p4', label: 'Regression diagnostics' },
];
