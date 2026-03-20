import { check, sleep } from "k6";
import { scenario, vu } from "k6/execution";
import {
  authenticate,
  createUserPayload,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  waitForUserConsistency,
} from "./utils.js";

const baseUrl = __ENV.BASE_URL || "http://localhost:8080/api";

export const options = {
  scenarios: {
    fullLifecycle: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "20s", target: 5 },
        { duration: "40s", target: 10 },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "10s",
      exec: "runLifecycleScenario",
    },
    invalidPayloads: {
      executor: "per-vu-iterations",
      vus: 3,
      iterations: 4,
      maxDuration: "30s",
      exec: "runInvalidDataScenario",
      startTime: "10s",
    },
    dependencyFailure: {
      executor: "shared-iterations",
      vus: 2,
      iterations: 6,
      maxDuration: "30s",
      exec: "runDependencyFailureScenario",
      startTime: "20s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.03"],
    http_req_duration: ["p(90)<500", "p(95)<800"],
    checks: ["rate>0.98"],
  },
};

function credentials() {
  return {
    username: __ENV.API_USERNAME || "integration.tester",
    password: __ENV.API_PASSWORD || "StrongPass!123",
  };
}

export function runLifecycleScenario() {
  const seed = `${scenario.iterationInTest}-${vu.idInTest}`;
  const token = authenticate(baseUrl, credentials());
  const createPayload = createUserPayload(seed);

  const createResponse = createUser(baseUrl, token, createPayload);
  check(createResponse, {
    "create status is 201": (r) => r.status === 201,
    "create returns user id": (r) => Boolean(r.json("id")),
    "create returns active status": (r) => r.json("status") === "active",
  });

  const userId = createResponse.json("id");
  sleep(0.5);

  const eventualRead = waitForUserConsistency(baseUrl, token, userId);
  check(eventualRead, {
    "eventual consistency read status is 200": (r) => r.status === 200,
    "eventual consistency returns same email": (r) =>
      r.json("email") === createPayload.email,
  });

  const updatePayload = {
    firstName: `${createPayload.firstName}Actualizado`,
    status: "suspended",
  };
  const updateResponse = updateUser(baseUrl, token, userId, updatePayload);
  check(updateResponse, {
    "update status is 200": (r) => r.status === 200,
    "update returns suspended status": (r) => r.json("status") === "suspended",
  });

  sleep(0.3);
  const readAfterUpdate = getUser(baseUrl, token, userId);
  check(readAfterUpdate, {
    "read after update status is 200": (r) => r.status === 200,
    "read after update firstName changed": (r) =>
      r.json("firstName") === updatePayload.firstName,
  });

  const deleteResponse = deleteUser(baseUrl, token, userId);
  check(deleteResponse, {
    "delete status is 204": (r) => r.status === 204,
  });

  const readAfterDelete = getUser(baseUrl, token, userId);
  check(readAfterDelete, {
    "read after delete status is 404": (r) => r.status === 404,
  });
}

export function runInvalidDataScenario() {
  const token = authenticate(baseUrl, credentials());
  const invalidPayload = {
    firstName: "",
    email: "correo-invalido",
    status: "unknown",
  };

  const response = createUser(baseUrl, token, invalidPayload);
  check(response, {
    "invalid payload returns 400": (r) => r.status === 400,
    "invalid payload has validation code": (r) =>
      r.json("error.code") === "VALIDATION_ERROR",
  });
  sleep(0.4);
}

export function runDependencyFailureScenario() {
  const token = authenticate(baseUrl, credentials());
  const response = getUser(baseUrl, token, "simulate-crm-timeout");
  check(response, {
    "dependency failure returns 503": (r) => r.status === 503,
    "dependency failure returns upstream timeout message": (r) =>
      r.json("error.message") === "CRM dependency timeout",
  });
  sleep(0.4);
}
