import assert from 'node:assert';
import test from 'node:test';
import { calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../server/technicalIndicators.ts';

test('calculateEMA handles basic geometric progression correctly', () => {
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const ema = calculateEMA(prices, 5);

  assert.strictEqual(ema.length, prices.length);
  assert.strictEqual(ema[0], null);
  assert.strictEqual(ema[3], null);
  // SMA of first 5 items (10, 11, 12, 13, 14) is 12
  assert.strictEqual(ema[4], 12);
  assert.ok(ema[10]! > 17);
});

test('calculateRSI returns values bounded between 0 and 100', () => {
  const prices = [
    100, 102, 101, 103, 105, 107, 106, 108, 110, 112,
    111, 113, 115, 117, 119, 121, 120, 122, 124, 126
  ];
  const rsi = calculateRSI(prices, 14);

  assert.strictEqual(rsi.length, prices.length);
  const lastRsi = rsi[rsi.length - 1];
  assert.ok(lastRsi !== null);
  assert.ok(lastRsi >= 0 && lastRsi <= 100);
  assert.ok(lastRsi > 50, 'Uptrending sequence should have RSI > 50');
});

test('calculateMACD generates lines and histogram', () => {
  const prices: number[] = [];
  for (let i = 0; i < 50; i++) {
    prices.push(100 + i * 1.5 + Math.sin(i) * 2);
  }
  const { macdLine, signalLine, histogram } = calculateMACD(prices, 12, 26, 9);
  assert.strictEqual(macdLine.length, 50);
  assert.strictEqual(signalLine.length, 50);
  assert.strictEqual(histogram.length, 50);
  assert.ok(macdLine[49] !== null);
  assert.ok(signalLine[49] !== null);
});

test('calculateBollingerBands returns upper > middle > lower', () => {
  const prices: number[] = [];
  for (let i = 0; i < 30; i++) {
    prices.push(500 + Math.sin(i) * 10);
  }
  const bb = calculateBollingerBands(prices, 20, 2);
  const lastIdx = prices.length - 1;
  assert.ok(bb.upper[lastIdx]! > bb.middle[lastIdx]!);
  assert.ok(bb.middle[lastIdx]! > bb.lower[lastIdx]!);
});
