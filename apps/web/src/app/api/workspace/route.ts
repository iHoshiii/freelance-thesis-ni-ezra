import { loadDashboard, loadStatistics, statisticsPeriod } from "@/lib/dashboard-data";
import { loadWorkspace, loadDevices } from "@/lib/scans/repository";
import { parseFilters } from "@/lib/scans/filters";

const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  try {
    switch (params.view) {
      case "dashboard": {
        const data = await loadDashboard();
        return data.workspace.status === "unavailable" ? reply({ error: "Cannot load workspace data. Check the database connection." }, 503) : reply(data);
      }
      case "scans": {
        let filters;
        try { filters = parseFilters(params); }
        catch { return reply({ error: "Check the scan filters." }, 400); }
        const data = await loadWorkspace(filters);
        return data.status === "unavailable" ? reply({ error: "Cannot load scans. Check the database connection." }, 503) : reply(data);
      }
      case "statistics": {
        const period = statisticsPeriod(params.period);
        const location = (params.location ?? "").slice(0, 120);
        const [statistics, workspace] = await Promise.all([loadStatistics(period, location), loadDevices()]);
        if (workspace.status === "unavailable" || (workspace.status === "ready" && !statistics)) return reply({ error: "Cannot load statistics. Check the database connection." }, 503);
        return reply({ statistics, locations: workspace.locations, lastUpload: workspace.lastUpload });
      }
      default: return reply({ error: "Unknown workspace view." }, 400);
    }
  } catch { return reply({ error: "Workspace unavailable. Try again." }, 503); }
}
