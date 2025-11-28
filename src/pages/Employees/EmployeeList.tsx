import { useEffect, useMemo, useState } from "react";
import {
  getEmployees,
  getEmployeeById,
  deleteEmployee,
  createEmployee,
  updateEmployee,
} from "../../api/employeeApi";
import EmployeeForm from "./EmployeeForm";
import { useAuth } from "../../context/AuthContext";
import type { EmployeeView } from "../../api/employeeApi";
import "./employee.css";
import { toast } from "react-toastify";

export default function EmployeeList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [employees, setEmployees] = useState<EmployeeView[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalEmployee, setEditModalEmployee] =
    useState<EmployeeView | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (e: any) {
      setError(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return employees;

    return employees.filter((emp) => {
      const idMatch = emp.id?.toString().includes(s);
      const nameMatch = emp.name.toLowerCase().includes(s);
      const emailMatch = (emp.email ?? "").toLowerCase().includes(s);
      const phoneMatch = (emp.phone ?? "").toLowerCase().includes(s);
      const deptMatch = (emp.departmentName ?? "").toLowerCase().includes(s);
      const roleMatch = (emp.jobRole ?? "").toLowerCase().includes(s);

      return (
        idMatch ||
        nameMatch ||
        emailMatch ||
        phoneMatch ||
        deptMatch ||
        roleMatch
      );
    });
  }, [employees, q]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, employees.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreate = () => {
    setShowCreateModal(true);
  };

  const openEdit = async (id: number) => {
    setLoadingEdit(true);
    try {
      const full = await getEmployeeById(id);
      setEditModalEmployee(full);
    } catch (e: any) {
      alert("Failed to fetch employee details: " + (e?.message ?? e));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCreateSave = async (payload: any) => {
    try {
      const created = await createEmployee(payload);

      if (created && created.id) setEmployees((prev) => [created, ...prev]);
      else await load();

      setShowCreateModal(false);

       const rawFirstName: string =
      payload?.firstName ??
      created?.firstName ??
      created?.name?.toString().split(" ")[0] ??
      "";

    const firstName = rawFirstName.trim() || "Employee";
    const password = `${firstName}@123`;

      toast.success(
        `Employee added successfully. Please share the password "${password}" with them.`
      );
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? "Create failed");
    }
  };

  const handleEditSave = async (payload: any) => {
    if (!editModalEmployee?.id) return alert("Missing id");
    try {
      const saved = await updateEmployee(editModalEmployee.id, payload);
      if (saved && saved.id)
        setEmployees((prev) =>
          prev.map((p) => (p.id === saved.id ? saved : p))
        );
      else await load();
      setEditModalEmployee(null);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? "Save failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      alert("Not allowed");
      return;
    }
    if (!confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? e?.message ?? "Delete failed");
    }
  };

  const getInitial = (name?: string) =>
    (name ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="page-wrap table-page">
      <div className="toolbar">
        <h2>Employees</h2>
        <div className="toolbar-right">
          <input
            className="search"
            placeholder="Search employees..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn secondary" onClick={load}>
            Refresh
          </button>
          {isAdmin && (
            <button className="btn" onClick={openCreate}>
              {showCreateModal ? "Close" : "Create Employee"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {pagedEmployees.length === 0 ? (
            <div className="card empty-state">No matching employee found.</div>
          ) : (
            <div className="employee-card-grid">
              {pagedEmployees.map((emp) => (
                <div className="employee-card" key={emp.id}>
                  <div className="employee-card-header">
                    <div className="employee-avatar">
                      {getInitial(emp.name)}
                    </div>
                    <div className="employee-header-text">
                      <span className="employee-name">{emp.name}</span>
                      <span className="employee-role">
                        {emp.jobRole ?? "SDE"}
                      </span>
                    </div>
                  </div>

                  <div className="employee-card-body">
                    <div className="employee-meta">
                      <span className="label">Email</span>
                      <span className="value">{emp.email ?? "-"}</span>
                    </div>
                    <div className="employee-meta">
                      <span className="label">Phone</span>
                      <span className="value">{emp.phone ?? "-"}</span>
                    </div>
                    <div className="employee-meta">
                      <span className="label">Department</span>
                      <span className="value">
                        {emp.departmentName ?? "-"}
                      </span>
                    </div>
                    <div className="employee-meta">
                      <span className="label">Gender</span>
                      <span className="value">{emp.gender ?? "-"}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="employee-card-footer">
                      <button
                        className="btn-pill-edit"
                        onClick={() => openEdit(emp.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-pill-delete"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {filtered.length > pageSize && (
            <div className="pagination-bar">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Create Employee</h3>
            <EmployeeForm
              onSave={handleCreateSave}
              onCancel={() => setShowCreateModal(false)}
              submitLabel="Create"
            />
          </div>
        </div>
      )}

      {loadingEdit && (
        <div className="modal-overlay">
          <div className="modal-card card">Loading details...</div>
        </div>
      )}

      {editModalEmployee && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Edit Employee</h3>
            <EmployeeForm
              initial={editModalEmployee}
              onSave={handleEditSave}
              onCancel={() => setEditModalEmployee(null)}
              submitLabel="Update"
            />
          </div>
        </div>
      )}
    </main>
  );

}
