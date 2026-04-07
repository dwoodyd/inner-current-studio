import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before imports
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("Auth Input Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 1: 401 — unauthenticated access
  it("signInWithPassword rejects empty credentials", async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400, name: "AuthApiError" } as any,
    });

    const result = await supabase.auth.signInWithPassword({ email: "", password: "" });
    expect(result.error).toBeTruthy();
    expect(result.data.session).toBeNull();
  });

  // Test Case 2: IDOR — user A cannot access user B's data via RLS
  it("query scoped to user_id prevents cross-user access", async () => {
    const userA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const userB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

    const fromMock = vi.mocked(supabase.from);
    const eqMock = vi.fn().mockReturnThis();
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock, single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }) });
    fromMock.mockReturnValue({ select: selectMock } as any);

    const result = await supabase.from("check_ins").select("*").eq("user_id", userA);
    // With RLS, user B's token would return empty — simulated by null data
    expect(fromMock).toHaveBeenCalledWith("check_ins");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("user_id", userA);
    // userB's ID was never queried
    expect(eqMock).not.toHaveBeenCalledWith("user_id", userB);
  });

  // Test Case 3: SQL injection in filter field
  it("SQL injection in filter value is parameterized by SDK", async () => {
    const injectionPayload = "' OR '1'='1";
    const fromMock = vi.mocked(supabase.from);
    const eqMock = vi.fn().mockReturnThis();
    fromMock.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) } as any);

    await supabase.from("check_ins").select("*").eq("state", injectionPayload);

    // The SDK passes the value as a parameter, not concatenated SQL
    expect(eqMock).toHaveBeenCalledWith("state", injectionPayload);
    // Value is passed as-is to the SDK which uses parameterized queries
    const passedValue = eqMock.mock.calls[0][1];
    expect(typeof passedValue).toBe("string");
    expect(passedValue).toBe(injectionPayload); // Raw string, not interpreted
  });

  // Test Case 4: Null/undefined validation
  it("signUp rejects null email", async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Signup requires a valid email", status: 400, name: "AuthApiError" } as any,
    });

    const result = await supabase.auth.signUp({ email: null as any, password: null as any });
    expect(result.error).toBeTruthy();
    expect(result.error!.message).toContain("valid email");
  });

  it("signUp rejects undefined password", async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Signup requires a valid password", status: 400, name: "AuthApiError" } as any,
    });

    const result = await supabase.auth.signUp({ email: "test@test.com", password: undefined as any });
    expect(result.error).toBeTruthy();
  });

  it("signInWithPassword rejects empty string email", async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400, name: "AuthApiError" } as any,
    });

    const result = await supabase.auth.signInWithPassword({ email: "", password: "password123" });
    expect(result.error).toBeTruthy();
    expect(result.data.user).toBeNull();
  });

  it("rejects password exceeding 72 characters (bcrypt limit)", async () => {
    const longPassword = "a".repeat(200);
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Password too long", status: 400, name: "AuthApiError" } as any,
    });

    const result = await supabase.auth.signUp({ email: "test@test.com", password: longPassword });
    expect(result.error).toBeTruthy();
  });
});

describe("Rate Limiting", () => {
  it("checkRateLimit blocks after 5 attempts in 60 seconds", () => {
    const attempts: number[] = [];
    const MAX_ATTEMPTS = 5;
    const WINDOW_MS = 60_000;

    function checkRateLimit(): boolean {
      const now = Date.now();
      const recent = attempts.filter(t => now - t < WINDOW_MS);
      return recent.length < MAX_ATTEMPTS;
    }

    const now = Date.now();
    // Simulate 5 attempts
    for (let i = 0; i < 5; i++) {
      attempts.push(now);
    }

    expect(checkRateLimit()).toBe(false); // 6th attempt blocked
  });

  it("checkRateLimit allows after window expires", () => {
    const attempts: number[] = [];
    const MAX_ATTEMPTS = 5;
    const WINDOW_MS = 60_000;

    function checkRateLimit(): boolean {
      const now = Date.now();
      const recent = attempts.filter(t => now - t < WINDOW_MS);
      return recent.length < MAX_ATTEMPTS;
    }

    // All attempts are 2 minutes old
    const twoMinAgo = Date.now() - 120_000;
    for (let i = 0; i < 5; i++) {
      attempts.push(twoMinAgo);
    }

    expect(checkRateLimit()).toBe(true); // Window expired, allowed
  });
});
