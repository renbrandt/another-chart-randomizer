import { PromiseType } from "utility-types";

export type ReturnPromiseType<
  T extends (...args: any[]) => Promise<any>
> = PromiseType<ReturnType<T>>;
