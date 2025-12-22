import { config } from "./config";

export async function apiFetch(path: string) {
  const res = await fetch(`${config.apiUrl}${path}`);
  return res.json();
}
