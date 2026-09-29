describe("Metrics Utility", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetModules();
  });

  test("should increment basic counters accurately", async () => {
    const { default: metrics } = await import("../../src/utils/metrics");

    metrics.recordStat("incomingRequests");
    metrics.recordStat("incomingRequests");
    metrics.recordStat("cacheHits");

    const stats = metrics.getMetrics();
    expect(stats.incomingRequests).toBe(2);
    expect(stats.cacheHits).toBe(1);
    expect(stats.apiErrors).toBe(0);
  });

  test("should track unique site requests correctly", async () => {
    const { default: metrics } = await import("../../src/utils/metrics");

    metrics.recordSiteRequest(1001);
    metrics.recordSiteRequest(1001);
    metrics.recordSiteRequest(1002);

    const stats = metrics.getMetrics();
    expect(stats.uniqueSiteIds).toBe(2);
  });

  test("should drop site requests older than 24 hours", async () => {
    const { default: metrics } = await import("../../src/utils/metrics");

    metrics.recordSiteRequest(2001);
    jest.advanceTimersByTime(25 * 60 * 60 * 1000);
    metrics.recordSiteRequest(2002);

    const stats = metrics.getMetrics();
    expect(stats.uniqueSiteIds).toBe(1);
  });

  test("should maintain 24-hour rolling bucket sums", async () => {
    const { default: metrics } = await import("../../src/utils/metrics");

    metrics.recordStat("apiRequests");
    jest.advanceTimersByTime(1 * 60 * 60 * 1000);
    metrics.recordStat("apiRequests");
    metrics.recordStat("apiRequests");

    let stats = metrics.getMetrics();
    expect(stats.apiRequests).toBe(3);

    jest.advanceTimersByTime(24 * 60 * 60 * 1000);

    stats = metrics.getMetrics();
    expect(stats.apiRequests).toBe(0);
  });
});
