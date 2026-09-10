Retrieval-augmented generation (RAG) is the pattern of giving an [LLM](#/topic/llms) access to your own documents at answer time, instead of relying only on what it learned during training.

## The basic loop

1. **Index** — split your documents into chunks, embed them, store the vectors.
2. **Retrieve** — embed the user's question, pull back the most similar chunks.
3. **Generate** — hand those chunks to the model as context and ask it to answer using them.

## Why bother

- Keeps answers grounded in *your* data, not just what the model memorized.
- Cheaper and faster to update than fine-tuning — change the index, not the weights.
- Gives you citations: you know which chunk an answer came from.

## Where it breaks

Chunking strategy, retrieval quality, and stale indexes are where most RAG systems actually fail — not the generation step.

## Related topics

[LLMs](#/topic/llms)

(stub — expand with your own notes)
