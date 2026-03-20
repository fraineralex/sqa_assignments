const API_PREFIX = "/api";
const AUTH_TOKEN = "mock-access-token";

const users = new Map();
users.set("hot-user-001", {
  id: "hot-user-001",
  firstName: "Usuario",
  lastName: "Caliente",
  email: "hot-user-001@xyz.local",
  phone: "8095550000",
  status: "active",
  metadata: { channel: "web", locale: "es-DO" },
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emptyResponse(status = 204) {
  return new Response(null, { status });
}

function unauthorized() {
  return jsonResponse(
    { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
    401
  );
}

function parseId(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[2] || "";
}

function isAuthorized(request) {
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${AUTH_TOKEN}`;
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validationError() {
  return jsonResponse(
    { error: { code: "VALIDATION_ERROR", message: "Validation failed" } },
    400
  );
}

function conflictError() {
  return jsonResponse(
    { error: { code: "CONFLICT", message: "Email already exists" } },
    409
  );
}

function notFound() {
  return jsonResponse({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
}

function dependencyError() {
  return jsonResponse(
    { error: { code: "UPSTREAM_TIMEOUT", message: "CRM dependency timeout" } },
    503
  );
}

function emailExists(email, ignoredUserId = "") {
  for (const user of users.values()) {
    if (user.email === email && user.id !== ignoredUserId) return true;
  }
  return false;
}

function generateId() {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

const server = Bun.serve({
  port: 8080,
  fetch: async (request) => {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === `${API_PREFIX}/health` && request.method === "GET") {
      return jsonResponse({ status: "ok" }, 200);
    }

    if (pathname === `${API_PREFIX}/auth/login` && request.method === "POST") {
      const body = await parseBody(request);
      if (!body || !body.username || !body.password) {
        return validationError();
      }
      return jsonResponse({ accessToken: AUTH_TOKEN }, 200);
    }

    if (!pathname.startsWith(`${API_PREFIX}/users`)) {
      return jsonResponse({ error: { code: "NOT_FOUND", message: "Route not found" } }, 404);
    }

    if (!isAuthorized(request)) {
      return unauthorized();
    }

    if (pathname === `${API_PREFIX}/users` && request.method === "POST") {
      const body = await parseBody(request);
      if (
        !body ||
        !body.firstName ||
        !isValidEmail(body.email) ||
        !["active", "suspended"].includes(body.status)
      ) {
        return validationError();
      }
      if (emailExists(body.email)) {
        return conflictError();
      }

      const id = generateId();
      const user = {
        id,
        firstName: body.firstName,
        lastName: body.lastName || "",
        email: body.email,
        phone: body.phone || "",
        status: body.status,
        metadata: body.metadata || {},
      };
      users.set(id, user);
      return jsonResponse(user, 201);
    }

    const userId = parseId(pathname);
    if (!userId) {
      return notFound();
    }

    if (userId === "simulate-crm-timeout" && request.method === "GET") {
      return dependencyError();
    }

    if (request.method === "GET") {
      const user = users.get(userId);
      if (!user) return notFound();
      return jsonResponse(user, 200);
    }

    if (request.method === "PUT") {
      const user = users.get(userId);
      if (!user) return notFound();
      const body = await parseBody(request);
      if (!body) return validationError();

      if (body.email && !isValidEmail(body.email)) return validationError();
      if (body.email && emailExists(body.email, userId)) return conflictError();
      if (body.status && !["active", "suspended"].includes(body.status)) return validationError();

      const updated = {
        ...user,
        ...body,
      };
      users.set(userId, updated);
      return jsonResponse(updated, 200);
    }

    if (request.method === "DELETE") {
      if (!users.has(userId)) return notFound();
      users.delete(userId);
      return emptyResponse(204);
    }

    return jsonResponse(
      { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } },
      405
    );
  },
});

console.log(`Mock API running on http://localhost:${server.port}${API_PREFIX}`);
