import { sleep } from "k6";
import { vu } from "k6/execution";
import {
  resolveBaseUrl,
  getUsers,
  getUserById,
  createUser,
  buildCreateUserPayload,
  fetchUsersConcurrentBundle,
  assertUserListChecks,
  assertUserReadChecks,
  assertCreateUserChecks,
  assertBatchChecks,
  pickUserId,
} from "./utils.js";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "45s", target: 80 },
    { duration: "1m", target: 120 },
    { duration: "45s", target: 100 },
    { duration: "30s", target: 50 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2500", "p(99)<4000"],
    http_req_failed: ["rate<0.08"],
    checks: ["rate>0.88"],
  },
};

export default function () {
  const baseUrl = resolveBaseUrl();

  const listResponse = getUsers(baseUrl);
  assertUserListChecks(listResponse);

  for (let i = 0; i < 3; i += 1) {
    const readResponse = getUserById(baseUrl, pickUserId());
    assertUserReadChecks(readResponse);
  }

  const createResponse = createUser(
    baseUrl,
    buildCreateUserPayload(vu.idInTest, __ITER)
  );
  assertCreateUserChecks(createResponse);

  const batchResponses = fetchUsersConcurrentBundle(baseUrl);
  assertBatchChecks(batchResponses);

  sleep(0.35);
}
