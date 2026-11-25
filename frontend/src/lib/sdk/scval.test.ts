import { scValToNative, xdr } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { milestonesToScVal, milestoneToScVal } from "./scval";

describe("milestoneToScVal", () => {
  it("produces an ScMap with canonical key order and exact ScVal types", () => {
    const val = milestoneToScVal({ amount: 500_0000000n, deadline: 1_700_000_000n });

    expect(val.switch()).toBe(xdr.ScValType.scvMap());
    const entries = val.map() ?? [];
    expect(entries).toHaveLength(4);

    // Ascending key order required by Soroban canonical struct serialization.
    expect(entries.map((entry) => entry.key().switch())).toEqual([
      xdr.ScValType.scvSymbol(),
      xdr.ScValType.scvSymbol(),
      xdr.ScValType.scvSymbol(),
      xdr.ScValType.scvSymbol(),
    ]);
    expect(entries.map((entry) => entry.key().sym().toString())).toEqual([
      "amount",
      "deadline",
      "released",
      "released_amount",
    ]);

    expect(entries[0].val().switch()).toBe(xdr.ScValType.scvI128());
    expect(entries[1].val().switch()).toBe(xdr.ScValType.scvU64());
    expect(entries[2].val().switch()).toBe(xdr.ScValType.scvBool());
    expect(entries[3].val().switch()).toBe(xdr.ScValType.scvI128());

    expect(scValToNative(val)).toEqual({
      amount: 500_0000000n,
      deadline: 1_700_000_000n,
      released: false,
      released_amount: 0n,
    });
  });

  it("preserves explicit released and releasedAmount values", () => {
    const val = milestoneToScVal({
      amount: 1_000n,
      deadline: 42n,
      released: true,
      releasedAmount: 1_000n,
    });

    const entries = val.map() ?? [];
    expect(entries[2].val().b()).toBe(true);
    expect(scValToNative(entries[3].val())).toBe(1_000n);
  });
});

describe("milestonesToScVal", () => {
  it("encodes multiple milestones into an ScVec of Milestone ScMaps", () => {
    const val = milestonesToScVal([
      { amount: 300n, deadline: 0n },
      { amount: 700n, deadline: 1_700_000_000n, released: true, releasedAmount: 700n },
    ]);

    expect(val.switch()).toBe(xdr.ScValType.scvVec());
    const vec = val.vec() ?? [];
    expect(vec).toHaveLength(2);
    expect(vec[0].switch()).toBe(xdr.ScValType.scvMap());
    expect(vec[1].switch()).toBe(xdr.ScValType.scvMap());

    expect(scValToNative(val)).toEqual([
      {
        amount: 300n,
        deadline: 0n,
        released: false,
        released_amount: 0n,
      },
      {
        amount: 700n,
        deadline: 1_700_000_000n,
        released: true,
        released_amount: 700n,
      },
    ]);
  });

  it("encodes an empty milestone list as an empty ScVec", () => {
    const val = milestonesToScVal([]);

    expect(val.switch()).toBe(xdr.ScValType.scvVec());
    expect(val.vec()).toEqual([]);
  });
});
