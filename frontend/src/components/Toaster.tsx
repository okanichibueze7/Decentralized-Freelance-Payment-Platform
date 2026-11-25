/**
 * Toaster.tsx
 *
 * Renders the active transaction toasts. Mounted once in `App.tsx`, inside the
 * `ToastProvider`, so every page's transactions report through one place.
 *
 * Contributor Notes:
 * - A failed toast is `role="alert"` and the rest are `role="status"`: a screen
 *   reader interrupts for the failure and merely announces the progress update.
 * - Only a confirmed toast has a hash, so only it gets the stellar.expert link.
 */

import { useState } from "react";
import { explorerContractUrl } from "../lib/stellar";
import { useToasts } from "../hooks/toast-context";
import { copyText } from "../lib/clipboard";
import MobileSignModal from "./MobileSignModal";
import { TransactionLink } from "./TransactionLink";

export default function Toaster() {
  const { toasts, dismiss } = useToasts();
  const [copyFeedback, setCopyFeedback] = useState<{ hash: string; text: string } | null>(null);
  const [mobileXdr, setMobileXdr] = useState<string | null>(null);

  async function copyHash(hash: string) {
    const copied = await copyText(hash);
    setCopyFeedback({ hash, text: copied ? "Copied" : "Copy failed" });
  }

  if (toasts.length === 0 && !mobileXdr) return null;

  return (
    <>
      <section className="toaster" aria-label="Transaction notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.status === "failed" ? "alert" : "status"}
            className={`toast toast-${toast.status}`}
          >
            <span className="toast-message">
              {toast.message}
              {toast.amount && toast.assetSymbol && (
                <span className="toast-asset-info" style={{ marginLeft: "0.35rem", fontWeight: 600 }}>
                  ({toast.amount} {toast.assetSymbol})
                </span>
              )}
            </span>
            {toast.status === "signing" && toast.xdr && (
              <button
                type="button"
                className="toast-mobile-btn"
                aria-label="Sign on Mobile"
                onClick={() => setMobileXdr(toast.xdr!)}
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  borderRadius: "4px",
                  border: "1px solid currentColor",
                  background: "transparent",
                  color: "inherit",
                }}
              >
                📱 Sign on Mobile
              </button>
            )}
            {toast.status === "confirmed" && toast.hash && (
              <>
                {" "}
                <TransactionLink hash={toast.hash} showExplorerLabel />
                <button type="button" onClick={() => void copyHash(toast.hash!)}>
                  Copy transaction hash
                </button>
                {copyFeedback?.hash === toast.hash && <span>{copyFeedback.text}</span>}
              </>
            )}
            {toast.assetContractId && (
              <>
                {" "}
                <a
                  href={explorerContractUrl(toast.assetContractId)}
                  target="_blank"
                  rel="noreferrer"
                  title={`Contract: ${toast.assetContractId}`}
                  className="toast-contract-link"
                  style={{ marginLeft: "0.5rem" }}
                >
                  View token contract
                </a>
              </>
            )}
            <button
              type="button"
              className="toast-dismiss"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </section>

      {mobileXdr && (
        <MobileSignModal
          xdr={mobileXdr}
          onClose={() => setMobileXdr(null)}
        />
      )}
    </>
  );
}
