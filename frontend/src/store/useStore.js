import { create } from 'zustand';
import {
  getBookmarks, createBookmark, deleteBookmark, updateBookmark,
  getCollections, createCollection, deleteCollection,
  getTags, getMe,
} from '../api/client';

// Persist dark mode preference
const savedDark = localStorage.getItem('lv_dark');
const initialDark = savedDark !== null ? savedDark === 'true' : true;
if (initialDark) document.documentElement.classList.add('dark');
else document.documentElement.classList.remove('dark');

const useStore = create((set, get) => ({
  // ── Auth ─────────────────────────────────────────────
  user: null,
  authStatus: 'idle', // 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

  setUser: (user) => set({ user, authStatus: user ? 'authenticated' : 'unauthenticated' }),

  checkAuth: async () => {
    const token = localStorage.getItem('lv_token');
    if (!token) { set({ authStatus: 'unauthenticated', user: null }); return false; }
    set({ authStatus: 'checking' });
    try {
      const { user } = await getMe();
      set({ user, authStatus: 'authenticated' });
      return true;
    } catch {
      localStorage.removeItem('lv_token');
      set({ authStatus: 'unauthenticated', user: null });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('lv_token');
    set({ user: null, authStatus: 'unauthenticated', bookmarks: [], collections: [], tags: [] });
  },

  // ── Bookmarks ─────────────────────────────────────────
  bookmarks: [],
  collections: [],
  tags: [],
  activeCollection: null,
  activeTag: null,
  searchQuery: '',
  viewMode: localStorage.getItem('lv_view') || 'grid',
  showFavoritesOnly: false,
  loading: false,
  error: null,

  // ── UI ────────────────────────────────────────────────
  darkMode: initialDark,

  toggleDarkMode: () => {
    const next = !get().darkMode;
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('lv_dark', String(next));
    set({ darkMode: next });
  },

  // ── Bookmark actions ──────────────────────────────────
  fetchBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const { activeCollection, activeTag, searchQuery, showFavoritesOnly } = get();
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (activeCollection) params.collection_id = activeCollection;
      if (activeTag) params.tag = activeTag;
      if (showFavoritesOnly) params.favorites = '1';
      const bookmarks = await getBookmarks(params);
      set({ bookmarks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addBookmark: async (data) => {
    const bookmark = await createBookmark(data);
    set((s) => ({ bookmarks: [bookmark, ...s.bookmarks] }));
    return bookmark;
  },

  removeBookmark: async (id) => {
    await deleteBookmark(id);
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
  },

  editBookmark: async (id, data) => {
    const updated = await updateBookmark(id, data);
    set((s) => ({ bookmarks: s.bookmarks.map((b) => (b.id === id ? updated : b)) }));
    return updated;
  },

  reorderBookmarks: (orderedIds) => {
    set((s) => {
      const map = new Map(s.bookmarks.map((b) => [b.id, b]));
      const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean);
      return { bookmarks: reordered };
    });
  },

  // ── Collection actions ───────────────────────────────
  fetchCollections: async () => {
    try { set({ collections: await getCollections() }); } catch {}
  },

  addCollection: async (data) => {
    const col = await createCollection(data);
    set((s) => ({ collections: [...s.collections, col] }));
    return col;
  },

  removeCollection: async (id) => {
    await deleteCollection(id);
    set((s) => ({
      collections: s.collections.filter((c) => c.id !== id),
      activeCollection: s.activeCollection === id ? null : s.activeCollection,
    }));
  },

  // ── Tag actions ──────────────────────────────────────
  fetchTags: async () => {
    try { set({ tags: await getTags() }); } catch {}
  },

  // ── Filters ──────────────────────────────────────────
  setViewMode: (viewMode) => { localStorage.setItem('lv_view', viewMode); set({ viewMode }); },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveCollection: (id) => set({ activeCollection: id, activeTag: null, showFavoritesOnly: false }),
  setActiveTag: (tag) => set({ activeTag: tag, activeCollection: null, showFavoritesOnly: false }),
  setShowFavoritesOnly: (val) => set({ showFavoritesOnly: val, activeCollection: null, activeTag: null }),
}));

export default useStore;
