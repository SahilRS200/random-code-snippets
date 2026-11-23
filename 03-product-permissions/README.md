# 03 · Who can see and change products

The marketplace back office is a NestJS API with MongoDB. Every request carries a JWT
(`Authorization: Bearer ...`) whose payload is `{ sub, sellerId, role }`.

## The rules

| Action | Seller | Admin |
|---|---|---|
| List products | Their own only | Any seller's (`?sellerId=`) |
| Edit name, description, price | Their own only | No |
| Submit a draft for review | Their own only | No |
| See products waiting for review | No | Yes |
| Approve a product | No | Yes |

A product moves `draft` → `pending_review` → `approved` or `rejected`. Only approved products appear in the storefront.

The dashboard only shows the **Approve** button to admins.

## What we know

An external penetration test reports that a seller account could change products that belong to other sellers,
approve its own products, and download every seller's catalogue. The team believes the role checks are in place.

## Files

| File | What it does |
|---|---|
| `api/src/main.ts` | Starts the app |
| `api/src/app.module.ts` | Wires modules and global guards |
| `api/src/auth/roles.decorator.ts` | `@Roles()` and `@Public()` decorators |
| `api/src/auth/jwt-auth.guard.ts` | Checks the JWT and sets `req.user` |
| `api/src/auth/roles.guard.ts` | Checks `@Roles()` against `req.user.role` |
| `api/src/products/product.schema.ts` | Product shape and schema |
| `api/src/products/dto/update-product.dto.ts` | What a seller may send when editing |
| `api/src/products/products.controller.ts` | Seller and admin endpoints |
| `api/src/products/products.service.ts` | Database access |

## Your task

Find every way the code breaks the rules above. For each one, show the request an attacker would send,
and fix it.
