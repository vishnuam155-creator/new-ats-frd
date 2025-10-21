export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

// Optional auth header helper if you use Token auth elsewhere
export function authHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Token ${token}` } : {};
}

function handleNonOK(resp: Response) {
  return resp
    .json()
    .catch(() => ({}))
    .then((data) => {
      const msg = data?.error || `HTTP ${resp.status}`;
      throw new Error(msg);
    });
}

/** Upload a JD file (PDF or image) → return extracted text */
export async function extractJD(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await fetch(`${API_BASE}/jd/extract/`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  if (!resp.ok) return handleNonOK(resp);
  const data = await resp.json();
  return data?.text || '';
}

/** Generate summary + skills + experiences from JD text */
export async function generateFromJD(
  jdText: string
): Promise<{ summary: string; skills: string[]; experiences: string[] }> {
  const resp = await fetch(`${API_BASE}/jd/generate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ jd_text: jdText }),
    credentials: 'include',
  });
  if (!resp.ok) return handleNonOK(resp);
  const data = await resp.json();
  return {
    summary: data?.summary || '',
    skills: Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [],
    experiences: Array.isArray(data?.experiences) ? data.experiences.filter(Boolean) : [],
  };
}
