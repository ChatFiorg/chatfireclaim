import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

interface ReclaimCardProps {
  accountCount: number;
  lamportsReclaimable: number;
  onClaim: () => void;
}

export default function ReclaimCard({ accountCount, lamportsReclaimable, onClaim }: ReclaimCardProps) {
  if (accountCount <= 0) return null;

  const solAmount = (lamportsReclaimable / 1_000_000_000).toFixed(4);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#C7F284" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <Ellipse cx={12} cy={6} rx={7} ry={2.5} />
          <Path d="M5 6v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
          <Path d="M5 11v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
        </Svg>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{accountCount}</Text>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>Rent to reclaim</Text>
        <Text style={styles.subtitle}>{accountCount} account{accountCount > 1 ? 's' : ''} · {solAmount} SOL</Text>
      </View>

      <TouchableOpacity style={styles.claimBtn} onPress={onClaim}>
        <Text style={styles.claimBtnText}>Claim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D0D0D',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#C7F284',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  claimBtn: {
    backgroundColor: '#C7F284',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  claimBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
});
