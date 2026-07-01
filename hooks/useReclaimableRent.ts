import { useState, useCallback, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token';

const HELIUS = 'https://mainnet.helius-rpc.com/?api-key=3abd0284-8633-4617-87ce-b40398be951b';
const TOKEN_ACCOUNT_RENT_LAMPORTS = 2039280;

interface ReclaimableAccount {
  pubkey: PublicKey;
  mint: string;
  lamports: number;
}

export function useReclaimableRent(pubkeyStr: string | null | undefined) {
  const [accounts, setAccounts] = useState<ReclaimableAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const scan = useCallback(async () => {
    if (!pubkeyStr) return;
    setLoading(true);
    try {
      const connection = new Connection(HELIUS, 'confirmed');
      const owner = new PublicKey(pubkeyStr);
      const resp = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      });

      const empties = resp.value
        .filter((a) => a.account.data.parsed.info.tokenAmount.uiAmount === 0)
        .map((a) => ({
          pubkey: a.pubkey,
          mint: a.account.data.parsed.info.mint as string,
          lamports: a.account.lamports || TOKEN_ACCOUNT_RENT_LAMPORTS,
        }));

      setAccounts(empties);
    } catch (e) {
      console.log('reclaim scan error', e);
    } finally {
      setLoading(false);
    }
  }, [pubkeyStr]);

  useEffect(() => { scan(); }, [scan]);

  const totalLamports = accounts.reduce((sum, a) => sum + a.lamports, 0);

  const buildCloseTransaction = useCallback(() => {
    if (!pubkeyStr || accounts.length === 0) return null;
    const owner = new PublicKey(pubkeyStr);
    const tx = new Transaction();
    accounts.forEach((a) => {
      tx.add(createCloseAccountInstruction(a.pubkey, owner, owner, [], TOKEN_PROGRAM_ID));
    });
    return tx;
  }, [accounts, pubkeyStr]);

  return {
    accounts,
    accountCount: accounts.length,
    totalLamports,
    loading,
    refresh: scan,
    buildCloseTransaction,
  };
}
