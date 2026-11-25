import { explorerTxUrl } from "../lib/stellar";

function formatShortTxHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 12)}…` : hash;
}

export function TransactionLink({
  hash,
  showExplorerLabel = false,
}: {
  hash: string;
  showExplorerLabel?: boolean;
}) {
  return (
    <a
      href={explorerTxUrl(hash)}
      target="_blank"
      rel="noreferrer"
      title={hash}
    >
      <code>{formatShortTxHash(hash)}</code>
      {showExplorerLabel ? " (View on stellar.expert)" : null}
    </a>
  );
}
