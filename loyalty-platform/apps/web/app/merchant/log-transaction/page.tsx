"use client";

// Transaction logging (PRD 6.2): merchant/staff looks up a customer by
// phone, enters spend amount, API auto-calculates stars per the
// merchant's earning rule and updates the customer's balance atomically.

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Merchant = { id: string; name: string; thresholdAmount: number; starsPerThreshold: number };
type Customer = { id: string; name: string; phone: string | null };

export default function LogTransactionPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/merchants`)
      .then((res) => res.json())
      .then((data) => {
        setMerchants(data);
        if (data.length > 0) setMerchantId(data[0].id);
      })
      .catch(() => setErrorMsg("Could not load merchants. Is the API running?"));
  }, []);

  const selectedMerchant = merchants.find((m) => m.id === merchantId);

  async function lookupCustomer() {
    if (!phone) return;
    setLookupStatus("searching");
    setCustomer(null);
    try {
      const res = await fetch(`${API_URL}/users/lookup?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data) {
        setLookupStatus("not_found");
        return;
      }
      setCustomer(data);
      setLookupStatus("found");
    } catch {
      setLookupStatus("not_found");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer) return;
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          userId: customer.id,
          amount: Number(amount),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  }

  function reset() {
    setPhone("");
    setCustomer(null);
    setLookupStatus("idle");
    setAmount("");
    setStatus("idle");
    setResult(null);
  }

  if (status === "done" && result) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-2">Transaction logged ✅</h1>
        <p className="text-gray-600 mb-4">
          <strong>{customer?.name}</strong> spent{" "}
          <strong>{amount}</strong> and earned stars. New balance shown below.
        </p>
        <pre className="bg-gray-100 rounded-lg p-4 text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
        <button
          onClick={reset}
          className="inline-block mt-4 text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-100"
        >
          Log another transaction
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-1">Log a transaction</h1>
      <p className="text-gray-500 text-sm mb-6">
        Enter the customer's phone and the amount spent. Stars are calculated
        automatically from the merchant's earning rule.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Merchant</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
        >
          {merchants.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {selectedMerchant && (
          <p className="text-xs text-gray-500 mt-1">
            Rule: spend {selectedMerchant.thresholdAmount} → earn{" "}
            {selectedMerchant.starsPerThreshold} star(s)
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Customer phone</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0712345678"
          />
          <button
            type="button"
            onClick={lookupCustomer}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Find
          </button>
        </div>
        {lookupStatus === "searching" && (
          <p className="text-xs text-gray-500 mt-1">Searching…</p>
        )}
        {lookupStatus === "found" && customer && (
          <p className="text-xs text-green-600 mt-1">
            Found: {customer.name}
          </p>
        )}
        {lookupStatus === "not_found" && (
          <p className="text-xs text-red-600 mt-1">
            No customer found with that phone. They need to sign up first.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount spent</label>
          <input
            type="number"
            min={0.01}
            step="0.01"
            className="w-full border rounded-lg px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={!customer || status === "saving"}
          className="w-full rounded-lg bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "saving" ? "Logging..." : "Log transaction"}
        </button>
      </form>
    </main>
  );
}