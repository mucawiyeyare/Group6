import { useEffect, useMemo, useRef, useState } from "react";
import { usersAPI } from "../../api/auth";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  profileImage: "",
};

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm placeholder-slate-400";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

export default function AdminUsers() {
  const { user: me, updateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
    profileImage: "",
  });

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = String(u.name || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const role = String(u.role || "").toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [users, query]);

  const load = async () => {
    try {
      const data = await usersAPI.list();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPreviewInitial = useMemo(() => {
    const raw = String(createForm.name || "U").trim();
    return raw ? raw[0].toUpperCase() : "U";
  }, [createForm.name]);

  const pickProfileImage = async (file) => {
    if (!file) return;

    if (!String(file.type || "").startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast.error("Image must be 2MB or smaller");
      return;
    }

    setReadingImage(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setCreateForm((prev) => ({ ...prev, profileImage: dataUrl }));
      toast.success("Image selected");
    } catch {
      toast.error("Failed to read image");
    } finally {
      setReadingImage(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();

    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      toast.error("Name, email, and password are required");
      return;
    }

    if (createForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
        profileImage: createForm.profileImage.trim(),
      };

      const data = await usersAPI.create(payload);
      setUsers((prev) => [data.user, ...prev]);
      setCreateForm(emptyCreateForm);
      setIsDropActive(false);
      toast.success("User created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "user",
      profileImage: u.profileImage || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSavingId(null);
    setEditForm({ name: "", email: "", role: "user", profileImage: "" });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSavingId(id);
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: id === me?._id ? me.role : editForm.role,
        profileImage: editForm.profileImage || "",
      };

      const data = await usersAPI.update(id, payload);

      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      if (id === me?._id) updateUser(data.user);

      toast.success("User updated");
      cancelEdit();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their data?`)) return;
    try {
      await usersAPI.delete(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (editingId === id) cancelEdit();
      toast.success("User deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">Edit users, update role/name/email, or delete accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "from-indigo-500 to-violet-600" },
          {
            label: "Admins",
            value: users.filter((u) => u.role === "admin").length,
            color: "from-rose-500 to-pink-600",
          },
          {
            label: "Regular Users",
            value: users.filter((u) => u.role === "user").length,
            color: "from-emerald-500 to-teal-600",
          },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-90 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="font-semibold text-slate-800">Create New User</span>
          </div>
          <span className="text-xs text-slate-500">Admins can create user or admin accounts</span>
        </div>

        <form onSubmit={createUser} className="p-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Min. 6 characters"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
              className={inputCls}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Profile Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                pickProfileImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDropActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDropActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDropActive(false);
                pickProfileImage(e.dataTransfer?.files?.[0]);
              }}
              className={`mt-1 rounded-xl border-2 border-dashed p-3 transition ${
                isDropActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {createForm.profileImage ? (
                    <img
                      src={createForm.profileImage}
                      alt="Selected profile"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center flex-shrink-0">
                      {createPreviewInitial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {createForm.profileImage ? "Image ready" : "Drop image here"}
                    </div>
                    <div className="text-xs text-slate-500">PNG, JPG, WebP, GIF up to 2MB</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={readingImage}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {readingImage ? "Reading..." : "Choose File"}
                  </button>
                  {createForm.profileImage && (
                    <button
                      type="button"
                      onClick={() => setCreateForm((prev) => ({ ...prev, profileImage: "" }))}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400">New users appear in the table below immediately.</div>
            <button
              type="submit"
              disabled={creating || readingImage}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "+ Add User"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/60 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">All Users</h2>
            <div className="text-xs text-slate-500 mt-0.5">Click edit to change a user name, email, or role</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-56 pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2">
              {filteredUsers.length}/{users.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {users.length === 0 ? "No users found." : "No users match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[620px]">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
                <tr className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isEditing = editingId === u._id;
                  return (
                    <tr key={u._id} className="odd:bg-white even:bg-slate-50/40 hover:bg-indigo-50/35 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.profileImage ? (
                            <img
                              src={u.profileImage}
                              alt={`${u.name} avatar`}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {u.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="min-w-[220px]">
                            {isEditing ? (
                              <input
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              />
                            ) : (
                              <div className="font-medium text-slate-900">{u.name}</div>
                            )}

                            {u._id === me?._id && (
                              <div className="text-xs text-indigo-600 mt-0.5">You</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 min-w-[220px]">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        ) : (
                          u.email
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-1">
                            <select
                              value={u._id === me?._id ? me.role : editForm.role}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                              disabled={u._id === me?._id}
                              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {u._id === me?._id && (
                              <div className="text-[11px] text-slate-400">Your role cannot be changed here</div>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {u.role === "admin" ? "Admin" : "User"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(u._id)}
                                disabled={savingId === u._id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {savingId === u._id ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(u)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
                              >
                                Edit
                              </button>
                              {u._id !== me?._id ? (
                                <button
                                  onClick={() => handleDelete(u._id, u.name)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                                >
                                  Delete
                                </button>
                              ) : (
                                <span className="text-xs text-slate-300">-</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
