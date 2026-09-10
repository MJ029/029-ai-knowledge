If you're starting from zero and want to actually understand [LLMs](#/topic/llms) instead of just using them, here's the order that tends to work.

## 1. Use one, a lot, first

Before theory, build intuition. Prompt one daily. Notice where it's strong (summarizing, rephrasing, boilerplate code) and where it breaks (precise math, long-range consistency, anything outside its training).

## 2. Learn the shape of a transformer

You don't need the math on day one. You need the shape: tokens in, attention lets every token look at every other token, predict the next token, repeat. That's most of it.

## 3. Learn what "fine-tuning" and "RLHF" actually change

Pretraining gives a model raw language ability. Alignment steps shape *how* it uses that ability — tone, refusals, following instructions. Different problem, different fix.

## 4. Then go build something

Nothing teaches faster than shipping a small project — a RAG bot over your own notes, a tool-calling [Agent](#/topic/agents), a fine-tune on a narrow task. Theory sticks once you've debugged it.

## Related topics

[LLMs](#/topic/llms) · [Generative AI](#/topic/generative-ai)
