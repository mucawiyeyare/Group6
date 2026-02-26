import { useEffect, useMemo, useState } from "react";
import { authAPI } from "../../api/auth";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

const avatarOptions = [
  { label: "Blue Wave", value: "/avatars/avatar-1.svg" },
  { label: "Emerald", value: "/avatars/avatar-2.svg" },
  { label: "Sunset", value: "/avatars/avatar-3.svg" },
  { label: "Pink Bloom", value: "/avatars/avatar-4.svg" },
  { label: "Violet", value: "/avatars/avatar-5.svg" },
  { label: "Rose", value: "/avatars/avatar-6.svg" },
];

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wide";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    profileImage: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      profileImage: user.profileImage || "",
    });
  }, [user]);

  const previewInitial = useMemo(() => {
    const raw = String(form.name || user?.name || "U").trim();
    return raw ? raw[0].toUpperCase() : "U";
  }, [form.name, user?.name]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const data = await authAPI.updateMe({
        name: form.name.trim(),
        email: form.email.trim(),
        profileImage: form.profileImage || "",
      });
      updateUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Edit your name, email, and profile image</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="font-semibold text-slate-800">Your Details</div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Role</label>
                <input
                  value={user.role === "admin" ? "Admin" : "User"}
                  className={`${inputCls} bg-slate-50 text-slate-500`}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-white">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Selected profile"
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shadow-sm">
                  {previewInitial}
                </div>
              )}
              <div className="text-xs text-slate-500">Profile preview</div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Profile Image (Gallery Dropdown)</label>
            <select
              name="profileImage"
              value={form.profileImage}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">Use initials (no image)</option>
              {avatarOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="mt-3 flex flex-wrap gap-2">
              {avatarOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, profileImage: opt.value }))}
                  className={`rounded-xl border p-1 transition ${
                    form.profileImage === opt.value
                      ? "border-indigo-500 ring-2 ring-indigo-200"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                  title={opt.label}
                >
                  <img src={opt.value} alt={opt.label} className="w-12 h-12 rounded-lg object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
