"use client";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface SubmitStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    email: "", 
    message: "" 
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: 'idle' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: 'loading' });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: result.message || 'Message sent successfully!' 
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Something went wrong' 
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please try again.' 
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      {/* Status Messages */}
      {submitStatus.type === 'success' && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitStatus.message}
        </div>
      )}
      
      {submitStatus.type === 'error' && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          onChange={handleChange}
          value={formData.name}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          onChange={handleChange}
          value={formData.email}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          onChange={handleChange}
          value={formData.message}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button 
          type="submit" 
          disabled={submitStatus.type === 'loading'}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-colors"
        >
          {submitStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
