const port = Number(process.env.PORT ?? 3000);

type CartBody = { productId?: string; quantity?: number };
type CheckoutBody = { cartId?: string; paymentMethod?: string };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Bun.serve({
  port,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "POST" && path === "/login") {
      const body = (await req.json().catch(() => ({}))) as {
        email?: string;
        password?: string;
      };
      if (!body.email || !body.password) {
        return json({ error: "invalid_payload" }, 400);
      }
      return json({
        token: "mock-jwt",
        userId: "usr_001",
        expiresIn: 3600,
      });
    }

    if (req.method === "GET" && path === "/products") {
      return json({
        items: [
          { id: "sku_100", name: "Wireless Mouse", price: 29.99, stock: 120 },
          { id: "sku_101", name: "USB-C Hub", price: 45.5, stock: 40 },
          { id: "sku_102", name: "Mechanical Keyboard", price: 119.0, stock: 15 },
        ],
      });
    }

    if (req.method === "POST" && path === "/cart") {
      const body = (await req.json().catch(() => ({}))) as CartBody;
      if (!body.productId || typeof body.quantity !== "number") {
        return json({ error: "invalid_payload" }, 400);
      }
      return json(
        {
          cartId: "cart_mock_01",
          lines: [{ productId: body.productId, quantity: body.quantity }],
        },
        201,
      );
    }

    if (req.method === "POST" && path === "/checkout") {
      const body = (await req.json().catch(() => ({}))) as CheckoutBody;
      if (!body.cartId) {
        return json({ error: "invalid_payload" }, 400);
      }
      return json(
        {
          orderId: "ord_mock_99",
          status: "confirmed",
          total: 74.49,
        },
        201,
      );
    }

    if (path === "/health") {
      return json({ ok: true });
    }

    return json({ error: "not_found" }, 404);
  },
});

console.log(`Mock e-commerce API listening on http://localhost:${port}`);
