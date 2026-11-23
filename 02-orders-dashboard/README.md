# 02 · The orders page that slows down at sale time

The seller dashboard's **Orders** page calls `GET /seller/orders?page=1&status=&search=`.
It shows 20 orders per page, newest first, with each item's product name and price.
Sellers can search by customer name or order number, and download all their orders as CSV.

The API is NestJS with Mongoose, running as three pods behind a load balancer.
The `orders` collection holds 1.2 million orders from 3,000 sellers. The largest seller has 40,000 orders.

## What we see

| | Normal day | Festive sale |
|---|---|---|
| `GET /seller/orders` p95 | 350 ms | 9.2 s |
| API CPU per pod | 15% | 100% of one core, health checks time out |
| API memory per pod | flat, about 300 MB | grows about 150 MB an hour until the pod restarts |
| MongoDB CPU | 10% | 85% |

MongoDB slow-query log, one entry during the sale:

```
orders.find { sellerId: "s_8812", createdAt: { $gte, $lte } }  sort { createdAt: -1 }
planSummary: IXSCAN { createdAt: -1 }  keysExamined: 1,204,331  docsExamined: 1,204,331  nReturned: 40,112
durationMillis: 3,870
```

Indexes on `orders`: `_id`, `{ createdAt: -1 }`, `{ status: 1 }`

## Files

| File | What it does |
|---|---|
| `api/src/orders/order.schema.ts` | Order and product shapes, schema and indexes |
| `api/src/orders/orders.controller.ts` | `GET /seller/orders`, `GET /seller/orders/export` |
| `api/src/orders/orders.service.ts` | Loads a page of orders and builds the CSV export |
| `api/src/orders/orders-cache.ts` | Cache in front of the orders query |

`SellerAuthGuard` isn't included. Assume it checks the session and sets `req.seller`.

## Your task

Explain why the endpoint gets slow, why CPU and memory behave as they do, and what you'd change.
Put your fixes in order: what you'd ship today, and what you'd do next.
