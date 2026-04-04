import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL ?? "http://127.0.0.1:3000";

// Each virtual user authenticates, loads the catalog, adds one line to the cart, then checks out.
// Sleeps add pacing so the scenario resembles human timing instead of hammering the API.

export const options = {
  vus: 100,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const loginPayload = JSON.stringify({
    email: `user_${__VU}_${__ITER}@loadtest.local`,
    password: "TestPassword!94",
  });

  // Step 1: authenticate against the auth service and obtain a session context for the user.
  const loginRes = http.post(`${baseUrl}/login`, loginPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(loginRes, {
    "login status is 200": (r) => r.status === 200,
  });
  sleep(0.3 + Math.random() * 0.4);

  // Step 2: fetch the product list the shopper would see before adding items.
  const productsRes = http.get(`${baseUrl}/products`);
  check(productsRes, {
    "products status is 200": (r) => r.status === 200,
  });
  sleep(0.2 + Math.random() * 0.3);

  // Step 3: add a realistic SKU to the cart with a small random delay between UI actions.
  const cartPayload = JSON.stringify({
    productId: "sku_101",
    quantity: 1,
  });
  const cartRes = http.post(`${baseUrl}/cart`, cartPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(cartRes, {
    "cart status is 201": (r) => r.status === 201,
  });
  let cartId = "cart_mock_01";
  if (cartRes.status === 201) {
    try {
      const parsed = JSON.parse(String(cartRes.body)) as { cartId?: string };
      if (parsed.cartId) cartId = parsed.cartId;
    } catch {
      cartId = "cart_mock_01";
    }
  }
  sleep(0.25 + Math.random() * 0.35);

  // Step 4: complete checkout using the cart identifier returned by the cart service.
  const checkoutPayload = JSON.stringify({
    cartId,
    paymentMethod: "card",
  });
  const checkoutRes = http.post(`${baseUrl}/checkout`, checkoutPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(checkoutRes, {
    "checkout status is 201": (r) => r.status === 201,
  });
  sleep(0.2 + Math.random() * 0.3);
}
