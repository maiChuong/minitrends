import { useEffect, useState } from "react";

// Facebook Panel
function FacebookPanel() {
  const [fbData, setFbData] = useState(null);

  useEffect(() => {
    fetch("/facebook.json")
      .then(res => res.json())
      .then(setFbData);
  }, []);

  return (
    <section>
      <h2>Facebook Insights</h2>
      {fbData?.posts?.data?.map((p, i) => (
        <div key={i}>
          <p>{p.message}</p>
          <small>{new Date(p.created_time).toLocaleString()}</small>
        </div>
      ))}
    </section>
  );
}

// Instagram Panel
function InstagramPanel() {
  const [igData, setIgData] = useState(null);

  useEffect(() => {
    fetch("/instagram.json")
      .then(res => res.json())
      .then(setIgData);
  }, []);

  return (
    <section>
      <h2>Instagram Insights</h2>
      {igData?.media?.data?.map((m, i) => (
        <div key={i}>
          <img src={m.media_url} alt={m.caption} style={{ maxWidth: "100%" }} />
          <p>{m.caption}</p>
          <small>{new Date(m.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </section>
  );
}

// Threads Panel
function ThreadsPanel() {
  const [threadsData, setThreadsData] = useState(null);

  useEffect(() => {
    fetch("/threads.json")
      .then(res => res.json())
      .then(setThreadsData);
  }, []);

  return (
    <section>
      <h2>Threads Insights</h2>
      {threadsData?.threads?.data?.map((t, i) => (
        <div key={i}>
          <p>{t.text}</p>
          <small>{new Date(t.created_time).toLocaleString()}</small>
        </div>
      ))}
    </section>
  );
}

// Main App
export default function App() {
  return (
    <div>
      <h1>MiniTrends Social Hub</h1>
      <FacebookPanel />
      <InstagramPanel />
      <ThreadsPanel />
    </div>
  );
}
