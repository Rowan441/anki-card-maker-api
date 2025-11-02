# Todo / Ideas:

- Decide on how to persist data
- New auth provider for anonymous users
- tts and translation endpoint need params for input and output language
- Romanization / transliteration endpoint
- Support multiple images on notes
- Option to record own audio

Based on my comprehensive analysis of your Anki Card Maker API project, here are my refactoring suggestions organized by priority:
🔴 Critical Issues (Address First)
1. Break Up WordListTable Component (686 lines)
Location: client/src/components/WordListTable.tsx This component is doing too much. Split into:
useNoteTable() custom hook - state management & CRUD operations
NoteTableRow component - individual row rendering
NoteTableHeader component - column headers with autofill
NewNoteRow component - add new note form
🟡 High Priority
5. Add Tests (Currently None Exist)
Backend: Add RSpec for Rails
Frontend: Add Jest + React Testing Library
Start with auth and CRUD operations
6. Fix N+1 Query Issues
Location: api/app/controllers/notes_controller.rb
# Current
notes = deck&.notes

# Better
notes = deck&.notes.includes(:audio_attachment, :image_attachment)
7. Extract Duplicate Controller Logic
All controllers repeat this pattern:
deck = @current_user.decks.find_by(id: params[:deck_id])
if deck
  # ...
else
  render json: { error: 'Deck not found' }, status: :not_found
end
Fix: Use before_action filters and find_by! with rescue_from
8. Clean Up State Management
Files have dual state (audioFile + audio_url). Create a useMediaFile hook to:
Encapsulate File/URL logic
Auto-cleanup object URLs (prevent memory leaks)
Single source of truth
🟢 Medium Priority
9. Add Client-Side Validation
No length limits on text fields
No file size checks before upload
Fix: Add React Hook Form + Zod
10. Remove Commented Code
Locations: WordListTable.tsx:99-126, Note.ts:5-17 Git already tracks history—delete dead code.
11. Optimize Export Performance
Location: client/src/components/ExportModal.tsx Currently downloads sequentially:
// Current - SLOW
for (const note of notes) {
  const response = await fetch(note.audio_url);
  // ...
}

// Better - PARALLEL
await Promise.all(notes.map(async note => {
  const response = await fetch(note.audio_url);
  // ...
}));
12. Track TODOs Properly
Found 8+ TODO comments scattered in code. Move to a centralized tracking system (GitHub Issues or docs/todo.md).
13. Add API Caching
TTS and translation calls cost money. Cache results to avoid repeated API calls for same text.
⚪ Nice to Have
14. Add API Versioning
Prefix routes with /api/v1 for future-proofing
15. Improve CORS Configuration
Location: api/config/initializers/cors.rb:12 Current regex /https:\/\/.*\.app\.github\.dev$/ is too permissive
16. Consistent Naming Conventions
Backend: snake_case
Frontend: Mix of both
Fix: Transform at API boundary (use camelCase in frontend, snake_case in backend)
17. Add Database Indexes
add_index :sessions, :last_used_at
add_index :decks, [:user_id, :created_at]
📊 Overall Assessment
Code Quality: 6.5/10 Strengths:
Modern tech stack (Rails 8, React 19, TypeScript)
Good separation of concerns (frontend/backend)
Service objects for external APIs
Proper authentication scoping
Weaknesses:
No tests
Oversized components
Security gaps
Performance issues (N+1 queries, sequential downloads)
Would you like me to help implement any of these refactorings? I'd recommend starting with #1 (splitting WordListTable) or #5 (adding tests).
