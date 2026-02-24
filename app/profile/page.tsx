"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/features/auth/AuthContext";
import { auth } from "@/lib/firebase/clientApp";
import { PASS_TYPES } from "@/types/passes";
import { generatePassPDF } from "@/features/passes/pdfGenerator.client";
import { NON_TECHNICAL_EVENTS, TECHNICAL_EVENTS } from "@/data/events";
import { Download, Pencil, X } from "lucide-react";

type RegistrationStatus = "pending" | "converted" | "cancelled";

interface UserProfileResponse {
  uid: string;
  email: string | null;
  name: string | null;
  college: string | null;
  phone: string | null;
  isOrganizer: boolean;
  createdAt: string | null;
}

interface RegistrationDoc {
  id: string;
  passType: string;
  selectedDays: string[];
  selectedEvents: string[];
  calculatedAmount: number;
  status: RegistrationStatus;
  createdAt?: string | null;
  teamData?: any;
}

interface EventAccess {
  tech: boolean;
  nonTech: boolean;
  proshowDays: string[];
  fullAccess: boolean;
}

interface TeamSnapshotMember {
  memberId: string;
  name: string;
  phone: string;
  isLeader: boolean;
  checkedIn: boolean;
}

interface TeamSnapshot {
  teamName: string;
  totalMembers: number;
  members: TeamSnapshotMember[];
}

interface PassDoc {
  id: string;
  passType: string;
  amount: number;
  status: "paid" | "used" | string;
  qrCode: string;
  paymentId: string;
  createdAt: string | null;
  usedAt: string | null;
  selectedEvents: string[];
  selectedDays: string[];
  eventAccess: EventAccess | null;
  teamSnapshot: TeamSnapshot | null;
}

type EditableTeamMember = {
  name: string;
  phone: string;
  email?: string;
};

type EditableTeamData = {
  teamName: string;
  leaderName: string;
  leaderPhone: string;
  leaderCollege: string;
  members: EditableTeamMember[];
};

const EVENT_DATA_MAP: Record<
  string,
  { id: string; name: string; venue?: string; startTime?: string; endTime?: string }
> = {};

[...NON_TECHNICAL_EVENTS, ...TECHNICAL_EVENTS].forEach((e) => {
  EVENT_DATA_MAP[e.id] = {
    id: e.id,
    name: e.name,
    venue: e.venue,
    startTime: e.startTime,
    endTime: e.endTime,
  };
});

const passTypeLabel: Record<string, string> = {
  day_pass: PASS_TYPES.DAY_PASS.name,
  group_events: PASS_TYPES.GROUP_EVENTS.name,
  proshow: PASS_TYPES.PROSHOW.name,
  sana_concert: PASS_TYPES.SANA_CONCERT.name,
  mock_summit: PASS_TYPES.MOCK_SUMMIT.name,
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProfilePage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationDoc[]>([]);
  const [passes, setPasses] = useState<PassDoc[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editSelectedDays, setEditSelectedDays] = useState<string>("");
  const [editSelectedEvents, setEditSelectedEvents] = useState<string>("");
  const [editTeamData, setEditTeamData] = useState<EditableTeamData | null>(null);

  const [downloadingPassId, setDownloadingPassId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      // Require authenticated user – redirect to registration entry
      router.push("/register");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const token = await user.getIdToken();

        const [profileRes, regsRes, passesRes] = await Promise.all([
          fetch("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/users/registrations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/users/passes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (cancelled) return;

        if (!profileRes.ok) {
          throw new Error("Failed to load profile");
        }
        const profileJson = await profileRes.json();

        if (!regsRes.ok) {
          throw new Error("Failed to load registrations");
        }
        const regsJson = await regsRes.json();

        if (!passesRes.ok) {
          throw new Error("Failed to load passes");
        }
        const passesJson = await passesRes.json();

        if (cancelled) return;

        setProfile(profileJson as UserProfileResponse);
        setRegistrations((regsJson.registrations as RegistrationDoc[]) ?? []);
        setPasses((passesJson.passes as PassDoc[]) ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile data"
          );
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const activePass = useMemo(() => {
    if (!passes || passes.length === 0) return null;
    // Prefer latest paid pass
    const paid = passes.find((p) => p.status === "paid");
    return paid ?? passes[0];
  }, [passes]);

  const pendingRegistration = useMemo(() => {
    if (!registrations || registrations.length === 0) return null;
    const firstPending = registrations.find((r) => r.status === "pending");
    if (!firstPending) return null;
    // Once a pass exists, we hide edit according to rules
    if (activePass) return null;
    return firstPending;
  }, [registrations, activePass]);

  const canEditRegistration =
    pendingRegistration && pendingRegistration.status === "pending" && !activePass;

  const handleOpenEdit = () => {
    if (!canEditRegistration || !pendingRegistration) return;
    setEditError(null);

    setEditSelectedDays((pendingRegistration.selectedDays || []).join(", "));
    setEditSelectedEvents((pendingRegistration.selectedEvents || []).join(", "));

    if (pendingRegistration.passType === "group_events" && pendingRegistration.teamData) {
      const td = pendingRegistration.teamData as any;
      const leader = td.leader || {};
      const members = Array.isArray(td.members) ? td.members : [];

      const editable: EditableTeamData = {
        teamName: (td.teamName as string) || "",
        leaderName: (leader.name as string) || "",
        leaderPhone: (leader.phone as string) || "",
        leaderCollege: (leader.college as string) || "",
        members: members.map((m: any) => ({
          name: (m.name as string) || "",
          phone: (m.phone as string) || "",
          email: (m.email as string) || "",
        })),
      };
      setEditTeamData(editable);
    } else {
      setEditTeamData(null);
    }

    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (editSaving) return;
    setEditOpen(false);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!pendingRegistration || !user) return;
    if (pendingRegistration.status !== "pending") {
      setEditError("Only pending registrations can be edited.");
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);

      const selectedDaysArray = editSelectedDays
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      const selectedEventsArray = editSelectedEvents
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      let teamDataPayload: any = undefined;
      let teamMemberCount: number | undefined = undefined;

      if (pendingRegistration.passType === "group_events" && editTeamData) {
        const members = editTeamData.members || [];
        teamMemberCount = 1 + members.length;

        teamDataPayload = {
          teamName: editTeamData.teamName.trim(),
          leader: {
            name: editTeamData.leaderName.trim(),
            phone: editTeamData.leaderPhone.trim(),
            college: editTeamData.leaderCollege.trim(),
          },
          members: members.map((m) => ({
            name: m.name.trim(),
            phone: m.phone.trim(),
            email: (m.email || "").trim(),
          })),
        };
      }

      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        throw new Error("Not signed in");
      }

      const res = await fetch("/api/registration/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId: pendingRegistration.id,
          passType: pendingRegistration.passType,
          selectedEvents: selectedEventsArray,
          selectedDays: selectedDaysArray,
          teamMemberCount,
          teamData: teamDataPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update registration");
      }

      const updated = data.registration as RegistrationDoc;
      setRegistrations((prev) =>
        prev.map((r) => (r.id === pendingRegistration.id ? updated : r))
      );

      setEditOpen(false);
    } catch (err) {
      console.error("Edit registration error:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update registration"
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleDownloadPDF = async (pass: PassDoc) => {
    if (!user) return;
    setDownloadingPassId(pass.id);
    try {
      await generatePassPDF({
        userId: user.uid,
        passType: passTypeLabel[pass.passType] ?? pass.passType,
        amount: pass.amount,
        qrCode: pass.qrCode,
        teamName: pass.teamSnapshot?.teamName,
        members: pass.teamSnapshot?.members,
        selectedEvents: (pass.selectedEvents ?? []).map((slug: string) => {
          const eventData = EVENT_DATA_MAP[slug];
          if (eventData) return eventData;
          return {
            id: slug,
            name: slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
          };
        }),
      });
    } catch (e) {
      console.error("Error downloading PDF:", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPassId(null);
    }
  };

  if (loading || initialLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-[60vh] flex items-center justify-center bg-zinc-900 text-zinc-100">
          <p className="text-zinc-400 text-sm">Loading your profile…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <main className="min-h-[60vh] flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 px-4">
          <p className="mb-6 text-zinc-300 text-sm">
            Sign in to view your profile and registration.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded bg-white px-6 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Sign in with Google
          </button>
        </main>
        <Footer />
      </>
    );
  }

  const emptyState =
    !activePass && !pendingRegistration && !error ? (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-10 text-center">
        <p className="text-zinc-300 mb-3 text-sm">
          No registration found for your account.
        </p>
        <p className="text-xs text-zinc-500">
          Start by creating a new registration from the registration page.
        </p>
      </div>
    ) : null;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-zinc-900 text-zinc-100 px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-50">
              Profile & Registration
            </h1>
            <p className="text-sm text-zinc-400">
              View your profile, pending registrations and official passes for
              CIT Takshashila 2026.
            </p>
          </header>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Section 1 — User Information */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
                User Information
              </h2>
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                Verified profile
              </span>
            </div>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Name
                </p>
                <p className="font-medium text-zinc-100">
                  {profile?.name || user.displayName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Email
                </p>
                <p className="font-medium text-zinc-100 break-all">
                  {profile?.email || user.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Phone
                </p>
                <p className="font-medium text-zinc-100">
                  {profile?.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  College
                </p>
                <p className="font-medium text-zinc-100">
                  {profile?.college || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 — Official Pass (shown first if exists) */}
          {activePass && (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
                    Official Pass
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Your on-spot payment has been confirmed and a QR pass has
                    been generated.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                  Payment Confirmed
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
                <div className="space-y-3 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        Pass Type
                      </p>
                      <p className="font-medium text-zinc-100">
                        {passTypeLabel[activePass.passType] ??
                          activePass.passType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        Amount
                      </p>
                      <p className="font-medium text-zinc-100">
                        ₹{activePass.amount.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        Status
                      </p>
                      <p className="font-medium text-zinc-100">
                        {activePass.status === "used" ? "Used" : "Paid"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        Created
                      </p>
                      <p className="font-medium text-zinc-100">
                        {formatDate(activePass.createdAt)}
                      </p>
                    </div>
                  </div>

                  {activePass.selectedDays?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        Access Days
                      </p>
                      <p className="font-medium text-zinc-100">
                        {activePass.selectedDays.join(", ")}
                      </p>
                    </div>
                  )}

                  {activePass.selectedEvents?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        Events
                      </p>
                      <p className="font-medium text-zinc-100">
                        {activePass.selectedEvents
                          .map((slug) => EVENT_DATA_MAP[slug]?.name || slug)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(activePass)}
                    disabled={downloadingPassId === activePass.id}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-100 hover:border-zinc-500 hover:bg-zinc-750 disabled:opacity-50"
                  >
                    {downloadingPassId === activePass.id ? (
                      <span>Generating PDF…</span>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download Pass PDF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* QR container – only render when pass exists */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-6">
                  <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">
                    Scan at entry gates
                  </p>
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activePass.qrCode}
                      alt="Pass QR Code"
                      className="h-44 w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4 — Group details if group_events */}
              {activePass.passType === "group_events" &&
                activePass.teamSnapshot && (
                  <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Group Details
                    </h3>
                    <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                          Team Name
                        </p>
                        <p className="font-medium text-zinc-100">
                          {activePass.teamSnapshot.teamName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                          Total Members
                        </p>
                        <p className="font-medium text-zinc-100">
                          {activePass.teamSnapshot.totalMembers}
                        </p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-md border border-zinc-800">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-zinc-900/80 text-zinc-400">
                          <tr>
                            <th className="px-3 py-2 font-medium">Name</th>
                            <th className="px-3 py-2 font-medium">Phone</th>
                            <th className="px-3 py-2 font-medium">Role</th>
                            <th className="px-3 py-2 font-medium">
                              Checked In
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-950/40">
                          {activePass.teamSnapshot.members.map((m) => (
                            <tr key={m.memberId}>
                              <td className="px-3 py-2 text-zinc-100">
                                {m.name}
                              </td>
                              <td className="px-3 py-2 text-zinc-300">
                                {m.phone}
                              </td>
                              <td className="px-3 py-2 text-zinc-300">
                                {m.isLeader ? "Leader" : "Member"}
                              </td>
                              <td className="px-3 py-2 text-zinc-300">
                                {m.checkedIn ? "Yes" : "No"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </section>
          )}

          {/* Section 2 — Pending registration (only when no official pass) */}
          {pendingRegistration && (
            <section className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-6 py-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-amber-100">
                    Pending Registration
                  </h2>
                  <p className="text-xs text-amber-200/90 mt-1">
                    Your registration has been saved. Complete payment on spot
                    to receive your official QR pass.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-50">
                  Pending
                </span>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-200/80 mb-1">
                    Pass Type
                  </p>
                  <p className="font-medium text-amber-50">
                    {passTypeLabel[pendingRegistration.passType] ??
                      pendingRegistration.passType}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-200/80 mb-1">
                    Amount
                  </p>
                  <p className="font-medium text-amber-50">
                    ₹{pendingRegistration.calculatedAmount.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-200/80 mb-1">
                    Created
                  </p>
                  <p className="font-medium text-amber-50">
                    {formatDate(pendingRegistration.createdAt || undefined)}
                  </p>
                </div>
                {pendingRegistration.selectedDays?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-200/80 mb-1">
                      Selected Days
                    </p>
                    <p className="font-medium text-amber-50">
                      {pendingRegistration.selectedDays.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {pendingRegistration.selectedEvents?.length > 0 && (
                <div className="text-sm">
                  <p className="text-xs uppercase tracking-wide text-amber-200/80 mb-1">
                    Selected Events
                  </p>
                  <p className="font-medium text-amber-50">
                    {pendingRegistration.selectedEvents
                      .map((slug) => EVENT_DATA_MAP[slug]?.name || slug)
                      .join(", ")}
                  </p>
                </div>
              )}

              <p className="mt-2 text-xs text-amber-100/90">
                Payment must be completed on spot to receive official QR pass.
                No QR is generated while your registration is pending.
              </p>

              {canEditRegistration && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="inline-flex items-center gap-2 rounded-md border border-amber-300/50 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-50 hover:bg-amber-500/30"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit Registration</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {emptyState}
        </div>

        {/* Edit registration modal */}
        {editOpen && pendingRegistration && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
                    Edit Registration
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    You can edit your selected days, events and team details
                    while the registration is pending.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Selected Days
                  </label>
                  <input
                    type="text"
                    value={editSelectedDays}
                    onChange={(e) => setEditSelectedDays(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
                    placeholder="Comma-separated days (e.g. 2026-03-01, 2026-03-02)"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Selected Events
                  </label>
                  <input
                    type="text"
                    value={editSelectedEvents}
                    onChange={(e) => setEditSelectedEvents(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
                    placeholder="Comma-separated event IDs"
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Use event IDs as shown during registration. Validation is
                    re-run on save.
                  </p>
                </div>

                {pendingRegistration.passType === "group_events" && editTeamData && (
                  <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Team Details
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={editTeamData.teamName}
                          onChange={(e) =>
                            setEditTeamData({
                              ...editTeamData,
                              teamName: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Leader Name
                        </label>
                        <input
                          type="text"
                          value={editTeamData.leaderName}
                          onChange={(e) =>
                            setEditTeamData({
                              ...editTeamData,
                              leaderName: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Leader Phone
                        </label>
                        <input
                          type="text"
                          value={editTeamData.leaderPhone}
                          onChange={(e) =>
                            setEditTeamData({
                              ...editTeamData,
                              leaderPhone: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Leader College
                        </label>
                        <input
                          type="text"
                          value={editTeamData.leaderCollege}
                          onChange={(e) =>
                            setEditTeamData({
                              ...editTeamData,
                              leaderCollege: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Members
                      </p>
                      {editTeamData.members.map((member, idx) => (
                        <div
                          key={idx}
                          className="grid gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 p-2 text-xs sm:grid-cols-3"
                        >
                          <div>
                            <label className="mb-0.5 block text-[10px] uppercase tracking-wide text-zinc-500">
                              Name
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => {
                                const nextMembers = [...editTeamData.members];
                                nextMembers[idx] = {
                                  ...nextMembers[idx],
                                  name: e.target.value,
                                };
                                setEditTeamData({
                                  ...editTeamData,
                                  members: nextMembers,
                                });
                              }}
                              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[10px] uppercase tracking-wide text-zinc-500">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={member.phone}
                              onChange={(e) => {
                                const nextMembers = [...editTeamData.members];
                                nextMembers[idx] = {
                                  ...nextMembers[idx],
                                  phone: e.target.value,
                                };
                                setEditTeamData({
                                  ...editTeamData,
                                  members: nextMembers,
                                });
                              }}
                              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[10px] uppercase tracking-wide text-zinc-500">
                              Email
                            </label>
                            <input
                              type="text"
                              value={member.email || ""}
                              onChange={(e) => {
                                const nextMembers = [...editTeamData.members];
                                nextMembers[idx] = {
                                  ...nextMembers[idx],
                                  email: e.target.value,
                                };
                                setEditTeamData({
                                  ...editTeamData,
                                  members: nextMembers,
                                });
                              }}
                              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editError && (
                  <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {editError}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

