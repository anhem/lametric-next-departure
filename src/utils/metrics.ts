type HourlyStats = {
  incomingRequests: number;
  apiRequests: number;
  apiSuccesses: number;
  apiErrors: number;
  cacheHits: number;
  staleCacheHits: number;
  queueRejections: number;
};

const stats: HourlyStats = {
  incomingRequests: 0,
  apiRequests: 0,
  apiSuccesses: 0,
  apiErrors: 0,
  cacheHits: 0,
  staleCacheHits: 0,
  queueRejections: 0,
};

const pastBuckets: HourlyStats[] = [];
const siteIdTimestamps = new Map<number, number>();

setInterval(() => {
  pastBuckets.unshift({ ...stats });
  if (pastBuckets.length > 23) {
    pastBuckets.pop();
  }

  stats.incomingRequests = 0;
  stats.apiRequests = 0;
  stats.apiSuccesses = 0;
  stats.apiErrors = 0;
  stats.cacheHits = 0;
  stats.staleCacheHits = 0;
  stats.queueRejections = 0;

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, time] of siteIdTimestamps.entries()) {
    if (time <= oneDayAgo) {
      siteIdTimestamps.delete(id);
    }
  }
}, 60 * 60 * 1000).unref();

export default {
  recordStat: (key: keyof HourlyStats) => {
    stats[key]++;
  },
  recordSiteRequest: (siteId: number) => {
    siteIdTimestamps.set(siteId, Date.now());
  },
  getMetrics: () => {
    const allBuckets = [stats, ...pastBuckets];
    const sum = (key: keyof HourlyStats) =>
      allBuckets.reduce((total, bucket) => total + bucket[key], 0);

    let recentUniqueSites = 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const time of siteIdTimestamps.values()) {
      if (time > oneDayAgo) recentUniqueSites++;
    }

    return {
      incomingRequests: sum("incomingRequests"),
      apiRequests: sum("apiRequests"),
      apiSuccesses: sum("apiSuccesses"),
      apiErrors: sum("apiErrors"),
      cacheHits: sum("cacheHits"),
      staleCacheHits: sum("staleCacheHits"),
      queueRejections: sum("queueRejections"),
      uniqueSiteIds: recentUniqueSites,
    };
  }
};
