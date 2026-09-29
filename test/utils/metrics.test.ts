describe("Metrics Utility", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetModules();
  });

  test("should increment basic counters accurately", () => {
    jest.isolateModules(() => {
      const metrics = require("../../src/utils/metrics").default;

      metrics.recordStat("incomingRequests");
      metrics.recordStat("incomingRequests");
      metrics.recordStat("cacheHits");

      const stats = metrics.getMetrics();
      expect(stats.incomingRequests).toBe(2);
      expect(stats.cacheHits).toBe(1);
      expect(stats.apiErrors).toBe(0);
    });
  });

  test("should track unique site requests correctly", () => {
    jest.isolateModules(() => {
      const metrics = require("../../src/utils/metrics").default;

      metrics.recordSiteRequest(1001);
      metrics.recordSiteRequest(1001); // duplicate
      metrics.recordSiteRequest(1002);

      const stats = metrics.getMetrics();
      expect(stats.uniqueSiteIds).toBe(2);
    });
  });

  test("should drop site requests older than 24 hours", () => {
    jest.isolateModules(() => {
      const metrics = require("../../src/utils/metrics").default;

      // Request now
      metrics.recordSiteRequest(2001);

      // Advance time by 25 hours
      jest.advanceTimersByTime(25 * 60 * 60 * 1000);

      // New request
      metrics.recordSiteRequest(2002);

      const stats = metrics.getMetrics();
      // Only 2002 should be counted as recent
      expect(stats.uniqueSiteIds).toBe(1);
    });
  });

  test("should maintain 24-hour rolling bucket sums", () => {
    jest.isolateModules(() => {
      const metrics = require("../../src/utils/metrics").default;

      // Hour 1
      metrics.recordStat("apiRequests");

      // Advance 1 hour
      jest.advanceTimersByTime(1 * 60 * 60 * 1000);

      // Hour 2
      metrics.recordStat("apiRequests");
      metrics.recordStat("apiRequests");

      let stats = metrics.getMetrics();
      // 1 from Hour 1 + 2 from Hour 2
      expect(stats.apiRequests).toBe(3);

      // Advance 24 hours to push Hour 1 and Hour 2 out of the window
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      stats = metrics.getMetrics();
      // Buckets should have rolled out
      expect(stats.apiRequests).toBe(0);
    });
  });
});
