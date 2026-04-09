"use client";
import { useState, useEffect } from "react";
import { Terminal, Search, Loader2, AlertCircle, Skull } from "lucide-react";

// 1. Define the structure of a history item
interface RoastHistoryItem {
  id: number;
  url: string;
  roast: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [data, setData] = useState<{
    roast: string;
    findings: string[];
  } | null>(null);
  const [history, setHistory] = useState<RoastHistoryItem[]>([]);

  const [loadMessage, setLoadMessage] = useState("Initiating Deep Scan...");

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem("roast_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Loading Messages
  useEffect(() => {
    const messages = [
      "Initiating Deep Scan...",
      "Bribing the firewall...",
      "Ignoring Jira tickets...",
      "Judging your font choices...",
      "Blaming the intern...",
      "Searching for centered divs...",
      "Analyzing technical debt...",
      "Drinking more coffee...",
    ];
    let interval: NodeJS.Timeout;
    if (loading) {
      let i = 0;
      interval = setInterval(() => {
        setLoadMessage(messages[i % messages.length]);
        i++;
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setData(null);

    try {
      const response = await fetch(
        `http://localhost:8000/roast?url=${encodeURIComponent(url)}&intensity=${intensity}`,
      );
      const result = await response.json();
      setData(result);

      // Update Wall of Shame
      const newEntry: RoastHistoryItem = {
        url,
        roast: result.roast,
        id: Date.now(),
      };

      const updatedHistory = [newEntry, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem("roast_history", JSON.stringify(updatedHistory));
    } catch {
      alert("Backend connection failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-emerald-500 p-8 font-mono crt-screen">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Header with Intensity Slider */}
        <header className="flex justify-between items-end border-b border-emerald-900 pb-4">
          <div className="flex items-center gap-4">
            <Terminal size={40} className="text-emerald-400" />
            <h1 className="text-3xl font-bold uppercase tracking-tighter">
              QA Burner v1.0
            </h1>
          </div>
          <div className="text-right w-48">
            <label className="text-[10px] uppercase block opacity-50 mb-1">
              Burn_Intensity: {intensity}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </header>

        {/* Input */}
        <form onSubmit={handleRoast} className="relative">
          <input
            type="url"
            placeholder="https://target-site.com"
            required
            className="w-full bg-zinc-900 border-2 border-emerald-900 rounded-lg p-4 pl-12 focus:border-emerald-400 outline-none text-emerald-300"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Search className="absolute left-4 top-5 opacity-40" size={18} />
          <button className="absolute right-2 top-2 bg-emerald-600 hover:bg-emerald-400 text-black px-6 py-2 rounded-md font-bold transition-all">
            {loading ? <Loader2 className="animate-spin" /> : "ROAST"}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 border-2 border-dashed border-emerald-900/50 rounded-lg">
            <Loader2 className="animate-spin mx-auto mb-4" size={40} />
            <p className="text-xl font-bold tracking-[0.3em]">{loadMessage}</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="border-2 border-emerald-900 rounded-lg overflow-hidden group relative">
              <div className="absolute top-0 left-0 bg-emerald-900 text-black px-2 py-1 text-[10px] font-bold z-10">
                EVIDENCE.PNG
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/leak.png?t=${Date.now()}`}
                alt="Evidence"
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="bg-emerald-500 text-black p-8 rounded-lg shadow-2xl">
              <h2 className="text-[10px] font-black uppercase mb-2 opacity-60">
                System_Assessment:
              </h2>
              <p className="text-2xl font-black italic leading-tight">
                {data.roast}
              </p>
            </div>
            <div className="bg-zinc-900/50 p-6 border border-emerald-900/30 rounded-lg">
              <h3 className="text-[10px] uppercase font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> Diagnostic_Logs
              </h3>
              <ul className="space-y-2">
                {data.findings.map((f, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-red-500">[!]</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Wall of Shame */}
        {history.length > 0 && (
          <div className="pt-10 border-t border-emerald-900/20">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] mb-6 flex items-center gap-2 opacity-40">
              <Skull size={14} /> Wall_of_Shame
            </h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="bg-zinc-900/20 border border-emerald-900/10 p-4 rounded flex justify-between items-center group"
                >
                  <div className="truncate pr-4">
                    <p className="text-[10px] opacity-30 truncate">{h.url}</p>
                    <p className="text-sm italic text-emerald-700 truncate">
                      {h.roast}
                    </p>
                  </div>
                  <button
                    onClick={() => setUrl(h.url)}
                    className="text-[10px] border border-emerald-900 px-2 py-1 opacity-0 group-hover:opacity-100 hover:bg-emerald-900 transition-all"
                  >
                    RE-SCAN
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
