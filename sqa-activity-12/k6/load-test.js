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
    { duration: "20s", target: 15 },
    { duration: "45s", target: 40 },
    { duration: "1m", target: 40 },
    { duration: "25s", target: 10 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<900", "p(99)<1400"],
    http_req_failed: ["rate<0.02"],
    checks: ["rate>0.94"],
    "http_req_duration{name:GET_users}": ["p(95)<1000"],
    "http_req_duration{name:POST_users}": ["p(95)<1200"],
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

  sleep(1);
}
