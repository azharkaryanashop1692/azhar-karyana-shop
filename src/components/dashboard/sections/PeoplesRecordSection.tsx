"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, Info, MapPin, Phone, Plus, Save } from "lucide-react";
import { deletePerson, getPeople, savePerson, type Person } from "@/app/dashboard/peopleActions";
import type { OrderItem } from "@/app/dashboard/orderActions";
import { PERSON_STATUSES, type PersonStatus } from "@/lib/personStatus";
import {
  ActionBar,
  Badge,
  Card,
  EditDeleteActions,
  EmptyState,
  PrimaryButton,
  SearchInput,
  StatusSelect,
  cn,
  formatRs,
  matches,
  playBeep,
} from "../ui";
import {
  CardItemsPreview,
  ConfirmDeleteModal,
  ItemAdder,
  ItemsList,
  Modal,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../popup";

const statusTone = (s: PersonStatus) => (s === "Pending" ? "amber" : "green");

export default function PeoplesRecordSection({
  people,
  setPeople,
}: {
  /** Cached people (preloaded with the dashboard); null until first loaded. */
  people: Person[] | null;
  setPeople: (update: (ps: Person[] | null) => Person[] | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  // Popups: "new" = create, a Person = update that person.
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const [viewing, setViewing] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState<Person | null>(null);

  // Show the cached people immediately, then refresh them in the background.
  useEffect(() => {
    let active = true;
    getPeople().then(({ people, error }) => {
      if (!active) return;
      if (error) setLoadError(error);
      else setPeople(() => people);
    });
    return () => {
      active = false;
    };
  }, [setPeople]);

  const visible = (people ?? []).filter(
    (p) =>
      (!status || p.status === status) &&
      matches(query, p.name, p.phone, p.location, p.note, ...p.items.map((i) => i.name)),
  );

  return (
    <div className="space-y-6">
      <ActionBar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search by person name..." />
        <StatusSelect value={status} onChange={setStatus} options={[...PERSON_STATUSES]} />
        <PrimaryButton onClick={() => setEditing("new")}>Add New Person</PrimaryButton>
      </ActionBar>

      {people === null ? (
        <EmptyState>{loadError || "Loading people..."}</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>{people.length ? "No people match your search." : "No people yet."}</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((p) => (
            <Card key={p.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 font-semibold uppercase text-white">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-white">{p.name}</h3>
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewing(p)}
                    aria-label="View"
                    className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="size-4" />
                  </button>
                  <EditDeleteActions onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
                </div>
              </div>

              <ContactLines person={p} />

              <CardItemsPreview items={p.items} onMore={() => setViewing(p)} totalLabel="Total Price" />

              <NoteBox note={p.note} />

              <p className="mt-auto truncate border-t border-white/5 pt-3 text-sm text-muted">
                Created by: <span className="font-medium text-white">{p.creator}</span>
              </p>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <PersonFormModal
          person={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null);
            // Show the saved person right away: replace if updated, else add first.
            setPeople((ps) => {
              const list = ps ?? [];
              return list.some((p) => p.id === saved.id)
                ? list.map((p) => (p.id === saved.id ? saved : p))
                : [saved, ...list];
            });
          }}
        />
      )}
      {viewing && <ViewPersonModal person={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDeleteModal
          title="Delete Person"
          onConfirm={() => deletePerson(deleting.id)}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setPeople((ps) => (ps ?? []).filter((x) => x.id !== deleting.id));
            setDeleting(null);
          }}
        >
          Are you sure you want to delete <span className="font-semibold text-white">{deleting.name}</span>{" "}
          with total <span className="font-semibold text-white">{formatRs(deleting.totalPrice)}</span>? Their
          items will be deleted too. This cannot be undone.
        </ConfirmDeleteModal>
      )}
    </div>
  );
}

function ContactLines({ person }: { person: Person }) {
  if (!person.phone && !person.location) return null;
  return (
    <div className="space-y-1.5 text-sm text-muted">
      {person.phone && (
        <p className="flex items-center gap-2">
          <Phone className="size-4 shrink-0" /> {person.phone}
        </p>
      )}
      {person.location && (
        <p className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" /> <span className="min-w-0 break-words">{person.location}</span>
        </p>
      )}
    </div>
  );
}

function NoteBox({ note }: { note: string }) {
  return (
    <div className="flex gap-2 rounded-xl border border-white/5 bg-[#1a1a1a] p-3 text-sm text-muted">
      <Info className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="min-w-0 whitespace-pre-line break-words">{note || "No note"}</p>
    </div>
  );
}

function PersonFormModal({
  person,
  onClose,
  onSaved,
}: {
  /** null = create a new person. */
  person: Person | null;
  onClose: () => void;
  onSaved: (person: Person) => void;
}) {
  const isEdit = person !== null;
  const [name, setName] = useState(person?.name ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [location, setLocation] = useState(person?.location ?? "");
  const [status, setStatus] = useState<PersonStatus>(person?.status ?? PERSON_STATUSES[0]);
  const [note, setNote] = useState(person?.note ?? "");
  const [items, setItems] = useState<OrderItem[]>(person?.items ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() !== "" && !busy;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    playBeep();
    setBusy(true);
    setError("");
    const { person: saved, error } = await savePerson(
      { name, phone, location, status, note, items },
      person?.id,
    );
    setBusy(false);
    if (saved) onSaved(saved);
    else setError(error ?? "Could not save the person.");
  };

  return (
    <Modal title={isEdit ? "Update Person" : "Create Person"} onClose={onClose} busy={busy} wide>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted">Person Name</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Haji Sadiq Traders"
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-muted">Mobile No</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0300-1234567"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-muted">Status</span>
            <span className="relative block">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PersonStatus)}
                className={cn(inputClass, "appearance-none pr-9")}
              >
                {PERSON_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            </span>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted">Location</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Shop 7, Akbari Mandi"
            className={inputClass}
          />
        </label>

        <ItemAdder onAdd={(item) => setItems((list) => [...list, item])} />

        <ItemsList
          items={items}
          totalLabel="Total Price"
          onRemove={(i) => setItems((list) => list.filter((_, j) => j !== i))}
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted">Note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Write a note..."
            className={cn(inputClass, "resize-y")}
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
            {isEdit ? <Save className="size-4" /> : <Plus className="size-4" />}
            {busy ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Person" : "Create Person"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewPersonModal({ person, onClose }: { person: Person; onClose: () => void }) {
  return (
    <Modal title="Person Details" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-semibold uppercase text-white">
            {person.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-base font-semibold text-white">{person.name}</p>
              <Badge tone={statusTone(person.status)}>{person.status}</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted">
              {person.creator} · {formatDateTime(person.createdAt)}
            </p>
          </div>
        </div>
        <ContactLines person={person} />
        <ItemsList items={person.items} totalLabel="Total Price" />
        <NoteBox note={person.note} />
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
