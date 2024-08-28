import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";
import {
  getTotalSpent,
  getUserSpentOnPanini,
  getUserTotalSpent,
} from "./models/dashboard/Transaction.server";
import {
  getPaniniTotalPaymentToUser,
  getUserPaymentBalance,
} from "./models/dashboard/Payment.server";
import Dinero from "dinero.js";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown> | undefined;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function addMissingDigit(digit: number) {
  return digit < 10 ? `0${digit}` : digit;
}

export function isValidDate(date: string) {
  return !isNaN(Date.parse(date));
}

export function formatDate(date: string | Date = new Date()) {
  const formattedDate = new Date(date);
  return `${formattedDate.getUTCFullYear()}-${addMissingDigit(
    formattedDate.getUTCMonth() + 1,
  )}-${addMissingDigit(formattedDate.getUTCDate())}`;
}

export function formatDateToDisplay(date: string = "") {
  const formattedDate = new Date(date);
  return `${addMissingDigit(formattedDate.getUTCDate())}/${addMissingDigit(
    formattedDate.getUTCMonth() + 1,
  )}/${formattedDate.getUTCFullYear()}`;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function extractAmount(amount: string) {
  const regex = /[$,.]/g;
  return Number(amount.replace(regex, ""));
}

export async function getUserBalance(userId: string) {
  const transactions = await getUserTotalSpent(userId);
  const payments = await getUserPaymentBalance(userId);
  const totalSpent = await getTotalSpent();
  const spentOnPanini = await getUserSpentOnPanini(userId);
  const paniniPaymentsToUser = await getPaniniTotalPaymentToUser(userId);

  const totalPerUser = Dinero({
    amount: totalSpent,
  }).divide(2);

  const paymentsBalance = Dinero({ amount: payments.sent }).subtract(
    Dinero({ amount: payments.received }),
  );

  const userBalance = Dinero({ amount: transactions })
    .add(paymentsBalance)
    .subtract(totalPerUser);

  const paniniBalance = Dinero({ amount: spentOnPanini }).subtract(
    Dinero({ amount: paniniPaymentsToUser }),
  );

  const status = (balance: number) => {
    if (balance > 0) {
      return { text: "te deben", color: "text-green-600" };
    } else if (balance < 0) {
      return { text: "debes", color: "text-red-600" };
    } else {
      return { text: "estás a mano", color: "text-gray-600" };
    }
  };

  return {
    balance: userBalance.getAmount(),
    paniniBalance: paniniBalance.getAmount(),
    status: status(userBalance.getAmount()),
    paniniStatus: status(paniniBalance.getAmount()),
  };
}

export function generateFormRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

export interface UserErrorType {
  [key: string]: string | null;
}
