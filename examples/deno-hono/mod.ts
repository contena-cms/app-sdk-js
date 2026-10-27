import { Hono } from "hono";
import { logger } from 'hono/logger'
import { configureAppServer } from "@contena-ag/app-server-sdk/integration/hono";
import { DenoKVRepository } from "@contena-ag/app-server-sdk/integration/deno-kv";
import {
  AppServer,
  ShopInterface,
  Context,
  SimpleShop,
} from "@contena-ag/app-server-sdk";
import {
  ActionButtonRequest
} from "@contena-ag/app-server-sdk/types";
import { createNotificationResponse } from "@contena-ag/app-server-sdk/helper/app-actions";
import { EntityRepository } from "@contena-ag/app-server-sdk/helper/admin-api";
import { Criteria } from "@contena-ag/app-server-sdk/helper/criteria";

const app = new Hono();
app.use(logger());

declare module "hono" {
  interface ContextVariableMap {
    app: AppServer;
    shop: ShopInterface;
    context: Context;
  }
}

configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new DenoKVRepository()
});

type Product = {
  id: string;
  name: string;
};

app.post("/app/action-button", async (c) => {
  const ctx = c.get("context") as Context<SimpleShop, ActionButtonRequest>;

  const repository = new EntityRepository<Product>(ctx.httpClient, "product");

  // get the products clicked by action button
  const entitySearchResult = await repository.search(new Criteria(ctx.payload.data.ids));

  console.log(entitySearchResult.total);
  console.log(entitySearchResult.first()?.name)

  await repository.upsert(entitySearchResult.data.map(product => ({ id: product.id, name: 'yippiee' })));

  return createNotificationResponse("success", "Product name updated yeaaa");
});

export default app;
