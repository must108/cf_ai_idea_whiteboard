# Prompts Used

1. Initial prompt for understanding requirements on a deeper level
   * "[PASTED REQUIREMENTS] give me a short refresher on these topics"
2.  Follow-up questions
       * "Help me understand how Vectorize works with Cloudflare workers"
3.  Suggesting idea and asking about preliminary architecture
       * "Is a whiteboarding application with sticky notes, using pages as the frontend, whiteboarding rooms as the Durable Object, Vectorized memory, and AI summarization viable, or are there better architectural choices?"
4. Generated code snippets of Durable Objects/Workflow
      * "Give me some small snippets of code to see how durable objects/workflows work"
5. 3 debugging queries to find a bug that occurred due to using regular WebSockets and Cloudflare Websockets
6. Asked for model name strings to input into worker code
7. Generated system prompt for summarization, and max tokens and temperatures values.
8. Fixed an error in listNotes() through AI debugging