import http from "k6/http";
import { check } from "k6";

http.setResponseCallback(
  http.expectedStatuses({ min: 200, max: 299 }, 400, 404, 409, 503)
);

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export function buildAuthHeaders(token) {
  return {
    ...defaultHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function authenticate(baseUrl, credentials) {
  const response = http.post(
    `${baseUrl}/auth/login`,
    JSON.stringify(credentials),
    { headers: defaultHeaders }
  );

  check(response, {
    "auth status is 200": (r) => r.status === 200,
    "auth returns token": (r) => Boolean(r.json("accessToken")),
  });

  return response.json("accessToken");
}

export function createUserPayload(seed) {
  return {
    firstName: `Nombre${seed}`,
    lastName: `Apellido${seed}`,
    email: `usuario${seed}@xyz.local`,
    phone: `809555${String(seed).padStart(4, "0")}`,
    status: "active",
    metadata: {
      channel: "web",
      locale: "es-DO",
    },
  };
}

export function createUser(baseUrl, token, payload) {
  return http.post(`${baseUrl}/users`, JSON.stringify(payload), {
    headers: buildAuthHeaders(token),
  });
}

export function getUser(baseUrl, token, userId) {
  return http.get(`${baseUrl}/users/${userId}`, {
    headers: buildAuthHeaders(token),
  });
}

export function updateUser(baseUrl, token, userId, payload) {
  return http.put(`${baseUrl}/users/${userId}`, JSON.stringify(payload), {
    headers: buildAuthHeaders(token),
  });
}

export function deleteUser(baseUrl, token, userId) {
  return http.del(`${baseUrl}/users/${userId}`, null, {
    headers: buildAuthHeaders(token),
  });
}

export function waitForUserConsistency(baseUrl, token, userId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = getUser(baseUrl, token, userId);
    if (response.status === 200) {
      return response;
    }
  }

  return getUser(baseUrl, token, userId);
}
