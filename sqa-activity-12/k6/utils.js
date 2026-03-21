import http from "k6/http";
import { check } from "k6";

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export function resolveBaseUrl() {
  return __ENV.BASE_URL || "https://jsonplaceholder.typicode.com";
}

export function buildCreateUserPayload(vuId, iteration) {
  const suffix = `${vuId}-${iteration}-${Date.now()}`;
  return {
    name: `LoadUser ${suffix}`,
    username: `lu_${suffix}`,
    email: `load.${suffix}@academic.local`,
    phone: "8095550000",
    website: "academic.local",
  };
}

export function getUsers(baseUrl) {
  return http.get(`${baseUrl}/users`, { headers: jsonHeaders, tags: { name: "GET_users" } });
}

export function getUserById(baseUrl, userId) {
  return http.get(`${baseUrl}/users/${userId}`, {
    headers: jsonHeaders,
    tags: { name: "GET_users_id" },
  });
}

export function createUser(baseUrl, payload) {
  return http.post(`${baseUrl}/users`, JSON.stringify(payload), {
    headers: jsonHeaders,
    tags: { name: "POST_users" },
  });
}

export function fetchUsersConcurrentBundle(baseUrl) {
  const requests = [
    ["GET", `${baseUrl}/users`, null, { headers: jsonHeaders, tags: { name: "batch_list" } }],
    ["GET", `${baseUrl}/users/1`, null, { headers: jsonHeaders, tags: { name: "batch_user_1" } }],
    ["GET", `${baseUrl}/users/2`, null, { headers: jsonHeaders, tags: { name: "batch_user_2" } }],
    ["GET", `${baseUrl}/users/3`, null, { headers: jsonHeaders, tags: { name: "batch_user_3" } }],
  ];
  return http.batch(requests);
}

export function assertUserReadChecks(response) {
  return check(response, {
    "user read status 200": (r) => r.status === 200,
    "user read has id": (r) => {
      const body = r.json();
      return body && typeof body.id !== "undefined";
    },
  });
}

export function assertUserListChecks(response) {
  return check(response, {
    "user list status 200": (r) => r.status === 200,
    "user list is array": (r) => Array.isArray(r.json()),
  });
}

export function assertCreateUserChecks(response) {
  return check(response, {
    "create user status 201": (r) => r.status === 201,
    "create user returns id": (r) => Boolean(r.json("id")),
  });
}

export function assertBatchChecks(responses) {
  if (!responses.length) {
    return false;
  }
  return check(responses[0], {
    "batch all 200": () => responses.every((r) => r.status === 200),
  });
}

export function pickUserId() {
  return 1 + Math.floor(Math.random() * 10);
}
