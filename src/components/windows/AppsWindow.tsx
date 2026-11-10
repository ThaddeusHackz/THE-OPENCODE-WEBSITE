'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';

export function VlcPlayerWindow() {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAudio, setIsAudio] = useState(false);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setIsAudio(file.type.startsWith('audio/'));
  };

  return (
    <div className="app-tool-win">
      <div className="app-tool-head">
        <div>
          <h3>VLC Online (Local Browser Media Player)</h3>
          <p className="muted-sm">Open any local video or audio file directly inside the desktop without uploading it.</p>
        </div>
        <label className="win-btn primary">
          Open Media File
          <input type="file" accept="video/*,audio/*" hidden onChange={onFile} />
        </label>
      </div>
      {mediaUrl ? (
        <div className="vlc-stage">
          <div className="muted-sm">Playing: <strong>{fileName}</strong></div>
          {isAudio ? (
            <audio controls src={mediaUrl} style={{ width: '100%' }} />
          ) : (
            <video controls src={mediaUrl} style={{ width: '100%', maxHeight: 340, borderRadius: 8 }} />
          )}
        </div>
      ) : (
        <div className="vlc-empty">
          Choose an MP4, WebM, MP3, WAV, or OGG file from your device to play it here.
        </div>
      )}
    </div>
  );
}

export function FormatFactoryWindow() {
  const [sourceText, setSourceText] = useState('{\n  "os": "winegui_2_ubuntu-22-amd64",\n  "opencode": "v2.2.5"\n}');
  const [outputText, setOutputText] = useState('');
  const [imgStatus, setImgStatus] = useState<string | null>(null);

  const convertImage = (event: ChangeEvent<HTMLInputElement>, mime: 'image/png' | 'image/jpeg' | 'image/webp') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const ext = mime.split('/')[1];
          const link = document.createElement('a');
          link.href = url;
          link.download = `${file.name.replace(/\.[^.]+$/, '')}.${ext}`;
          link.click();
          URL.revokeObjectURL(url);
          setImgStatus(`Converted ${file.name} (${img.width}x${img.height}) -> .${ext}`);
        }, mime);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="app-tool-win">
      <h3>Format Factory Online (Client-Side Converter)</h3>
      <div className="ff-section">
        <h4>Image Converter (PNG / JPEG / WebP)</h4>
        <div className="btn-row">
          <label className="win-btn small">
            Convert to PNG
            <input type="file" accept="image/*" hidden onChange={(e) => convertImage(e, 'image/png')} />
          </label>
          <label className="win-btn small">
            Convert to JPEG
            <input type="file" accept="image/*" hidden onChange={(e) => convertImage(e, 'image/jpeg')} />
          </label>
          <label className="win-btn small">
            Convert to WebP
            <input type="file" accept="image/*" hidden onChange={(e) => convertImage(e, 'image/webp')} />
          </label>
        </div>
        {imgStatus && <p className="muted-sm">{imgStatus}</p>}
      </div>

      <div className="ff-section">
        <h4>JSON &amp; Base64 Data Utility</h4>
        <textarea
          rows={5}
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          aria-label="Format Factory input"
        />
        <div className="btn-row">
          <button
            type="button"
            className="win-btn small"
            onClick={() => {
              try {
                setOutputText(JSON.stringify(JSON.parse(sourceText), null, 2));
              } catch (err) {
                setOutputText(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
              }
            }}
          >
            Pretty JSON
          </button>
          <button
            type="button"
            className="win-btn small"
            onClick={() => setOutputText(btoa(unescape(encodeURIComponent(sourceText))))}
          >
            Encode Base64
          </button>
          <button
            type="button"
            className="win-btn small"
            onClick={() => {
              try {
                setOutputText(decodeURIComponent(escape(atob(sourceText.trim()))));
              } catch {
                setOutputText('Invalid Base64 input');
              }
            }}
          >
            Decode Base64
          </button>
        </div>
        {outputText && <pre className="diag-pre">{outputText}</pre>}
      </div>
    </div>
  );
}

const TETROMINOES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];
const TETRIS_COLORS = ['#38bdf8', '#facc15', '#c084fc', '#fb923c', '#60a5fa', '#4ade80', '#f87171'];

export function TetrisWindow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 10;
    const rows = 18;
    const cell = 20;
    const board = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
    let pieceIdx = Math.floor(Math.random() * TETROMINOES.length);
    let shape = TETROMINOES[pieceIdx].map((row) => [...row]);
    let px = 3;
    let py = 0;
    let over = false;
    setScore(0);
    setRunning(true);

    const collides = (nx: number, ny: number, testShape: number[][]) =>
      testShape.some((row, r) =>
        row.some((val, c) => {
          if (!val) return false;
          const tx = nx + c;
          const ty = ny + r;
          return tx < 0 || tx >= cols || ty >= rows || (ty >= 0 && board[ty][tx] !== 0);
        }),
      );

    const merge = () => {
      shape.forEach((row, r) =>
        row.forEach((val, c) => {
          if (val && py + r >= 0 && py + r < rows) board[py + r][px + c] = pieceIdx + 1;
        }),
      );
      let cleared = 0;
      for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every((v) => v !== 0)) {
          board.splice(r, 1);
          board.unshift(Array<number>(cols).fill(0));
          cleared++;
          r++;
        }
      }
      if (cleared > 0) setScore((s) => s + cleared * 100);
      pieceIdx = Math.floor(Math.random() * TETROMINOES.length);
      shape = TETROMINOES[pieceIdx].map((row) => [...row]);
      px = 3;
      py = 0;
      if (collides(px, py, shape)) {
        over = true;
        setRunning(false);
      }
    };

    const draw = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, cols * cell, rows * cell);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c]) {
            ctx.fillStyle = TETRIS_COLORS[board[r][c] - 1];
            ctx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);
          }
        }
      }
      if (!over) {
        ctx.fillStyle = TETRIS_COLORS[pieceIdx];
        shape.forEach((row, r) =>
          row.forEach((val, c) => {
            if (val) ctx.fillRect((px + c) * cell + 1, (py + r) * cell + 1, cell - 2, cell - 2);
          }),
        );
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (over) return;
      if (event.key === 'ArrowLeft' && !collides(px - 1, py, shape)) px--;
      else if (event.key === 'ArrowRight' && !collides(px + 1, py, shape)) px++;
      else if (event.key === 'ArrowDown' && !collides(px, py + 1, shape)) py++;
      else if (event.key === 'ArrowUp' || event.key === ' ') {
        const rotated = shape[0].map((_, idx) => shape.map((row) => row[idx]).reverse());
        if (!collides(px, py, rotated)) shape = rotated;
      } else return;
      event.preventDefault();
      draw();
    };

    window.addEventListener('keydown', onKey);
    const timer = setInterval(() => {
      if (over) return;
      if (!collides(px, py + 1, shape)) py++;
      else merge();
      draw();
    }, 450);
    draw();

    return () => {
      window.removeEventListener('keydown', onKey);
      clearInterval(timer);
    };
  }, [seed]);

  return (
    <div className="game-win">
      <div className="game-bar">
        <strong>Tetris Cube</strong>
        <span>Score: {score}</span>
        <button type="button" className="win-btn small" onClick={() => setSeed((s) => s + 1)}>
          Restart
        </button>
      </div>
      <canvas ref={canvasRef} width={200} height={360} className="game-canvas" />
      <p className="muted-sm">{running ? 'Use Arrow keys to move/drop, Up or Space to rotate.' : 'Game over! Press Restart.'}</p>
    </div>
  );
}

export function SnakeWindow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [alive, setAlive] = useState(true);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 16;
    const grid = 18;
    let snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    let dir = { x: 1, y: 0 };
    let food = { x: 12, y: 8 };
    let dead = false;
    setScore(0);
    setAlive(true);

    const onKey = (event: KeyboardEvent) => {
      if (dead) return;
      if (event.key === 'ArrowUp' && dir.y === 0) dir = { x: 0, y: -1 };
      else if (event.key === 'ArrowDown' && dir.y === 0) dir = { x: 0, y: 1 };
      else if (event.key === 'ArrowLeft' && dir.x === 0) dir = { x: -1, y: 0 };
      else if (event.key === 'ArrowRight' && dir.x === 0) dir = { x: 1, y: 0 };
      else return;
      event.preventDefault();
    };

    const draw = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, grid * size, grid * size);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(food.x * size + 2, food.y * size + 2, size - 4, size - 4);
      snake.forEach((seg, idx) => {
        ctx.fillStyle = idx === 0 ? '#34d399' : '#10b981';
        ctx.fillRect(seg.x * size + 1, seg.y * size + 1, size - 2, size - 2);
      });
    };

    window.addEventListener('keydown', onKey);
    const timer = setInterval(() => {
      if (dead) return;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid || snake.some((s) => s.x === head.x && s.y === head.y)) {
        dead = true;
        setAlive(false);
        return;
      }
      snake = [head, ...snake];
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10);
        food = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
      } else {
        snake.pop();
      }
      draw();
    }, 140);
    draw();

    return () => {
      window.removeEventListener('keydown', onKey);
      clearInterval(timer);
    };
  }, [seed]);

  return (
    <div className="game-win">
      <div className="game-bar">
        <strong>Snake Candy</strong>
        <span>Score: {score}</span>
        <button type="button" className="win-btn small" onClick={() => setSeed((s) => s + 1)}>
          Restart
        </button>
      </div>
      <canvas ref={canvasRef} width={288} height={288} className="game-canvas" />
      <p className="muted-sm">{alive ? 'Use Arrow keys to steer.' : 'Crashed! Press Restart.'}</p>
    </div>
  );
}

export function PongWindow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scores, setScores] = useState({ player: 0, cpu: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let py = 95;
    let cy = 95;
    let bx = 180;
    let by = 120;
    let vx = 3;
    let vy = 2.4;

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      py = Math.max(0, Math.min(190, event.clientY - rect.top - 25));
    };
    canvas.addEventListener('mousemove', onMove);

    const timer = setInterval(() => {
      bx += vx;
      by += vy;
      if (by < 5 || by > 235) vy = -vy;
      if (bx < 16 && by > py && by < py + 50) vx = Math.abs(vx);
      if (bx > 344 && by > cy && by < cy + 50) vx = -Math.abs(vx);
      cy += (by - (cy + 25)) * 0.08;

      if (bx < 0) {
        setScores((s) => ({ ...s, cpu: s.cpu + 1 }));
        bx = 180;
        by = 120;
        vx = 3;
      } else if (bx > 360) {
        setScores((s) => ({ ...s, player: s.player + 1 }));
        bx = 180;
        by = 120;
        vx = -3;
      }

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 360, 240);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(8, py, 8, 50);
      ctx.fillRect(344, cy, 8, 50);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();
    }, 16);

    return () => {
      canvas.removeEventListener('mousemove', onMove);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="game-win">
      <div className="game-bar">
        <strong>Pong Candy</strong>
        <span>You {scores.player} : {scores.cpu} CPU</span>
      </div>
      <canvas ref={canvasRef} width={360} height={240} className="game-canvas" />
      <p className="muted-sm">Move your mouse vertically over the canvas to control the left paddle.</p>
    </div>
  );
}
