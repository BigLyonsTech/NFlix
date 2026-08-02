import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Movie } from '../types';
import { fetchContent } from '../api/contentApi';
import { createContent, deleteContent, updateContent, ContentPayload } from '../api/adminApi';

interface AdminPanelProps {
  onBack: () => void;
}

const emptyForm: ContentPayload = {
  title: '',
  description: '',
  thumbnailUrl: '',
  backgroundUrl: '',
  videoUrl: '',
  year: '',
  ageRating: '',
  duration: '',
  seasons: '',
  genres: [],
  rating: undefined,
  category: 'POPCORN_MANIA',
};

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [items, setItems] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContentPayload>(emptyForm);
  const [genresInput, setGenresInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchContent()
      .then(setItems)
      .catch(() => setError('Failed to load catalog. Are you logged in as an admin?'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setGenresInput('');
    setIsFormOpen(true);
  };

  const openEditForm = (movie: Movie) => {
    setEditingId(movie.id);
    setForm({
      title: movie.title,
      description: movie.description || '',
      thumbnailUrl: movie.thumbnailUrl,
      backgroundUrl: movie.backgroundUrl || '',
      videoUrl: movie.videoUrl || '',
      year: movie.year || '',
      ageRating: movie.ageRating || '',
      duration: movie.duration || '',
      seasons: movie.seasons || '',
      genres: movie.genres || [],
      rating: movie.rating,
      category: (movie.category as ContentPayload['category']) || 'POPCORN_MANIA',
    });
    setGenresInput((movie.genres || []).join(', '));
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const payload: ContentPayload = {
      ...form,
      genres: genresInput.split(',').map((g) => g.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateContent(editingId, payload);
      } else {
        await createContent(payload);
      }
      setIsFormOpen(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save. Make sure all required fields are filled.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this title? This cannot be undone.')) return;
    try {
      await deleteContent(id);
      load();
    } catch {
      setError('Failed to delete title.');
    }
  };

  return (
    <div className="w-full h-full bg-[#141414] text-white flex flex-col p-4 sm:p-8 md:p-10 overflow-hidden rounded-3xl md:rounded-[2.5rem]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Admin — Content Catalog</h1>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full"
        >
          <Plus className="w-4 h-4" /> Add Title
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-lg px-4 py-2.5 shrink-0">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-zinc-500 text-sm">No titles yet. Click "Add Title" to seed the catalog.</p>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-zinc-400 border-b border-white/10">
                <th className="py-3 pr-4 font-medium">Thumbnail</th>
                <th className="py-3 pr-4 font-medium">Title</th>
                <th className="py-3 pr-4 font-medium hidden sm:table-cell">Category</th>
                <th className="py-3 pr-4 font-medium hidden md:table-cell">Genres</th>
                <th className="py-3 pr-4 font-medium hidden lg:table-cell">Year</th>
                <th className="py-3 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((movie) => (
                <tr key={movie.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2.5 pr-4">
                    <img src={movie.thumbnailUrl} alt={movie.title} className="w-14 h-8 sm:w-16 sm:h-9 object-cover rounded" />
                  </td>
                  <td className="py-2.5 pr-4 font-medium">{movie.title}</td>
                  <td className="py-2.5 pr-4 hidden sm:table-cell text-zinc-400">{movie.category}</td>
                  <td className="py-2.5 pr-4 hidden md:table-cell text-zinc-400">{(movie.genres || []).join(', ')}</td>
                  <td className="py-2.5 pr-4 hidden lg:table-cell text-zinc-400">{movie.year}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(movie)} className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition text-zinc-300 hover:text-white">
                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => handleDelete(movie.id)} className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/20 transition text-zinc-300 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-hide p-6 relative">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Title' : 'Add New Title'}</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input required placeholder="Title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

              <textarea placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

              <input required placeholder="Thumbnail image URL" value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

              <input placeholder="Background image URL (for hero/immersive view)" value={form.backgroundUrl}
                onChange={(e) => setForm({ ...form, backgroundUrl: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

              <input placeholder="Video URL (mp4 - leave blank to use a sample clip)" value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Year" value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                <input placeholder="Age rating (e.g. U/A 13+)" value={form.ageRating}
                  onChange={(e) => setForm({ ...form, ageRating: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Duration (e.g. 2h 20m)" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                <input placeholder="Seasons (e.g. 3 Seasons)" value={form.seasons}
                  onChange={(e) => setForm({ ...form, seasons: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>

              <input placeholder="Genres, comma separated (e.g. Action, Drama)" value={genresInput}
                onChange={(e) => setGenresInput(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

              <div className="grid grid-cols-2 gap-3">
                <input type="number" min={1} max={5} placeholder="Rating (1-5)" value={form.rating ?? ''}
                  onChange={(e) => setForm({ ...form, rating: e.target.value ? Number(e.target.value) : undefined })}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500" />

                <select value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ContentPayload['category'] })}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  <option value="POPCORN_MANIA">Popcorn Mania</option>
                  <option value="NEW_TRAILER">New Trailer</option>
                  <option value="HERO">Hero (featured)</option>
                </select>
              </div>

              <button type="submit" disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 transition text-white font-bold py-2.5 rounded-md mt-2 disabled:opacity-60">
                {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Title'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
