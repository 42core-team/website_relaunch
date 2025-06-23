export type ActionError = { error: string };
export type ServerActionResponse<T = {}> = ActionError | T;

export function isActionError(response: any): response is ActionError {
  return response && "error" in response && typeof response.error === "string";
}
