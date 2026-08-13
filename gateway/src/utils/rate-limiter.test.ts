import { test, describe, beforeEach, afterEach, mock, Mock } from "node:test";
import assert from "node:assert/strict";
import { rateLimitAndTimeout, clearRequestStore } from "./rate-limiter.js"; // Adjust path as needed
import { Request, Response, NextFunction } from "express";

describe("rateLimitAndTimeout Middleware", () => {
  let req: Partial<Request>;
  let nextCalled: boolean;
  const next: NextFunction = () => {
    nextCalled = true;
  };
  let res: Partial<Response> & {
    status: Mock<(code: number) => any>;
    json: Mock<(data: any) => any>;
  };

  beforeEach(() => {
    // Enable fake timers to control setInterval and avoid waiting real time
    mock.timers.enable({ apis: ["setInterval"] });
    const statusMock = mock.fn(function (this: any, code: number) {
      return this;
    });
    const jsonMock = mock.fn(function (this: any, data: any) {
      return this;
    });

    nextCalled = false;
    req = { ip: "127.0.0.1" };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    mock.timers.reset();
  });

  test("should allow all requests smoothly under the limit of 15", () => {
    for (let i = 0; i < 15; i++) {
      nextCalled = false;
      rateLimitAndTimeout(req as Request, res as Response, next);
      assert.equal(nextCalled, true);
    }
  });

  test("should track requests independently per IP address", () => {
    const reqIp1 = { ip: "10.0.0.1" } as Request;
    const reqIp2 = { ip: "10.0.0.2" } as Request;

    // Max out IP 1
    for (let i = 0; i < 15; i++) {
      rateLimitAndTimeout(reqIp1, res as Response, next);
    }

    // IP 2 should still be allowed
    nextCalled = false;
    rateLimitAndTimeout(reqIp2, res as Response, next);
    assert.equal(nextCalled, true);
  });

  test("should reject the (n+1)th request with 429 status", () => {
    // Use a fresh IP to avoid conflicts with previous tests
    const freshReq = { ip: "192.168.1.100" } as Request;
    // Send 15 allowed requests
    for (let i = 0; i < 15; i++) {
      rateLimitAndTimeout(freshReq, res as Response, next);
    }

    nextCalled = false;
    rateLimitAndTimeout(freshReq, res as Response, next);

    assert.equal(nextCalled, false);
    assert.equal(res.status.mock.calls[0].arguments[0], 429);
    assert.deepEqual(res.json.mock.calls[0].arguments[0], {
      code: 429,
      status: "Error",
      message: "Rate limit exceeded. Try after sometime",
      data: null,
    });
  });

  test("should clear requestStore after 60 seconds and allow new requests", () => {
    // Use a fresh IP to avoid conflicts with previous tests
    const freshReq = { ip: "172.16.0.50" } as Request;

    // Send 15 allowed requests to hit the limit
    for (let i = 0; i < 15; i++) {
      rateLimitAndTimeout(freshReq, res as Response, next);
    }

    // Verify the 16th request is rejected
    nextCalled = false;
    rateLimitAndTimeout(freshReq, res as Response, next);
    assert.equal(nextCalled, false, "16th request should be rejected");
    assert.equal(res.status.mock.calls[0].arguments[0], 429);

    // Simulate the 60-second interval by clearing the requestStore
    // This is what the setInterval does every 60 seconds
    clearRequestStore();

    // Reset the mock calls to check fresh behavior
    res.status = mock.fn(function (this: any, code: number) {
      return this;
    });
    res.json = mock.fn(function (this: any, data: any) {
      return this;
    });

    // After clearing, the first request should now be allowed
    nextCalled = false;
    rateLimitAndTimeout(freshReq, res as Response, next);
    assert.equal(
      nextCalled,
      true,
      "First request after interval should be allowed (requestStore cleared)",
    );

    // Verify that multiple requests are allowed again
    for (let i = 1; i < 15; i++) {
      nextCalled = false;
      rateLimitAndTimeout(freshReq, res as Response, next);
      assert.equal(
        nextCalled,
        true,
        `Request ${i + 1} should be allowed after interval`,
      );
    }

    // And the 16th should be rejected again
    nextCalled = false;
    rateLimitAndTimeout(freshReq, res as Response, next);
    assert.equal(
      nextCalled,
      false,
      "16th request in new interval should be rejected",
    );
  });
});
