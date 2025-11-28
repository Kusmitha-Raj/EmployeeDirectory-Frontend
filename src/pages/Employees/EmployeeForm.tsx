import React, { useEffect, useState } from "react";
import { getDepartments } from "../../api/departmentApi";
import type { EmployeeView } from "../../api/employeeApi";

type Props = {
  initial?: Partial<EmployeeView>;
  onCancel?: () => void;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    departmentId?: number;
    jobRole?: string;
    gender?: string;
  }) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
};

export default function EmployeeForm({ initial, onCancel, onSave, submitLabel = "Save", disabled = false }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [jobRole, setJobRole] = useState("");
  const [gender, setGender] = useState("");
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // computed full name for display (keeps consistent with mapping logic)
  const computeFullName = (src: any) => {
    const i = src || {};
    const fullFromServer = (i.FullName ?? i.fullName ?? i.Name ?? i.name ?? "").toString().trim();
    const first = (i.FirstName ?? i.firstName ?? i.first ?? "").toString().trim();
    const last = (i.LastName ?? i.lastName ?? i.last ?? "").toString().trim();
    if (fullFromServer) return fullFromServer;
    if (first || last) return `${first} ${last}`.trim();
    const email = (i.Email ?? i.email ?? "").toString();
    if (email && email.includes("@")) return email.split("@")[0];
    const id = i.EmployeeId ?? i.employeeId ?? i.id;
    return id ? `Employee ${id}` : "";
  };

  // when `initial` changes, populate fields robustly
  useEffect(() => {
    const i = initial as any || {};
    // prefer separate fields, otherwise try splitting a single full name
    let first = i.firstName ?? i.FirstName ?? i.first ?? "";
    let last = i.lastName ?? i.LastName ?? i.last ?? "";

    if (!first && !last) {
      const single = (i.name ?? i.FullName ?? i.Name ?? "").toString().trim();
      if (single) {
        const parts = single.split(" ").filter(Boolean);
        first = parts.shift() ?? "";
        last = parts.join(" ");
      }
    }

    setFirstName(first ?? "");
    setLastName(last ?? "");
    setEmail(i.email ?? i.Email ?? "");
    setPhone(i.phone ?? i.PhoneNo ?? i.Phone ?? "");
    setDepartmentId(i.departmentId ?? i.DepartmentId ?? undefined);
    setJobRole(i.jobRole ?? i.JobRole ?? "");
    setGender(i.gender ?? i.Gender ?? "");
  }, [initial]); // depend on the whole initial object

  useEffect(() => {
    (async () => {
      try {
        const deps = await getDepartments();
        setDepartments(deps.map((d) => ({ id: d.id, name: d.name })));
      } catch {
        setDepartments([]);
      }
    })();
  }, []);

  const validate = () => {
    if (!firstName.trim()) return "First name required";
    if (!lastName.trim()) return "Last name required";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return "Invalid email";
    if (phone && !/^\+?[0-9\s-]{6,20}$/.test(phone)) return "Invalid phone";
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        departmentId,
        jobRole: jobRole.trim() || undefined,
        gender: gender.trim() || undefined,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // computed display name (safe)
  const displayFullName = computeFullName(initial);

  return (
    <form className="card" onSubmit={handleSubmit}>
      {/* show computed full name at top so user sees what will appear in the table */}
      {displayFullName ? (
        <div style={{ marginBottom: 12, fontWeight: 600 }}>
          Full name: <span style={{ color: "#1e3a8a" }}>{displayFullName}</span>
        </div>
      ) : null}

      <label className="field">
        <span>First name</span>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={disabled} />
      </label>

      <label className="field">
        <span>Last name</span>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={disabled} />
      </label>

      <label className="field">
        <span>Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={disabled} />
      </label>

      <label className="field">
        <span>Phone</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={disabled} />
      </label>

      <label className="field">
        <span>Job role</span>
        <input value={jobRole} onChange={(e) => setJobRole(e.target.value)} disabled={disabled} />
      </label>

      <label className="field">
        <span>Gender</span>
        <select value={gender ?? ""} onChange={(e) => setGender(e.target.value)} disabled={disabled}>
          <option value="">-- select --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label className="field">
        <span>Department</span>
        <select value={departmentId ?? ""} onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)} disabled={disabled}>
          <option value="">-- None --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button className="btn" type="submit" disabled={loading || disabled}>
          {loading ? "Saving..." : submitLabel}
        </button>
        <button className="btn secondary" type="button" onClick={() => onCancel?.()} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
