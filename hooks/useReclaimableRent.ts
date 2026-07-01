import { useState, useCallback, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token';

// Standard rent-exempt reserve for a token account (approx, varies slightly by cluster)
const TOKEN_ACCOUNT_RENT_LAMPORTS = 2039280;

interface ReclaimableAccount {
  pubkey: PublicKey;
  mint: string;
  lamports: number;
}

export function useReclaimableRent(connection: Connection, owner: PublicKey | null) {
  const [accounts, setAccounts] = useState<ReclaimableAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const scan = useCallback(async () => {
    if (!owner) return;
    setLoading(true);
    try {
      const resp = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      });

      const empties = resp.value
        .filter((a) => {
          const info = a.account.data.parsed.info;
          return info.tokenAmount.uiAmount === 0;
        })
        .map((a) => ({
          pubkey: a.pubkey,
          mint: a.account.data.parsed.info.mint as string,
          lamports: a.account.lamports || TOKEN_ACCOUNT_RENT_LAMPORTS,
        }));

      setAccounts(empties);
    } finally {
      setLoading(false);
    }
  }, [connection, owner]);

  useEffect(() => {
    scan();
  }, [scan]);

  const totalLamports = accounts.reduce((sum, a) => sum + a.lamports, 0);

  const buildCloseTransaction = useCallback(() => {
    if (!owner || accounts.length === 0) return null;
    const tx = new Transaction();
    accounts.forEach((a) => {
      tx.add(
        createCloseAccountInstruction(a.pubkey, owner, owner, [], TOKEN_PROGRAM_ID)
      );
    });
    return tx;
  }, [accounts, owner]);

  return {
    accounts,
    accountCount: accounts.length,
    totalLamports,
    loading,
    refresh: scan,
    buildCloseTransaction,
  };
}
