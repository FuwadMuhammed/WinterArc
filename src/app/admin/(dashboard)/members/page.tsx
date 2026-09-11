import { getMembersData } from "@/lib/admin/members-data";
import { MembersTable } from "@/components/admin/MembersTable";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return <SetupNotice />;

  const data = await getMembersData();
  const active = data.members.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Members</p>
        <h1 className="mt-1 font-heading text-3xl text-ink">
          {data.members.length} joined
          <span className="ml-3 text-lg text-ink-muted">{active} active</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Progress is weighted against the {data.releasedWeight} task units released through week{" "}
          {data.currentWeek}.
        </p>
      </header>

      <MembersTable members={data.members} />
    </div>
  );
}
