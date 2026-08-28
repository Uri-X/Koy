"use client";

import { useState } from "react";
import { StarProgress } from "@/components/StarProgress";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Membership = {
  id: string;
  currentStars: number;
  merchant: {
    id: string;
    name: string;
    redemptionTarget: number;
    rewardDescription: string;
  };
};

export default function CustomerDashboardPage() {
  const [phone, setPhone] = useState("");
  const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "loaded" | "not_found">("idle");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [redeemStatus, setRedeemStatus] = useState<Record<string, "idle" | "redeeming" | "error">>({});
  const [redeemMsg, setRedeemMsg] = useState<Record<string, string>>({});

  async function loadDashboard() {
    if (!phone) return;
    setLoadStatus("loading");
    try {
      const userRes = await fetch(`${API_URL}/users/lookup?phone=${encodeURIComponent(phone)}`);
      if (!userRes.ok) throw new Error();
      const user = await userRes.json();
      if (!user) {
        setLoadStatus("not_found");
        return;
      }
      const memRes = await fetch(`${API_URL}/users/${user.id}/memberships`);
      const data = await memRes.json();
      setMemberships(data);
      setLoadStatus("loaded");
    } catch {
      setLoadStatus("not_found");
    }
  }

  async function handleRedeem(membership: Membership) {
    const userRes = await fetch(`${API_URL}/users/lookup?phone=${encodeURIComponent(phone)}`);
    const user = await userRes.json();

    setRedeemStatus((s) => ({ ...s, [membership.id]: "redeeming" }));
    try {
      const res = await fetch(`${API_URL}/redemptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: membership.merchant.id, userId: user.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Redemption failed");
      }
      const memRes = await fetch(`${API_URL}/users/${user.id}/memberships`);
      const data = await memRes.json();
      setMemberships(data);
      setRedeemStatus((s) => ({ ...s, [membership.id]: "idle" }));
      setRedeemMsg((m) => ({ ...m, [membership.id]: "Redeemed! Show this to staff to claim your reward." }));
    } catch (err: any) {
      setRedeemStatus((s) => ({ ...s, [membership.id]: "error" }));
      setRedeemMsg((m) => ({ ...m, [membership.id]: err.message || "Something went wrong" }));
    }
  }

  if (loadStatus !== "loaded") {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-1">My rewards</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your phone number to see your stars.
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0712345678"
          />
          <button
            onClick={loadDashboard}
            className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            View
          </button>
        </div>
        {loadStatus === "loading" && (
          <p className="text-sm text-gray-500 mt-2">Loading…</p>
        )}
        {loadStatus === "not_found" && (
          <p className="text-sm text-red-600 mt-2">
            No account found with that phone.{" "}
            <a href="/customer/signup" className="underline">
              Sign up
            </a>
            .
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My rewards</h1>
        <button
          onClick={() => setLoadStatus("idle")}
          className="text-sm text-gray-500 hover:underline"
        >
          Switch account
        </button>
      </div>

      {memberships.length === 0 && (
        <p className="text-gray-500 text-sm">
          You haven't joined any loyalty programs yet.
        </p>
      )}

      <div className="space-y-8">
        {memberships.map((m) => {
          const canRedeem = m.currentStars >= m.merchant.redemptionTarget;
          const rStatus = redeemStatus[m.id] ?? "idle";
          return (
            <div key={m.id} className="border rounded-xl p-4">
              <h2 className="text-lg font-bold mb-1">{m.merchant.name}</h2>
              <p className="text-gray-600 mb-4 text-sm">
                {m.currentStars} / {m.merchant.redemptionTarget} stars &middot; reward:{" "}
                {m.merchant.rewardDescription}
              </p>

              <StarProgress current={m.currentStars} target={m.merchant.redemptionTarget} />

              <button
                disabled={!canRedeem || rStatus === "redeeming"}
                onClick={() => handleRedeem(m)}
                className="mt-4 rounded-lg px-4 py-2 font-medium text-white disabled:bg-gray-300 bg-amber-600 hover:bg-amber-700 disabled:cursor-not-allowed"
              >
                {rStatus === "redeeming"
                  ? "Redeeming..."
                  : canRedeem
                  ? "Redeem reward"
                  : `${m.merchant.redemptionTarget - m.currentStars} more to redeem`}
              </button>

              {redeemMsg[m.id] && (
                <p
                  className={`mt-2 text-sm ${
                    rStatus === "error" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {redeemMsg[m.id]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
