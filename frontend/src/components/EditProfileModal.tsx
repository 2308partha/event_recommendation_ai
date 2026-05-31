import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  X, Save, Loader2, User, Building, GraduationCap, Phone,
  Droplets, GitBranch, Link2, Sparkles, BookOpen, Heart,
  Tag, MapPin, CalendarDays
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDetails {
  name: string;
  email: string;
  department: string;
  roll_no: string;
  skills: string[];
  image_url: string;
  college_name: string;
  phone_number: string;
  blood_group: string;
  pass_out_year: string;
  interests: string[];
  hobbies: string[];
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  userDetails: UserDetails;
  onSaved: (updated: Partial<UserDetails>) => void;
}

// ─── Tag Input Component ──────────────────────────────────────────────────────

function TagInput({
  label,
  icon,
  tags,
  onChange,
  placeholder,
  color = "violet",
}: {
  label: string;
  icon: React.ReactNode;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  color?: "violet" | "pink" | "emerald" | "blue";
}) {
  const [input, setInput] = useState("");

  const colorMap = {
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
    pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  };

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => onChange(tags.filter(t => t !== tag));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {icon} {label}
      </Label>
      <div className="min-h-[42px] flex flex-wrap gap-1.5 items-center p-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/50 transition-all">
        {tags.map(tag => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[color]}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-70 transition-opacity ml-0.5"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : "Add more…"}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag</p>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/50">
      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
    </div>
  );
}

// ─── Field Component ──────────────────────────────────────────────────────────

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Blood Group Options ──────────────────────────────────────────────────────

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function EditProfileModal({ open, onClose, userDetails, onSaved }: EditProfileModalProps) {
  const api = useApi();
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState({
    college_name: "",
    department: "",
    roll_no: "",
    pass_out_year: "",
    phone_number: "",
    blood_group: "",
    dob: "",
    github_url: "",
    linkedin_url: "",
    location_name: "",
    skills: [] as string[],
    interests: [] as string[],
    hobbies: [] as string[],
    preferred_categories: [] as string[],
  });

  // Pre-fill when modal opens
  useEffect(() => {
    if (open && userDetails) {
      setForm({
        college_name: userDetails.college_name !== "Not Specified" ? userDetails.college_name || "" : "",
        department: userDetails.department !== "Not Specified" ? userDetails.department || "" : "",
        roll_no: userDetails.roll_no !== "Not Specified" ? userDetails.roll_no || "" : "",
        pass_out_year: userDetails.pass_out_year || "",
        phone_number: userDetails.phone_number || "",
        blood_group: userDetails.blood_group || "",
        dob: "",
        github_url: "",
        linkedin_url: "",
        location_name: "",
        skills: userDetails.skills || [],
        interests: userDetails.interests || [],
        hobbies: userDetails.hobbies || [],
        preferred_categories: [],
      });
    }
  }, [open, userDetails]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as unknown as KeyboardEvent).key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const set = (key: string, value: string | string[]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (form.pass_out_year) payload.pass_out_year = parseInt(form.pass_out_year);
      if (!form.github_url) delete payload.github_url;
      if (!form.linkedin_url) delete payload.linkedin_url;
      if (!form.location_name) delete payload.location_name;
      if (!form.dob) delete payload.dob;

      await api.put("/api/user", payload);

      toast.success("Profile updated successfully! 🎉");
      onSaved({
        college_name: form.college_name,
        department: form.department,
        roll_no: form.roll_no,
        pass_out_year: form.pass_out_year,
        phone_number: form.phone_number,
        blood_group: form.blood_group,
        skills: form.skills,
        interests: form.interests,
        hobbies: form.hobbies,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      const msg = error?.response?.data?.detail || error?.message || "Update failed";
      toast.error(`Could not save profile: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-violet-600/5 via-fuchsia-500/5 to-transparent shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Profile</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Update your academic and personal details</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto">
              <form id="profile-form" onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* ── Academic Details ─────────────────────────── */}
                <div>
                  <SectionHeader icon={<Building className="w-4 h-4" />} title="Academic Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="College / University Name" id="college_name">
                        <Input
                          id="college_name"
                          value={form.college_name}
                          onChange={e => set("college_name", e.target.value)}
                          placeholder="e.g. Nexus Institute of Technology"
                          className="focus-visible:ring-violet-500/30"
                        />
                      </Field>
                    </div>
                    <Field label="Department" id="department">
                      <Input
                        id="department"
                        value={form.department}
                        onChange={e => set("department", e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="focus-visible:ring-violet-500/30"
                      />
                    </Field>
                    <Field label="Roll Number" id="roll_no">
                      <Input
                        id="roll_no"
                        value={form.roll_no}
                        onChange={e => set("roll_no", e.target.value)}
                        placeholder="e.g. CS21B042"
                        className="focus-visible:ring-violet-500/30"
                      />
                    </Field>
                    <Field label="Pass Out Year" id="pass_out_year">
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="pass_out_year"
                          type="number"
                          min="2020"
                          max="2035"
                          value={form.pass_out_year}
                          onChange={e => set("pass_out_year", e.target.value)}
                          placeholder="2026"
                          className="pl-9 focus-visible:ring-violet-500/30"
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* ── Personal Details ─────────────────────────── */}
                <div>
                  <SectionHeader icon={<User className="w-4 h-4" />} title="Personal Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone Number" id="phone_number">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone_number"
                          value={form.phone_number}
                          onChange={e => set("phone_number", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="pl-9 focus-visible:ring-violet-500/30"
                        />
                      </div>
                    </Field>
                    <Field label="Date of Birth" id="dob">
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          value={form.dob}
                          onChange={e => set("dob", e.target.value)}
                          className="pl-9 focus-visible:ring-violet-500/30"
                        />
                      </div>
                    </Field>
                    <Field label="Blood Group" id="blood_group">
                      <div className="flex flex-wrap gap-2">
                        {BLOOD_GROUPS.map(bg => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => set("blood_group", bg)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                              form.blood_group === bg
                                ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20"
                                : "border-border text-muted-foreground hover:border-red-400 hover:text-red-500"
                            }`}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Current Location" id="location_name">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location_name"
                          value={form.location_name}
                          onChange={e => set("location_name", e.target.value)}
                          placeholder="e.g. Bengaluru, Karnataka"
                          className="pl-9 focus-visible:ring-violet-500/30"
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* ── Social Links ─────────────────────────────── */}
                <div>
                  <SectionHeader icon={<Tag className="w-4 h-4" />} title="Social Links" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="GitHub URL" id="github_url">
                      <div className="relative">
                        <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="github_url"
                          value={form.github_url}
                          onChange={e => set("github_url", e.target.value)}
                          placeholder="https://github.com/username"
                          className="pl-9 focus-visible:ring-violet-500/30"
                        />
                      </div>
                    </Field>
                    <Field label="LinkedIn URL" id="linkedin_url">
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="linkedin_url"
                          value={form.linkedin_url}
                          onChange={e => set("linkedin_url", e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="pl-9 focus-visible:ring-violet-500/30"
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* ── Skills & Interests ────────────────────────── */}
                <div>
                  <SectionHeader icon={<Sparkles className="w-4 h-4" />} title="Skills & Interests" />
                  <div className="space-y-5">
                    <TagInput
                      label="Skills"
                      icon={<Sparkles className="w-3.5 h-3.5 text-violet-500" />}
                      tags={form.skills}
                      onChange={v => set("skills", v)}
                      placeholder="Type a skill e.g. React, Python…"
                      color="violet"
                    />
                    <TagInput
                      label="Interests"
                      icon={<BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                      tags={form.interests}
                      onChange={v => set("interests", v)}
                      placeholder="e.g. Machine Learning, Web Dev…"
                      color="blue"
                    />
                    <TagInput
                      label="Hobbies"
                      icon={<Heart className="w-3.5 h-3.5 text-pink-500" />}
                      tags={form.hobbies}
                      onChange={v => set("hobbies", v)}
                      placeholder="e.g. Photography, Chess…"
                      color="pink"
                    />
                    <TagInput
                      label="Preferred Event Categories"
                      icon={<Tag className="w-3.5 h-3.5 text-emerald-500" />}
                      tags={form.preferred_categories}
                      onChange={v => set("preferred_categories", v)}
                      placeholder="e.g. Hackathon, Workshop…"
                      color="emerald"
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/50 bg-muted/30 shrink-0 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Changes are saved to your account immediately.
              </p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="profile-form"
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Profile</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
