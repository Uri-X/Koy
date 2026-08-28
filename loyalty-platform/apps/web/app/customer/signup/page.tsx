"use client";

// Customer signup (PRD 5.3): create a User, then join a merchant's
// loyalty program (creates a MerchantMembership at 0 stars).

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Merchant = {
  id: string;
  name: string;
  rewardDescription: string;
  redemptionTarget: number;
};

export default function CustomerSignupPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", merchantId: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [membership, setMembership] = useState<any>(null);

  // Load merchants so the customer can pick which program to join.
  useEffect(() => {
    fetch(`${API_URL}/merchants`)
      .then((res) => res.json())
      .then((data) => {
        setMerchants(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, merchantId: data[0].id }));
        }
      })
      .catch(() => setErrorMsg("Could not load merchants. Is the API running?"));
  }, []);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");
    try {
      // Step 1: create the user
      const userRes = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!userRes.ok) {
        const body = await userRes.json().catch(() => ({}));
        throw new Error(body.message || `Signup failed (${userRes.status})`);
      }
      const user = await userRes.json();

      // Step 2: join the selected merchant's loyalty program
      const joinRes = await fetch(
        `${API_URL}/users/${user.id}/join/${form.merchantId}`,
        { method: "POST" }
      );
      if (!joinRes.ok) {
        const body = await joinRes.json().catch(() => ({}));
        throw new Error(body.message || `Join failed (${joinRes.status})`);
      }
      const data = await joinRes.json();
      setMembership(data);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done" && membership) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-2">You're in 🎉</h1>
        <p className="text-gray-600 mb-4">
          Welcome to <strong>{membership.merchant.name}</strong>'s loyalty
          program. You're starting at{" "}
          <strong>{membership.currentStars} stars</strong>.
        </p>
        <pre className="bg-gray-100 rounded-lg p-4 text-xs overflow-auto">
          {JSON.stringify(membership, null, 2)}
        </pre>

        <a
          href="/customer/dashboard"
          className="inline-block mt-4 text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-100"
        >
          Go to dashboard →
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-1">Join a loyalty program</h1>
      <p className="text-gray-500 text-sm mb-6">
        Sign up and start earning stars at your favorite spots.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone number</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. 0712345678"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Which merchant?
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.merchantId}
            onChange={(e) => update("merchantId", e.target.value)}
            required
          >
            {merchants.length === 0 && <option value="">Loading...</option>}
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.rewardDescription} at {m.redemptionTarget} stars
              </option>
            ))}
          </select>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "saving" || merchants.length === 0}
          className="w-full rounded-lg bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "saving" ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </main>
  );
}