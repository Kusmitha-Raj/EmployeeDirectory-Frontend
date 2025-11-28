// src/api/employeeApi.ts
import api from "./axios";

export interface EmployeeView {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  departmentName?: string;
  jobRole?: string;
  gender?: string;
  raw?: any;
}

type BackendEmployee = Record<string, any>;

function mapBackendToFrontend(e: BackendEmployee): EmployeeView {
  const id = e.EmployeeId ?? e.employeeId ?? e.id ?? 0;

  // try server full name first
  // const fullFromServer = (e.FullName ?? e.fullname ?? e.Name ?? e.name ?? "").toString().trim();
  const first = (e.FirstName ?? e.first_name ?? e.first ?? e.firstName ?? "").toString().trim();
  const last  = (e.LastName  ?? e.last_name  ?? e.last  ?? e.lastName  ?? "").toString().trim();

  const nameFromParts = (first || last) ? `${first} ${last}`.trim() : "";
  const emailStr = (e.Email ?? e.email ?? "").toString().trim();
  const fromEmail = emailStr.includes("@") ? emailStr.split("@")[0] : emailStr;

  // name priority: server full > first+last > email username > "Employee <id>"
  const name =  nameFromParts || fromEmail || (id ? `Employee ${id}` : "Unknown");

  return {
    id,
    name,
    firstName: first || undefined,
    lastName: last || undefined,
    email: e.Email ?? e.email ?? undefined,
    phone: e.PhoneNo ?? e.phoneNo ?? e.Phone ?? e.phone ?? undefined,
    departmentId: e.DepartmentId ?? e.departmentId ?? undefined,
    departmentName: e.DepartmentName ?? e.departmentName ?? undefined,
    jobRole: e.JobRole ?? e.jobRole ?? undefined,
    gender: e.Gender ?? e.gender ?? undefined,
    raw: e,
  };
}

export async function getEmployees(): Promise<EmployeeView[]> {
  const resp = await api.get<BackendEmployee[]>("/api/Employee");
  // debug: uncomment if you need to inspect raw:
  // console.log("RAW /api/Employee:", resp.data?.slice?.(0,10));
  return (resp.data ?? []).map(mapBackendToFrontend);
}

export async function getEmployeeById(id: number): Promise<EmployeeView> {
  const resp = await api.get<BackendEmployee>(`/api/Employee/${id}`);
  return mapBackendToFrontend(resp.data ?? {});
}

export async function createEmployee(payload: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  jobRole?: string;
  gender?: string;
}): Promise<EmployeeView | null> {
  const body = {
    FirstName: payload.firstName,
    LastName: payload.lastName,
    Email: payload.email,
    PhoneNo: payload.phone,
    DepartmentId: payload.departmentId,
    JobRole: payload.jobRole,
    Gender: payload.gender,
  };
  const resp = await api.post("/api/User/AddEmployee", body);
  return resp?.data ? mapBackendToFrontend(resp.data) : null;
}

export async function updateEmployee(
  id: number,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    departmentId?: number;
    jobRole?: string;
    gender?: string;
  }
): Promise<EmployeeView | null> {
  const body: any = {};
  if (payload.firstName !== undefined) body.FirstName = payload.firstName;
  if (payload.lastName !== undefined) body.LastName = payload.lastName;
  if (payload.email !== undefined) body.Email = payload.email;
  if (payload.phone !== undefined) body.PhoneNo = payload.phone;
  if (payload.departmentId !== undefined) body.DepartmentId = payload.departmentId;
  if (payload.jobRole !== undefined) body.JobRole = payload.jobRole;
  if (payload.gender !== undefined) body.Gender = payload.gender;

  const resp = await api.put(`/api/Employee/${id}`, body);
  return resp?.data ? mapBackendToFrontend(resp.data) : null;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/api/Employee/${id}`);
}
