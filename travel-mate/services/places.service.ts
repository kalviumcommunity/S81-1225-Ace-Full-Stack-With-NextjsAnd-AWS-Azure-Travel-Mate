import { apiFetch } from "@/lib/api";

export const getPlaces = () => apiFetch("/places");
