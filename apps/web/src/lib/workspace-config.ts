import "server-only";

export function workspaceConfig() {
  const raw = process.env.WORKSPACE_DEVICE_IDS ?? "";
  const deviceIds = [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))];
  const valid = deviceIds.length > 0 && deviceIds.length <= 50
    && deviceIds.every((id) => /^[a-zA-Z0-9_-]{1,64}$/.test(id));
  return { database: Boolean(process.env.DATABASE_URL), deviceIds: valid ? deviceIds : [], valid };
}
