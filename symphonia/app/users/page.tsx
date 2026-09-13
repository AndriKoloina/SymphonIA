'use client'

import { useState, useEffect } from "react"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SideMobile from "@/components/ui/mobile/bar_options"
import ContentMain from "@/components/ui/ContentMain"
import api from "@/components/auth/api"
import { TrashIcon, PencilIcon, UserIcon } from "@heroicons/react/24/outline"

interface User {
  id: number
  email: string
  username: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ username: "", email: "" })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/users")
      setUsers(response.data)
      setError(null)
    } catch {
      setError("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
    } catch {
      alert("Erreur lors de la suppression")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ username: user.username, email: user.email })
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      await api.put(`/users/${editingUser.id}`, {
        username: editForm.username,
        email: editForm.email,
      })
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, username: editForm.username, email: editForm.email }
            : u
        )
      )
      setEditingUser(null)
    } catch {
      alert("Erreur lors de la mise à jour")
    }
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <div className="hidden lg:block">
        <SymphoniaSidebar />
      </div>
      <div className="block lg:hidden">
        <SideMobile />
      </div>
      <ContentMain className="mt-4 px-4 lg:px-8 pb-10">
        <TitlePage title="Utilisateurs" />

        <div className="mt-6">
          {loading && (
            <p className="text-white/50 text-center py-10">Chargement...</p>
          )}

          {error && (
            <p className="text-red-400 text-center py-10">{error}</p>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="text-white/50 text-center py-10">Aucun utilisateur trouvé</p>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="bg-[#1B2945] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white/70">{user.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">{user.email}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Modifier"
                          >
                            <PencilIcon className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal d'édition */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1B2945] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-6">Modifier l&apos;utilisateur</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Nom</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-[#0f0a1e]/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors text-sm font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </ContentMain>
    </div>
  )
}
