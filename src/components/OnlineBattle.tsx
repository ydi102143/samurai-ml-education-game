/**
 * オンライン対戦コンポーネント
 * 既存の動作する実装を使用
 */

import React from 'react';
import { MultiplayerBattle } from './MultiplayerBattle';

interface OnlineBattleProps {
  onBack: () => void;
}

export function OnlineBattle({ onBack }: OnlineBattleProps) {
  return <MultiplayerBattle onBack={onBack} />;
}