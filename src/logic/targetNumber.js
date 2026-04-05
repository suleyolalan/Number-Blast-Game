// targetNumber.js — Hedef sayı üretimi ve erişilebilirlik kontrolü

const TARGET_MIN = 2;
const TARGET_MAX = 36;

export function getTargetRange() {
  return { min: TARGET_MIN, max: TARGET_MAX };
}

export function generateTargetNumber() {
  return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
}

// Grid hücresinden sayıyı güvenli şekilde al (obje veya sayı olabilir)
function getCellNumber(cell) {
  if (cell === null || cell === undefined) return null;
  if (typeof cell === 'object') return cell.number ?? null;
  return cell;
}

export function isTargetReachable(grid, target) {
  const rows = grid.length;
  const cols = grid[0].length;

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [ 0, -1],          [ 0, 1],
    [ 1, -1], [ 1, 0], [ 1, 1],
  ];

  function isValid(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols && getCellNumber(grid[r][c]) !== null;
  }

  function dfs(r, c, currentSum, count, visited) {
    if (count >= 2 && currentSum === target) return true;
    if (count === 4) return false;

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (isValid(nr, nc) && !visited.has(key)) {
        visited.add(key);
        const cellNum = getCellNumber(grid[nr][nc]);
        if (dfs(nr, nc, currentSum + cellNum, count + 1, visited)) {
          return true;
        }
        visited.delete(key);
      }
    }
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellNum = getCellNumber(grid[r][c]);
      if (cellNum === null) continue;
      const visited = new Set([`${r},${c}`]);
      if (dfs(r, c, cellNum, 1, visited)) return true;
    }
  }

  return false;
}

export function refreshTarget(grid) {
  let target;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  do {
    target = generateTargetNumber();
    attempts++;

    if (attempts >= MAX_ATTEMPTS) {
      // Fallback: grid'deki ilk bloğun SAYISINI döndür (objeyi değil!)
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          const num = getCellNumber(grid[r][c]);
          if (num !== null) return num;
        }
      }
      return 2;
    }
  } while (!isTargetReachable(grid, target));

  return target;
}
