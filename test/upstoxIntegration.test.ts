import assert from 'node:assert';
import test from 'node:test';
import { upstoxInstruments } from '../server/upstox/instruments.ts';
import { SymbolNormalizer } from '../server/marketData/symbolNormalizer.ts';

test('UpstoxInstruments maps key NSE equities to ISIN keys', () => {
  const relKey = upstoxInstruments.getKeySync('RELIANCE');
  assert.strictEqual(relKey, 'NSE_EQ|INE002A01018');

  const tcsKey = upstoxInstruments.getKeySync('TCS');
  assert.strictEqual(tcsKey, 'NSE_EQ|INE467B01029');

  const hdfcKey = upstoxInstruments.getKeySync('HDFCBANK');
  assert.strictEqual(hdfcKey, 'NSE_EQ|INE040A01034');

  const infyKey = upstoxInstruments.getKeySync('INFY');
  assert.strictEqual(infyKey, 'NSE_EQ|INE009A01021');
});

test('UpstoxInstruments maps indices to index keys', () => {
  const niftyKey = upstoxInstruments.getKeySync('NIFTY50');
  assert.strictEqual(niftyKey, 'NSE_INDEX|Nifty 50');

  const bankNiftyKey = upstoxInstruments.getKeySync('BANKNIFTY');
  assert.strictEqual(bankNiftyKey, 'NSE_INDEX|Nifty Bank');

  const cnxItKey = upstoxInstruments.getKeySync('^CNXIT');
  assert.strictEqual(cnxItKey, 'NSE_INDEX|Nifty IT');

  const cnxEnergyKey = upstoxInstruments.getKeySync('CNXENERGY');
  assert.strictEqual(cnxEnergyKey, 'NSE_INDEX|Nifty Energy');
});

test('SymbolNormalizer maps to Upstox keys correctly', () => {
  assert.strictEqual(SymbolNormalizer.toUpstox('RELIANCE'), 'NSE_EQ|INE002A01018');
  assert.strictEqual(SymbolNormalizer.toUpstox('NIFTY50'), 'NSE_INDEX|Nifty 50');
  assert.strictEqual(SymbolNormalizer.toUpstox('^NSEI'), 'NSE_INDEX|Nifty 50');
  assert.strictEqual(SymbolNormalizer.toUpstox('^NSEBANK'), 'NSE_INDEX|Nifty Bank');
});
