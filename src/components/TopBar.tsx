import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  onBack: () => void;
  backLabel: string;
  /** Right-hand slot: the star badge on the map, the sound toggle in a game. */
  children?: ReactNode;
}

export function TopBar({ title, onBack, backLabel, children }: TopBarProps) {
  return (
    <div className="bar">
      <button type="button" className="back" aria-label={backLabel} onClick={onBack}>
        ←
      </button>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
