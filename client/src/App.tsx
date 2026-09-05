import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

const API_URL = import.meta.env.VITE_API_URL ?? "https://api-note-z.vercel.app"
const STORAGE_KEY = "note_app_user_id"

type UserPayload = {
  _id?: string
  id?: string
  name?: string
  email?: string
  phone?: string
  age?: number
}

type NotePayload = {
  _id?: string
  title: string
  content: string
  userId?: string | { email?: string }
  createdAt?: string
}

const emptySignup = {
  name: "",
  email: "",
  phone: "",
  password: "",
  age: "",
}

const emptyLogin = {
  email: "",
  password: "",
}

const emptyNote = {
  title: "",
  content: "",
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  })

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json") ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message ?? "Request failed"
    throw new Error(message)
  }

  return payload as T
}

export function App() {
  const { theme, setTheme } = useTheme()

  const [signupForm, setSignupForm] = useState(emptySignup)
  const [loginForm, setLoginForm] = useState(emptyLogin)
  const [noteForm, setNoteForm] = useState(emptyNote)
  const [notes, setNotes] = useState<NotePayload[]>([])
  const [userId, setUserId] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? "")
  const [activeUser, setActiveUser] = useState<UserPayload | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string>("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const loadNotes = async (currentUserId: string) => {
    try {
      const response = await apiRequest<{ message: string; data?: NotePayload[] }>(
        `/note/note-with-user?user=${currentUserId}`
      )
      setNotes(response.data ?? [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY)
    if (savedUserId) {
      setUserId(savedUserId)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      localStorage.removeItem(STORAGE_KEY)
      setNotes([])
      return
    }

    localStorage.setItem(STORAGE_KEY, userId)
    loadNotes(userId)
  }, [userId])

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await apiRequest<{ message: string; data?: UserPayload }>("/user/signup", {
        method: "POST",
        body: JSON.stringify({
          ...signupForm,
          age: Number(signupForm.age || 0),
        }),
      })

      const nextUserId = result.data?._id ?? result.data?.id ?? ""
      if (!nextUserId) {
        throw new Error("User was created but no id was returned")
      }

      setUserId(nextUserId)
      localStorage.setItem(STORAGE_KEY, nextUserId)
      setActiveUser(result.data ?? null)
      setSignupForm(emptySignup)
      setNoteForm(emptyNote)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await apiRequest<{ message: string; data?: UserPayload }>("/user/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      })

      const nextUserId = result.data?._id ?? result.data?.id ?? ""
      if (!nextUserId) {
        throw new Error("Login succeeded but no user id was returned")
      }

      setUserId(nextUserId)
      localStorage.setItem(STORAGE_KEY, nextUserId)
      setActiveUser(result.data ?? null)
      setLoginForm(emptyLogin)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) {
      setError("Create or login a user first")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      if (selectedNoteId) {
        await apiRequest(`/note/${selectedNoteId}/content?user=${userId}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
          }),
        })
      } else {
        await apiRequest(`/note?id=${userId}`, {
          method: "POST",
          body: JSON.stringify(noteForm),
        })
      }

      setNoteForm(emptyNote)
      setSelectedNoteId("")
      await loadNotes(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Note action failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!userId) return

    try {
      await apiRequest(`/note/${noteId}?user=${userId}`, { method: "DELETE" })
      await loadNotes(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const handleEditNote = (note: NotePayload) => {
    setSelectedNoteId(note._id ?? "")
    setNoteForm({
      title: note.title,
      content: note.content,
    })
  }

  const handleLogout = () => {
    setUserId("")
    localStorage.removeItem(STORAGE_KEY)
    setActiveUser(null)
    setNotes([])
    setSelectedNoteId("")
    setNoteForm(emptyNote)
    setError("")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Notes app</p>
            <h1 className="text-3xl font-bold">Your personal workspace</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            {!userId ? (
              <>
                <form onSubmit={handleSignup} className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                  <div>
                    <h2 className="text-xl font-semibold">Create account</h2>
                  </div>

                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Name"
                    value={signupForm.name}
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Email"
                    type="email"
                    value={signupForm.email}
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Phone"
                    value={signupForm.phone}
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Password"
                    type="password"
                    value={signupForm.password}
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Age"
                    type="number"
                    value={signupForm.age}
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, age: event.target.value }))
                    }
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Working..." : "Sign up"}
                  </Button>
                </form>

                <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                  <div>
                    <h2 className="text-xl font-semibold">Login</h2>
                  </div>

                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                    placeholder="Password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />

                  <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Login"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Signed in as</p>
                    <h2 className="text-xl font-semibold">{activeUser?.name ?? "User"}</h2>
                  </div>
                  <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                </div>

                <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {activeUser?.email}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <form onSubmit={handleNoteSubmit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedNoteId ? "Update note" : "Create note"}
                </h2>
                {selectedNoteId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedNoteId("")
                      setNoteForm(emptyNote)
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>

              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                placeholder="Note title"
                value={noteForm.title}
                onChange={(event) =>
                  setNoteForm((current) => ({ ...current, title: event.target.value }))
                }
              />
              <textarea
                className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
                placeholder="Write your note here..."
                value={noteForm.content}
                onChange={(event) =>
                  setNoteForm((current) => ({ ...current, content: event.target.value }))
                }
              />

              <Button type="submit" className="w-full" disabled={!userId || isLoading}>
                {selectedNoteId ? "Update note" : "Save note"}
              </Button>
            </form>

            <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My notes</h2>
                <span className="text-sm text-muted-foreground">{notes.length}</span>
              </div>

              {notes.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No notes yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note._id ?? `${note.title}-${note.content}`} className="rounded-xl border p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{note.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Just now"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleEditNote(note)}>
                            Edit
                          </Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteNote(note._id ?? "")}>
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
