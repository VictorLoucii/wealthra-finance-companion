# Core Logic & Behavior Rules
- Do not change application logic unless explicitly asked.
- The Golden Rule: Ensure that any changes made to shared components or hooks follow the principle of Backward Compatibility by using optional props and default values, ensuring we don't break existing logic in other parts of the app.
- Do not guess or assume missing information. Only reason using the files and context that are explicitly provided or requested.
- Follow the existing project structure and coding style, and do not refactor unrelated code.
- If an issue cannot be confirmed from the provided files, state that clearly.
- You can add logs using __DEV__ for debugging.
- Tell me exactly at what line and which file to modify.
