import { check, sleep } from "k6";
import { scenario, vu } from "k6/execution";
import { authenticate, createUserPayload, createUser, getUser } from "./utils.js";

const baseUrl = __ENV.BASE_URL || "http://localhost:8080/api";

export const options = {
  scenarios: {
    sustainedLoad: {
      executor: "constant-arrival-rate",
      rate: 25,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 20,
      maxVUs: 60,
      exec: "runSustainedLoadScenario",
    },
    spikeReadTraffic: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      stages: [
        { target: 10, duration: "20s" },
        { target: 60, duration: "30s" },
        { target: 15, duration: "30s" },
      ],
      preAllocatedVUs: 30,
      maxVUs: 80,
      exec: "runReadHeavyScenario",
      startTime: "20s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<900", "p(99)<1200"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.97"],
  },
};

function credentials() {
  return {
    username: __ENV.API_USERNAME || "integration.tester",
    password: __ENV.API_PASSWORD || "StrongPass!123",
  };
}

export function runSustainedLoadScenario() {
  const token = authenticate(baseUrl, credentials());
  const seed = `${Date.now()}-${scenario.iterationInTest}-${vu.idInTest}`;
  const createResponse = createUser(baseUrl, token, createUserPayload(seed));

  check(createResponse, {
    "sustained create status 201": (r) => r.status === 201,
    "sustained create has id": (r) => Boolean(r.json("id")),
  });

  sleep(0.2);
}

export function runReadHeavyScenario() {
  const token = authenticate(baseUrl, credentials());
  const userId = __ENV.EXISTING_USER_ID || "hot-user-001";
  const readResponse = getUser(baseUrl, token, userId);

  check(readResponse, {
    "read heavy status is 200 or 404": (r) => r.status === 200 || r.status === 404,
    "read heavy response under SLA": (r) => r.timings.duration < 1200,
  });

  sleep(0.1);
}
