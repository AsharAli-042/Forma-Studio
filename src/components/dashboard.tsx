"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { ArrowDownToLine, ArrowLeft, ArrowUpRight, Check, CheckCheck, ChevronLeft, ChevronRight, CircleHelp, Inbox, Info, LoaderCircle, LogOut, Mail, MessageSquare, Search, ShieldCheck, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { type Inquiry, type InquiryStatus, readDemoInquiries, statuses, statusLabels, writeDemoInquiries } from "@/lib/inquiries";
import { createClient } from "@/lib/supabase/browser";

function initials(name: string) { return name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase(); }
function dateLabel(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
function csvCell(value: string) {
  const safe = /^[=+@\-\t\r]/.test(value.trimStart()) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
const PAGE_SIZE = 8;
async function fetchInquiries(demo: boolean, signal?: AbortSignal): Promise<Inquiry[]> {
  if (demo) return readDemoInquiries();
  const response = await fetch("/api/inquiries", { cache: "no-store", signal });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not load inquiries.");
  return result.inquiries;
}

export function Dashboard({ demo, email }: { demo: boolean; email?: string }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [newStatus, setNewStatus] = useState<InquiryStatus>("new");
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const load = useCallback((signal?: AbortSignal) => fetchInquiries(demo, signal)
    .then(items => { if (!signal?.aborted) { setInquiries(items); setError(""); } })
    .catch(err => { if (!signal?.aborted) setError(err instanceof Error ? err.message : "Could not load inquiries."); })
    .finally(() => { if (!signal?.aborted) setLoading(false); }), [demo]);
  function reload() { setLoading(true); setError(""); void load(); }
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => { controller.abort(); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [load]);
  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }
  const filtered = inquiries.filter(item => (filter === "all" || item.status === filter) && `${item.name} ${item.email} ${item.service}`.toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const counts = { total: inquiries.length, new: inquiries.filter(i => i.status === "new").length, contacted: inquiries.filter(i => i.status === "contacted").length, completed: inquiries.filter(i => i.status === "completed").length };
  function openInquiry(inquiry: Inquiry) { setSelected(inquiry); setNewStatus(inquiry.status); setDetailError(""); }
  async function saveStatus() {
    if (!selected) return;
    setSaving(true);
    setDetailError("");
    try {
      if (demo) {
        const latest = readDemoInquiries().map(item => item.id === selected.id ? { ...item, status: newStatus } : item);
        writeDemoInquiries(latest);
        setInquiries(latest);
      } else {
        const response = await fetch("/api/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, status: newStatus }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not update the status.");
        setInquiries(items => items.map(item => item.id === selected.id ? { ...item, status: newStatus } : item));
      }
      setSelected(null);
      notify("Inquiry status updated.");
    } catch (err) { setDetailError(err instanceof Error ? err.message : "Could not save your change."); }
    finally { setSaving(false); }
  }
  function exportCsv() {
    const rows = [["Name", "Email", "Service", "Budget", "Message", "Status", "Received"], ...filtered.map(i => [i.name, i.email, i.service, i.budget, i.message, i.status, i.created_at])];
    const blob = new Blob(["\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `forma-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Exported ${filtered.length} ${filtered.length === 1 ? "inquiry" : "inquiries"}.`);
  }
  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) { setError("Could not sign out. Please try again."); return; }
    router.replace("/login");
    router.refresh();
  }
  return <div className="dashboard">
    <aside className="studio-sidebar"><Logo /><span className="workspace-label">STUDIO WORKSPACE</span><nav className="studio-nav" aria-label="Studio navigation"><Link href="/studio" className="active"><Inbox size={16} /> Inquiries <span>{counts.new}</span></Link><Link href="/"><ArrowUpRight size={16} /> View website</Link></nav><div className="sidebar-bottom"><div className="sidebar-note"><SparkleIcon /><strong>A little organization.<br />More room to create.</strong><p>Your next great project could be a conversation away.</p></div><div className="studio-profile"><span className="profile-avatar">FS</span><div><strong>Forma Studio</strong><small>{demo ? "Demo workspace" : email}</small></div>{!demo && <button aria-label="Sign out" onClick={signOut}><LogOut size={15} /></button>}</div></div></aside>
    <div className="studio-main"><header className="studio-topbar"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={11} /><strong>Inquiries</strong></div><div className="studio-live"><span />{demo ? "Demo workspace" : "Connected to your studio"}</div></header>
      <main className="studio-content"><div className="studio-title-row"><div><span className="eyebrow">A LITTLE CLARITY FOR YOUR DAY</span><h1>Your next chapter.</h1><p>Good conversations. New possibilities. All in one place.</p></div><Button variant="outline" onClick={exportCsv} disabled={loading || Boolean(error) || !filtered.length}><ArrowDownToLine size={15} /> Export CSV</Button></div>
        {demo && <div className="demo-banner"><Info size={15} /><p><strong>You’re exploring the demo.</strong> Changes stay in this browser. <Link href="/#contact">Submit a sample inquiry</Link> to try the complete flow.</p></div>}
        {error && <div className="form-error" role="alert">{error} <button className="underline ml-2" onClick={reload}>Try again</button></div>}
        <div className="stat-grid">{[
          { label: "Total inquiries", value: counts.total, note: "Every conversation starts here", icon: Inbox },
          { label: "New inquiries", value: counts.new, note: "Waiting for a hello", icon: Mail, highlight: true },
          { label: "Contacted", value: counts.contacted, note: "Conversations in progress", icon: MessageSquare },
          { label: "Completed", value: counts.completed, note: "A chapter well finished", icon: CheckCheck },
        ].map(stat => <div className={`stat-card ${stat.highlight ? "highlight" : ""}`} key={stat.label}><stat.icon size={17} strokeWidth={1.4} /><span className="stat-label">{stat.label}</span><div className="stat-value">{loading || error ? "—" : stat.value}</div><p className="stat-footnote">{stat.note}</p></div>)}</div>
        <section className="inquiries-panel" aria-label="Client inquiries"><div className="panel-heading"><h2>All inquiries <span className="count-pill">{loading || error ? "—" : inquiries.length}</span></h2><span>{demo ? "Your browser workspace" : "Latest 1,000 inquiries"}</span></div><div className="table-toolbar"><label className="search-box"><Search size={14} /><input aria-label="Search inquiries" placeholder="Search name, email, or service…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label><select className="filter-select" aria-label="Filter by status" value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }}><option value="all">All statuses</option>{statuses.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></div>
          {loading ? <div className="empty-state" role="status"><LoaderCircle size={26} className="animate-spin" /><p>Gathering your conversations…</p></div> : error ? <div className="empty-state"><CircleHelp size={28} /><h3>Let’s try that again.</h3><p>Your inquiries couldn’t be loaded.</p><Button variant="outline" onClick={() => void load()}>Reload inquiries</Button></div> : visible.length ? <div className="table-scroll"><table className="inquiry-table"><thead><tr><th scope="col">CLIENT</th><th scope="col">SERVICE</th><th scope="col">BUDGET</th><th scope="col">RECEIVED</th><th scope="col">STATUS</th><th scope="col"><span className="sr-only">Open inquiry</span></th></tr></thead><tbody>{visible.map((inquiry, index) => <tr key={inquiry.id}><td><div className="client-cell"><span className={`client-avatar avatar-${index % 4}`}>{initials(inquiry.name)}</span><div><strong>{inquiry.name}</strong><small>{inquiry.email}</small></div></div></td><td>{inquiry.service}</td><td>{inquiry.budget}</td><td>{dateLabel(inquiry.created_at)}</td><td><span className={`status-badge status-${inquiry.status}`}><i />{statusLabels[inquiry.status]}</span></td><td><button className="row-open" aria-label={`Open inquiry from ${inquiry.name}`} onClick={() => openInquiry(inquiry)}><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table></div> : <div className="empty-state"><Search size={27} /><h3>{inquiries.length ? "A little too quiet." : "Room for something new."}</h3><p>{inquiries.length ? "No inquiries match your search. Try another name or status." : "Your first inquiry will appear here when someone reaches out."}</p>{inquiries.length > 0 && <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); setPage(1); }}>Clear filters</Button>}</div>}
          <div className="panel-footer"><span>{loading ? "Loading…" : error ? "Unable to load" : filtered.length ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} inquiries` : "0 inquiries"}</span><div className="flex items-center gap-2"><Button size="icon" variant="ghost" aria-label="Previous page" disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={14} /></Button><span>{currentPage} / {pageCount}</span><Button size="icon" variant="ghost" aria-label="Next page" disabled={loading || currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={14} /></Button></div></div>
        </section><p className="studio-bottom-note"><ShieldCheck size={13} />{demo ? "Sample data for exploring the studio. Use fictional details in this demo." : "Only authorized studio members can access these inquiries."}</p>
      </main>
    </div>
    <Dialog.Root open={Boolean(selected)} onOpenChange={open => { if (!open && !saving) setSelected(null); }}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog-content" onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onPointerDownOutside={event => { if (saving) event.preventDefault(); }}>
      <Dialog.Title className="dialog-title">A new possibility.</Dialog.Title><Dialog.Description className="dialog-description">Review the project details and choose the next step.</Dialog.Description><Dialog.Close className="dialog-close" aria-label="Close inquiry" disabled={saving}><X size={19} /></Dialog.Close>
      {selected && <><dl className="detail-grid"><div><dt>Client</dt><dd>{selected.name}</dd></div><div><dt>Email</dt><dd><a className="underline underline-offset-4" href={`mailto:${selected.email}`}>{selected.email}</a></dd></div><div><dt>Service</dt><dd>{selected.service}</dd></div><div><dt>Budget</dt><dd>{selected.budget}</dd></div><div><dt>Received</dt><dd>{dateLabel(selected.created_at)}</dd></div><div><dt>Current status</dt><dd><span className={`status-badge status-${selected.status}`}>{statusLabels[selected.status]}</span></dd></div></dl><div className="detail-message"><span>About the project</span><p>{selected.message}</p></div><label className="status-control"><span>Update status</span><select value={newStatus} onChange={event => setNewStatus(event.target.value as InquiryStatus)} disabled={saving}>{statuses.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>{detailError && <p className="form-error" role="alert">{detailError}</p>}<div className="dialog-actions"><Button variant="outline" disabled={saving} onClick={() => setSelected(null)}>Cancel</Button><Button onClick={saveStatus} disabled={saving || newStatus === selected.status}>{saving && <LoaderCircle size={14} className="animate-spin" />}{saving ? "Saving…" : "Save changes"}</Button></div></>}
    </Dialog.Content></Dialog.Portal></Dialog.Root>
    {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
  </div>;
}
function SparkleIcon() { return <ArrowLeft size={20} style={{ transform: "rotate(135deg)", marginBottom: 9 }} />; }
