import { useState } from 'react';
import styles from './index.module.css';

const directions = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1],
];

const Home = () => {
  const normalBoard = [...Array(9)].map(() => [...Array(9)].map(() => 0));

  const [userInput, setUserInput] = useState(normalBoard);

  const [bombMap, setBombMap] = useState(normalBoard);

  const board = normalBoard.map((row) => row.map(() => -1));

  const newUserInput: number[][] = JSON.parse(JSON.stringify(userInput));

  const newBombMap: (0 | 1)[][] = JSON.parse(JSON.stringify(bombMap));

  const isFirst = !userInput.flat().includes(1);

  const isFailed = () =>
    userInput
      .map((row, y) => row.map((value, x) => value === 1 && bombMap[y][x] === 1))
      .flat()
      .some(Boolean);

  const isWon = () => board.flat().filter((value) => [-1, 9, 10].includes(value)).length === 10;

  const maxMin = (n: number) => Math.max(0, Math.min(8, n));

  const setBomb = (x: number, y: number) => {
    const zeroToEight = () => Math.floor(Math.random() * 9);
    let count = 0;
    while (count < 10) {
      const nx = zeroToEight();
      const ny = zeroToEight();
      if (!(nx === x && ny === y) && newBombMap[ny][nx] === 0) {
        newBombMap[ny][nx] = 1;
        count += 1;
      }
    }
  };

  const clickNum = (x: number, y: number) => {
    if (1 <= board[y][x] && board[y][x] <= 8) {
      console.log(serchBomb(x, y), serchFlag(x, y));
      if (serchFlag(x, y) === serchBomb(x, y)) {
        checkAround(x, y, 'input');
      }
    }
  };

  const serchBomb = (x: number, y: number) =>
    bombMap
      .map((row) => row.slice(maxMin(x - 1), maxMin(x + 1) + 1))
      .slice(maxMin(y - 1), maxMin(y + 1) + 1)
      .flat()
      .filter((v) => v === 1).length;

  const serchFlag = (x: number, y: number) =>
    userInput
      .map((row) => row.slice(maxMin(x - 1), maxMin(x + 1) + 1))
      .slice(maxMin(y - 1), maxMin(y + 1) + 1)
      .flat()
      .filter((v) => v === 2).length;

  const checkAround = (x: number, y: number, type: 'recursive' | 'input') => {
    for (const direction of directions) {
      const dx = direction[0];
      const dy = direction[1];
      if (
        board[y + dy] !== undefined &&
        board[y + dy][x + dx] !== undefined &&
        board[y + dy][x + dx] === -1
      ) {
        eventHandler(x + dx, y + dy, type);
      }
    }
  };

  const recursive = (x: number, y: number) => {
    board[y][x] = serchBomb(x, y);
    if (board[y][x] === 0) {
      checkAround(x, y, 'recursive');
    }
    isBomb(x, y);
  };

  const eventHandler = (x: number, y: number, type: 'recursive' | 'input') => {
    if (type === 'recursive') {
      recursive(x, y);
    } else {
      newUserInput[y][x] = 1;
    }
  };

  const isBomb = (x: number, y: number) => {
    if (newBombMap[y][x] === 1 && newUserInput[y][x] === 1) {
      board[y][x] = 11;
    }
  };

  const handleUserInput = (i: number, j: number) => {
    if (newUserInput[j][i] === 1) {
      recursive(i, j);
    }
    if (newUserInput[j][i] === 2) {
      board[j][i] = 10;
    }
    if (newUserInput[j][i] === 3) {
      board[j][i] = 9;
    }
  };
  const face = isFailed() ? 14 : isWon() ? 13 : 12;
  const reset = () => {
    setUserInput(normalBoard);
    setBombMap(normalBoard);
  };

  const clickLeft = (x: number, y: number) => {
    if (isFirst) {
      setBomb(x, y);
      setBombMap(newBombMap);
    }
    if (isFailed()) return;
    if (isWon()) return;
    if (userInput[y][x] === 0) {
      newUserInput[y][x] = 1;
    }
    clickNum(x, y);

    setUserInput(newUserInput);
  };

  const clickRight = (x: number, y: number) => {
    document.getElementsByTagName('html')[0].oncontextmenu = () => false;
    if (isFailed()) return;
    if (userInput[y][x] === 0 && board[y][x] === -1) {
      newUserInput[y][x] = 2;
    } else {
      if (userInput[y][x] === 2) {
        newUserInput[y][x] = 3;
      } else {
        newUserInput[y][x] = 0;
      }
    }
    setUserInput(newUserInput);
  };
  for (let n = 0; n < 81; n++) {
    const i = n % 9;
    const j = Math.floor(n / 9);
    handleUserInput(i, j);
  }
  if (isFailed()) {
    newBombMap.forEach((row, y) => row.forEach((bomb, x) => bomb === 1 && (board[y][x] = 11)));
  }

  return (
    <div className={styles.container}>
      <div className={styles.frame}>
        <div className={styles.header}>
          <div
            className={styles.button}
            style={{ backgroundPosition: `${7.67 * (face - 1)}%` }}
            onClick={() => reset()}
          />
        </div>
        <div style={{ height: 5 }} />
        <div className={styles.board}>
          {board.map((row, y) =>
            row.map((value, x) => (
              <div
                key={`${x}-${y}`}
                onClick={() => clickLeft(x, y)}
                onContextMenu={() => clickRight(x, y)}
                className={[-1, 10, 9].includes(value) ? styles.stone : styles.cell}
                style={{
                  backgroundPosition: `${7.67 * (value - 1)}%`,
                  backgroundColor:
                    isFailed() && userInput[y][x] === 1 && bombMap[y][x] === 1 ? '#f00' : '#bbb',
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;
