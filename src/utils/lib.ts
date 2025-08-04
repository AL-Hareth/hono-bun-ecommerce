import { decode } from "hono/jwt";

/** This function is used to extract the userId (sub) from the jwt sent in the authorization header 
 * I am sure that the token exists and is valid because this route runs only under the jwt middleware
 * */
export function extractUserId(authorizationHeader: string) {
  const token = authorizationHeader.split(" ")[1];
  const { payload: { sub: userId } } = decode(token);

  return userId;
}
