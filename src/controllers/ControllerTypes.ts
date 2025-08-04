import { Context } from "hono";

export interface Controller {
  [key: string]: (c: Context) => Response | Promise<Response>;
}

