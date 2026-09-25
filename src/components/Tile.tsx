import type { Ref } from 'react';

interface TileProps {
  value: number;
  selected: boolean;
  /** The merge target while the other tile flies into it. */
  receiving: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/** Presentational only; GameBoard drives its animations through useTileAnimations. */
export function Tile({ value, selected, receiving, onClick, ref }: TileProps) {
  const className = ['tile', selected && 'sel', receiving && 'receiving'].filter(Boolean).join(' ');
  return (
    <button
      ref={ref}
      type="button"
      className={className}
      aria-label={`Tile ${value}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {value}
    </button>
  );
}
