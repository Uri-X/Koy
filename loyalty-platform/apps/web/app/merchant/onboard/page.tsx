"use client";

// Merchant onboarding (PRD 6.1): signup + earning rule + redemption
// rule config in one form, posted to POST /merchants.

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const INDUSTRIES = ["HORECA", "RETAIL", "WELLNESS", "SERVICES", "OTHER"];
const REWARD_TYPES = [
  "FREE_ITEM",
  "DISCOUNT_PERCENT",
  "DISCOUNT_FIXED",
  "CASH_VALUE",
  "CUSTOM",
];

export default function MerchantOnboardPage() {
  const [form, setForm] = useState({
    name: "Souk",
    industry: "HORECA",
    thresholdAmount: 2500,
    starsPerThreshold: 1,
    redemptionTarget: 10,
    rewardDescription: "1 free meal",
    rewardType: "FREE_ITEM",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [created, setCreated] = useState<any>(null);

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/merchants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          industry: form.industry,
          thresholdAmount: Number(form.thresholdAmount),
          starsPerThreshold: Number(form.starsPerThreshold),
          redemptionTarget: Number(form.redemptionTarget),
          rewardDescription: form.rewardDescription,
          rewardType: form.rewardType,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setCreated(data);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done" && created) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-2">Merchant created 🎉</h1>
        <p className="text-gray-600 mb-4">
          <strong>{created.name}</strong> is now live in the database with
          real id <code className="text-sm bg-gray-100 px-1 rounded">{created.id}</code>.
        </p>
        <pre className="bg-gray-100 rounded-lg p-4 text-xs overflow-auto">
          {JSON.stringify(created, null, 2)}
        </pre>
        <a
          href="/merchant/dashboard"
          className="inline-block mt-4 text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-100"
        >
          Go to dashboard →
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-1">Create a merchant</h1>
      <p className="text-gray-500 text-sm mb-6">
        This calls the real API and writes a row into your Railway database.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Spend threshold
            </label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2"
              value={form.thresholdAmount}
              onChange={(e) => update("thresholdAmount", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Stars per threshold
            </label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2"
              value={form.starsPerThreshold}
              onChange={(e) => update("starsPerThreshold", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Redemption target (stars)
          </label>
          <input
            type="number"
            min={1}
            className="w-full border rounded-lg px-3 py-2"
            value={form.redemptionTarget}
            onChange={(e) => update("redemptionTarget", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Reward description
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.rewardDescription}
            onChange={(e) => update("rewardDescription", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reward type</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.rewardType}
            onChange={(e) => update("rewardType", e.target.value)}
          >
            {REWARD_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-lg bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "saving" ? "Creating..." : "Create merchant"}
        </button>
      </form>
    </main>
  );
}
