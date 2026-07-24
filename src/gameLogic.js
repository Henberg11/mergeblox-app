// Pure game-logic functions for MergeBlox — a tap-to-merge number puzzle.
// The board is a flat array of length ROWS*COLS. Each cell is either null (empty)
// or a number (the tile's value: 2, 4, 8, 16, ...).

export const ROWS = 6;
export const COLS = 5;
export const CELL_COUNT = ROWS * COLS;

export function randomTileValue() {
  return Math.random() < 0.9 ? 2 : 4;
}

export function getEmptyIndices(grid) {
  const empties = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === null) empties.push(i);
  }
  return empties;
}

// Returns a NEW grid with one additional random tile spawned in an empty cell.
// If the board is full, returns the same grid unchanged.
export function spawnTile(grid) {
  const empties = getEmptyIndices(grid);
  if (empties.length === 0) return grid;
  const target = empties[Math.floor(Math.random() * empties.length)];
  const next = grid.slice();
  next[target] = randomTileValue();
  return next;
}

export function createInitialGrid(initialTileCount = 5) {
  let grid = new Array(CELL_COUNT).fill(null);
  for (let i = 0; i < initialTileCount; i++) {
    grid = spawnTile(grid);
  }
  return grid;
}

export function rowColOf(index) {
  return { row: Math.floor(index / COLS), col: index % COLS };
}

export function areAdjacent(indexA, indexB) {
  const a = rowColOf(indexA);
  const b = rowColOf(indexB);
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  // Orthogonal neighbors only (no diagonals): exactly one step in one direction.
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function canMerge(grid, indexA, indexB) {
  if (indexA === indexB) return false;
  const a = grid[indexA];
  const b = grid[indexB];
  if (a === null || b === null) return false;
  if (a !== b) return false;
  return areAdjacent(indexA, indexB);
}

// Merges the tile at `fromIndex` into `toIndex` (both must hold equal values and be adjacent).
// Returns { grid, gained } where `gained` is the new (doubled) tile value, for scoring.
export function mergeTiles(grid, fromIndex, toIndex) {
  const value = grid[toIndex];
  const next = grid.slice();
  next[fromIndex] = null;
  next[toIndex] = value * 2;
  return { grid: next, gained: value * 2 };
}

function neighborsOf(index) {
  const { row, col } = rowColOf(index);
  const list = [];
  if (row > 0) list.push(index - COLS);
  if (row < ROWS - 1) list.push(index + COLS);
  if (col > 0) list.push(index - 1);
  if (col < COLS - 1) list.push(index + 1);
  return list;
}

// True if there's at least one pair of adjacent equal-value tiles anywhere on the board.
export function hasAnyMergeAvailable(grid) {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === null) continue;
    const neighbors = neighborsOf(i);
    for (const n of neighbors) {
      if (grid[n] === grid[i]) return true;
    }
  }
  return false;
}

export function isGameOver(grid) {
  return getEmptyIndices(grid).length === 0 && !hasAnyMergeAvailable(grid);
}

// Used for the "watch an ad to continue" rescue: clears up to `count` random
// occupied cells so the player has room to keep playing.
export function clearRandomTiles(grid, count) {
  const occupied = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== null) occupied.push(i);
  }
  const shuffled = occupied.slice().sort(() => Math.random() - 0.5);
  const clearIndices = shuffled.slice(0, Math.min(count, shuffled.length));
  const next = grid.slice();
  for (const idx of clearIndices) {
    next[idx] = null;
  }
  return next;
}

export function highestTile(grid) {
  let max = 0;
  for (const v of grid) {
    if (v !== null && v > max) max = v;
  }
  return max;
}
