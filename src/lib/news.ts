/** React hook for the live Israeli news headlines. */
import { useQuery } from "@tanstack/react-query";
import { getIsraelNews } from "./news.functions";
import type { NewsFeed } from "./news-types";

export function useNews() {
  return useQuery<NewsFeed>({
    queryKey: ["israel-news"],
    queryFn: () => getIsraelNews(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
