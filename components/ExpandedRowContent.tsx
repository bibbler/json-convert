import React from 'react';
import { MarketMetrics, Analysis } from '../types';

const MetricItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline">
    <dt className="text-sm text-gray-400">{label}</dt>
    <dd className="text-sm font-semibold text-white">{value}</dd>
  </div>
);

const AnalysisItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-300">{label}</h4>
        <p className="mt-1 text-sm text-gray-400">{value}</p>
    </div>
);


export const ExpandedRowContent: React.FC<{ metrics: MarketMetrics; analysis: Analysis }> = ({ metrics, analysis }) => {
  return (
    <div className="p-4 sm:p-6 bg-gray-900/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
                <h3 className="text-base font-bold text-indigo-400 mb-4 tracking-wider uppercase">Market Metrics</h3>
                <dl className="space-y-3">
                    <MetricItem label="Volatility Score" value={metrics.volatilityScore} />
                    <MetricItem label="Mkt Cap / Vol Ratio" value={metrics.marketCapToVolumeRatio} />
                    <MetricItem label="Price to ATH Ratio" value={metrics.priceToAthRatio} />
                    <MetricItem label="Market Score" value={metrics.marketScore} />
                </dl>
            </div>
            <div>
                <h3 className="text-base font-bold text-indigo-400 mb-4 tracking-wider uppercase">Analysis</h3>
                <div className="flex items-center mb-2">
                    <span className="text-sm font-semibold text-gray-300 mr-2">Risk Rating:</span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block bg-yellow-500/20 text-yellow-300">
                        {analysis.riskRating}
                    </span>
                </div>
                <AnalysisItem label="Price Action" value={analysis.priceAction} />
                <AnalysisItem label="Recommendation" value={analysis.recommendation} />
                <AnalysisItem label="Investment Strategy" value={analysis.investmentStrategy} />
            </div>
        </div>
    </div>
  );
};
