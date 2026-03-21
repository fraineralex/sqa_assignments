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
    { duration: "15s", target: 5 },
    { duration: "10s", target: 120 },
    { duration: "20s", target: 120 },
    { duration: "15s", target: 10 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1800", "p(99)<3200"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.90"],
  },
};

export default function () {
  const baseUrl = resolveBaseUrl();

  const listResponse = getUsers(baseUrl);
  assertUserListChecks(listResponse);

  const readResponse = getUserById(baseUrl, pickUserId());
  assertUserReadChecks(readResponse);

  const createResponse = createUser(
    baseUrl,
    buildCreateUserPayload(vu.idInTest, __ITER)
  );
  assertCreateUserChecks(createResponse);

  const batchResponses = fetchUsersConcurrentBundle(baseUrl);
  assertBatchChecks(batchResponses);

  sleep(0.5);
}
