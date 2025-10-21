import React, { useState } from "react";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const response = await fetch("http://localhost:8000/api/feedback/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus("Thank you for your feedback!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send feedback. Try again.");
      }
    } catch (error) {
      setStatus("Error sending feedback.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Send us your Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Your Name (optional)"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email (optional)"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="message"
          placeholder="Your Feedback"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded h-24"
        ></textarea>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
      {status && <p className="text-center mt-3">{status}</p>}
    </div>
  );
}
