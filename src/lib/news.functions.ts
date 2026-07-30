import { createServerFn } from "@tanstack/react-start";
import { fetchIsraelNews } from "./news.server";

export const getIsraelNews = createServerFn({ method: "GET" }).handler(async () => fetchIsraelNews());
