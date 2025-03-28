import React, { useState } from 'react';
import axios from 'axios';

const MODELS = ["openai", "claude", "gemini"];
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [model, setModel] = useState("openai");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [allResponses, setAllResponses] = useState({});
  const [voiceLoading, setVoiceLoading] = useState(false);

  const fetchResponse = async () => {
    const res = await axios.get(`${BACKEND_URL}/model/${model}`, {
      params: { prompt }
    });
    setResponse(res.data.response);
  };

  const forkPrompt = async () => {
    const results = {};
    for (let m of MODELS) {
      const res = await axios.get(`${BACKEND_URL}/model/${m}`, {
        params: { prompt }
      });
      results[m] = res.data.response;
    }
    setAllResponses(results);
  };

  const playVoice = async () => {
    setVoiceLoading(true);
    const res = await axios.post(
      `${BACKEND_URL}/voice?text=${encodeURIComponent(response)}`,
      {},
      { responseType: 'blob' }
    );
    const audio = new Audio(URL.createObjectURL(res.data));
    audio.play();
    setVoiceLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>🧐 AI Control Room</h2>
      <select value={model} onChange={(e) => setModel(e.target.value)}>
        {MODELS.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
      </select>
      <br /><br />
      <input
        type="text"
        placeholder="Enter your prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: '60%' }}
      />
      <br /><br />
      <button onClick={fetchResponse}>Send to {model.toUpperCase()}</button>
      <button onClick={forkPrompt}>Fork to All Models</button>
      <br /><br />
      <div><strong>{model.toUpperCase()} Response:</strong> {response}</div>
      {Object.keys(allResponses).length > 0 && (
        <div>
          <h4>All Responses:</h4>
          {Object.entries(allResponses).map(([model, resp]) => (
            <div key={model}><strong>{model.toUpperCase()}:</strong> {resp}</div>
          ))}
        </div>
      )}
      <br />
      <button onClick={playVoice} disabled={voiceLoading}>
        {voiceLoading ? "Loading..." : "Play Voice"}
      </button>
    </div>
  );
}

export default App;
