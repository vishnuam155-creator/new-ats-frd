import React, { useEffect, useState } from "react";

const apiBase = "http://127.0.0.1:8000"; // change for production

export default function ResumeMakerButton() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);

  // fetch plan/usage info
  const fetchUsage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/resume_checker/`, {
        method: "GET",
        headers: authToken ? { Authorization: `Token ${authToken}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      setPlanData(data);
    } catch (err) {
      console.error("Error fetching usage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [authToken]);

  const handleOpenResumeMaker = () => {
    if (!planData) return;

    if (planData.uploads_used >= planData.limit) {
      alert(
        `Upload limit reached for your plan (${planData.plan}). Please login or upgrade.`
      );
      return;
    }

    // ✅ redirect to resume maker React route
    window.location.href = "/resume-maker"; 
  };

  return (
    <div>
      {loading && <p>Checking your usage...</p>}

      {planData && (
        <p>
          Plan: <strong>{planData.plan}</strong> | Used:{" "}
          {planData.uploads_used}/{planData.limit}
        </p>
      )}

      <button onClick={handleOpenResumeMaker} disabled={loading}>
        Open Resume Maker
      </button>
    </div>
  );
}
