'use client';

import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('confident and inspiring');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const res = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: input, tone }),
    });

    const data = await res.json();
    setResponse(data.result || data.error);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto w-full min-h-screen bg-gray-900">
      <div className="flex flex-col gap-4">
        <textarea
          className="border border-gray-600 bg-gray-800 text-white p-3 rounded-md resize-none min-h-[150px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your topic, idea or message here..."
        />

        <select
          className="bg-gray-800 text-white border border-gray-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="confident and inspiring">Confident & Inspiring</option>
          <option value="calm and thoughtful">Calm & Thoughtful</option>
          <option value="analytical and insightful">Analytical & Insightful</option>
          <option value="humble and reflective">Humble & Reflective</option>
          <option value="practical and informative">Practical & Informative</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 py-3 rounded-md self-start"
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>

        {response && (
          <div className="mt-6 whitespace-pre-line text-white font-medium bg-gray-800 p-4 rounded-md shadow-sm">
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
