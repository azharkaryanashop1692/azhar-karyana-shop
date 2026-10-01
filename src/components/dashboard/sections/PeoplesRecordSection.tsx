"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Info, MapPin, Phone, UserCheck } from "lucide-react";
import { people as initialPeople, peopleKpis } from "../mockData";
import {
  ActionBar,
  Badge,
  Card,
  EditDeleteActions,
  EmptyState,
  KpiCard,
  PrimaryButton,
  SearchInput,
  StatusSelect,
  formatRs,
  matches,
} from "../ui";

export default function PeoplesRecordSection() {
  const [people, setPeople] = useState(initialPeople);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visible = people.filter(
    (p) => (!status || p.status === status) && matches(query, p.name, p.phone, p.address),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={ArrowDownLeft} label="Total Receivable" value={peopleKpis.totalReceivable} />
        <KpiCard icon={ArrowUpRight} label="Total Payable" value={peopleKpis.totalPayable} tone="danger" />
        <KpiCard icon={UserCheck} label="Active People" value={peopleKpis.activePeople} tone="neutral" />
      </div>

      <ActionBar>
        <SearchInput value={query} onChange={setQuery} />
        <StatusSelect value={status} onChange={setStatus} options={["Pending", "Cleared"]} />
        <PrimaryButton>Add New Person</PrimaryButton>
      </ActionBar>

      {visible.length === 0 ? (
        <EmptyState>No people match your search.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((p) => (
            <Card key={p.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 font-semibold text-white">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    <Badge tone={p.status === "Pending" ? "amber" : "green"}>{p.status}</Badge>
                  </div>
                </div>
                <EditDeleteActions
                  onDelete={() => setPeople((ps) => ps.filter((x) => x.id !== p.id))}
                />
              </div>

              <div className="space-y-1.5 text-sm text-muted">
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" /> {p.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" /> {p.address}
                </p>
              </div>

              <div>
                <Badge tone={p.amount >= 0 ? "green" : "red"}>
                  {p.amount >= 0 ? "+" : "-"} {formatRs(Math.abs(p.amount))}
                </Badge>
              </div>

              <div className="flex gap-2 rounded-xl border border-white/5 bg-[#1a1a1a] p-3 text-sm text-muted">
                <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                <p>{p.info}</p>
              </div>

              <p className="mt-auto border-t border-white/5 pt-3 text-sm text-muted">
                Created by: <span className="font-medium text-white">{p.createdBy}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
