import Timeout from "await-timeout";

export const promiseWithTimeout = async <T>(promise: Promise<T>, timeout: number): Promise<T> => {
  return Timeout.wrap(promise, timeout, "timeout exceeded");
};

export const wait = <T>(delay: number, returnValue?: T): Promise<T | undefined> =>
  new Promise((resolve) => setTimeout(() => resolve(returnValue), delay));
