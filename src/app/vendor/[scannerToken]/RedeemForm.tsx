"use client";

import { useActionState } from "react";
import { redeemCreditAction } from "./actions";

type RedeemFormProps = {
  scannerToken: string;
  creditTypes: {
    id: string;
    name: string;
  }[];
  ageRestricted: boolean;
};

const initialState = {
  ok: false,
  message: ""
};

export function RedeemForm({
  scannerToken,
  creditTypes,
  ageRestricted
}: RedeemFormProps) {
  const [state, formAction, isPending] = useActionState(
    redeemCreditAction,
    initialState
  );

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="scannerToken" value={scannerToken} />

      <label className="grid gap-1 text-sm font-medium">
        Wallet URL or manual code
        <input
          name="walletLookup"
          className="h-12 rounded-md border border-black/15 px-3 text-base"
          placeholder="ABC-123 or full wallet URL"
          autoComplete="off"
          required
        />
      </label>

      {creditTypes.length > 1 ? (
        <label className="grid gap-1 text-sm font-medium">
          Credit type
          <select
            name="creditTypeId"
            className="h-11 rounded-md border border-black/15 bg-white px-3 text-sm"
            required
          >
            {creditTypes.map((creditType) => (
              <option key={creditType.id} value={creditType.id}>
                {creditType.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="creditTypeId" value={creditTypes[0]?.id ?? ""} />
      )}

      {ageRestricted ? (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input name="idChecked" type="checkbox" className="size-4" required />
          ID checked
        </label>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Redeeming..." : "Redeem 1 Credit"}
      </button>

      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            state.ok ? "bg-leaf/15 text-ink" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
