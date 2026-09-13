import { GoogleGenAI } from '@google/genai';
import type { AIAnalysisResult, StockScanResult } from '../shared/types.ts';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return aiClient;
  } catch {
    return null;
  }
}

// Fallback deterministic generator in case Gemini API is not configured or errors out
export function generateDeterministicAnalysis(scan: StockScanResult): AIAnalysisResult {
  const isBullish = scan.signal.includes('BULLISH');
  const isBearish = scan.signal.includes('BEARISH');
  const ind = scan.indicators;
  const pat = scan.patterns;

  const keyPositives: string[] = [];
  const keyRisks: string[] = [];

  if (ind.priceVsEma20 > 0) {
    keyPositives.push(`Price is trading ${ind.priceVsEma20}% above short-term EMA20 (₹${ind.ema20}).`);
  }
  if (ind.ema20 > ind.ema50 && ind.ema50 > ind.ema200) {
    keyPositives.push('Moving average structure is in pristine bullish alignment (EMA20 > EMA50 > EMA200).');
  }
  if (ind.rsi14 >= 50 && ind.rsi14 <= 70) {
    keyPositives.push(`RSI at ${ind.rsi14} confirms solid upward velocity without extreme overbought exhaustion.`);
  }
  if (ind.volumeRatio >= 1.2) {
    keyPositives.push(`Trading volume is ${ind.volumeRatio}x the 20-day average, indicating active participation.`);
  }
  if (scan.sector_conf.confirmation === 'STRONG') {
    keyPositives.push(`Sector (${scan.sector_conf.sectorName}) is displaying positive momentum agreeing with the stock.`);
  }
  if (scan.nifty.confirmationStatus === 'STRONG') {
    keyPositives.push(`Broader NIFTY 50 trend is currently ${scan.nifty.trend}, providing supportive market wind.`);
  }

  // Risks
  if (ind.rsi14 > 72) {
    keyRisks.push(`RSI is elevated at ${ind.rsi14}, signaling near-term pullback or consolidation risk.`);
  } else if (ind.rsi14 < 35) {
    keyRisks.push(`RSI is depressed at ${ind.rsi14}, indicating persistent selling pressure.`);
  }
  if (ind.priceVsEma20 > 7) {
    keyRisks.push(`Price is extended ${ind.priceVsEma20}% above its EMA20; mean reversion risk is heightened.`);
  }
  if (scan.nifty.trend === 'BEARISH' || scan.nifty.trend === 'STRONG BEARISH') {
    keyRisks.push(`Overall NIFTY 50 market trend is ${scan.nifty.trend}, which may dampen upside momentum.`);
  }
  if (ind.volumeRatio < 0.8) {
    keyRisks.push(`Subdued volume (${ind.volumeRatio}x avg) suggests a lack of institutional conviction.`);
  }
  if (keyRisks.length === 0) {
    keyRisks.push(`Close stop-loss discipline required below nearby support ₹${ind.nearestSupport}.`);
  }

  // Ensure 3-5 positives and 2-4 risks
  while (keyPositives.length < 3) {
    keyPositives.push(`Nearest support base firmly established at ₹${ind.nearestSupport} (Strength: ${ind.supportStrength}/10).`);
  }
  while (keyRisks.length < 2) {
    keyRisks.push(`Breakdown below ₹${ind.nearestSupport} would neutralize the current technical setup.`);
  }

  let summary = '';
  if (isBullish) {
    summary = `${scan.symbol} demonstrates a constructive bullish setup with a quantitative score of ${scan.score}/100, supported by ${scan.primary_signal.toLowerCase()} and supportive moving average structure.`;
  } else if (isBearish) {
    summary = `${scan.symbol} exhibits technical vulnerability with a score of ${scan.score}/100, constrained by ${scan.primary_signal.toLowerCase()} and overhead resistance at ₹${ind.nearestResistance}.`;
  } else {
    summary = `${scan.symbol} is consolidating within a defined band between support ₹${ind.nearestSupport} and resistance ₹${ind.nearestResistance} with a neutral score of ${scan.score}/100.`;
  }

  return {
    symbol: scan.symbol,
    signal: isBullish ? 'BULLISH' : isBearish ? 'BEARISH' : 'NEUTRAL',
    confidence: scan.confidence,
    summary,
    keyPositives: keyPositives.slice(0, 5),
    keyRisks: keyRisks.slice(0, 4),
    technicalSetup: pat.length > 0 ? pat[0].description : `${scan.primary_signal} with price at ₹${scan.price}.`,
    confirmation: `Sector (${scan.sector_conf.sectorName}): ${scan.sector_conf.sectorTrend} | NIFTY 50: ${scan.nifty.trend}. Alignment: ${scan.sector_conf.confirmation}.`,
    invalidation: `A daily close below key support ₹${ind.nearestSupport} invalidates the immediate setup.`,
    setupType: pat.length > 0 ? pat[0].pattern.toUpperCase() : scan.signal,
    generatedAt: new Date().toISOString(),
    isAiGenerated: false,
  };
}

export async function generateAIAnalysis(scan: StockScanResult): Promise<AIAnalysisResult> {
  const client = getAIClient();
  if (!client) {
    return generateDeterministicAnalysis(scan);
  }

  try {
    const inputPayload = {
      symbol: scan.symbol,
      name: scan.name,
      price: scan.price,
      changePercent: scan.changePercent,
      score: scan.score,
      signal: scan.signal,
      confidence: scan.confidence,
      primarySignal: scan.primary_signal,
      secondarySignals: scan.secondary_signals,
      indicators: {
        ema20: scan.indicators.ema20,
        ema50: scan.indicators.ema50,
        ema200: scan.indicators.ema200,
        priceVsEma20: scan.indicators.priceVsEma20,
        rsi14: scan.indicators.rsi14,
        macdHistogram: scan.indicators.macd.histogram,
        macdCrossover: scan.indicators.macd.crossover,
        adx: scan.indicators.adx14.adx,
        volumeRatio: scan.indicators.volumeRatio,
        fiftyTwoWeekHigh: scan.indicators.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: scan.indicators.fiftyTwoWeekLow,
        nearestSupport: scan.indicators.nearestSupport,
        nearestResistance: scan.indicators.nearestResistance,
      },
      patterns: scan.patterns.map((p) => ({
        name: p.pattern,
        direction: p.direction,
        confidence: p.confidence,
        description: p.description,
      })),
      nifty: {
        trend: scan.nifty.trend,
        regime: scan.nifty.regime,
        rsi: scan.nifty.rsi,
      },
      sector: {
        name: scan.sector_conf.sectorName,
        trend: scan.sector_conf.sectorTrend,
        relativeStrength: scan.sector_conf.stockRelativeStrengthVsSector,
      },
    };

    const prompt = `You are an elite quantitative technical analyst for Indian National Stock Exchange (NSE) equities.
Analyze the following programmatically calculated data for ${scan.symbol} and generate an objective, disciplined technical analysis review.

RULES:
1. STRICT TRUTH: Only cite values provided in the JSON input. NEVER invent prices, financial fundamentals, quarterly earnings, rumors, or unsupplied indicators.
2. FINANCIAL SAFETY: You are an analytical tool, NOT a financial advisor. Strictly avoid words like "Guaranteed BUY", "Guaranteed profit", "Will definitely rise", "Risk-free". Use terms like "Bullish setup", "Technical breakout", "Potential resistance rejection", "Watchlist candidate".
3. Return ONLY a valid JSON object matching the requested schema.

INPUT DATA:
${JSON.stringify(inputPayload, null, 2)}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a senior NSE Technical Analyst generating structured technical summaries for traders and portfolio managers. Respond strictly in JSON format without markdown code fences.',
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text?.trim() || '';
    const parsed = JSON.parse(rawText);

    // Validate structured fields
    if (!parsed.summary || !Array.isArray(parsed.keyPositives) || !Array.isArray(parsed.keyRisks)) {
      throw new Error('Invalid AI response schema');
    }

    return {
      symbol: scan.symbol,
      signal: parsed.signal || (scan.score >= 65 ? 'BULLISH' : scan.score <= 49 ? 'BEARISH' : 'NEUTRAL'),
      confidence: parsed.confidence || scan.confidence,
      summary: parsed.summary,
      keyPositives: parsed.keyPositives.slice(0, 5),
      keyRisks: parsed.keyRisks.slice(0, 4),
      technicalSetup: parsed.technicalSetup || parsed.setup || scan.primary_signal,
      confirmation: parsed.confirmation || `Sector: ${scan.sector_conf.sectorTrend}, NIFTY: ${scan.nifty.trend}`,
      invalidation: parsed.invalidation || `Daily close below ₹${scan.indicators.nearestSupport}`,
      setupType: parsed.setupType || scan.primary_signal,
      generatedAt: new Date().toISOString(),
      isAiGenerated: true,
    };
  } catch {
    // Fall back safely to mathematical deterministic generator
    return generateDeterministicAnalysis(scan);
  }
}
