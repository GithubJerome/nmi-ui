import { AnalysisData, LiquidStockInfoType } from './data.d';

// mock data
const liquidStockInfo: LiquidStockInfoType[] = [];

const fakeY0 = [57, 75];
liquidStockInfo.push({
  x: "Soap",
  y: fakeY0[0]
},{
  x: "Pouches",
  y: fakeY0[1]
});

const liquidUsageData = [];
for (let i = 0; i < 10; i += 1) {
  liquidUsageData.push({
    month: new Date().getTime() + 1000 * 60 * 30 * i,
    liquid1: Math.floor(Math.random() * 100) + 10,
    liquid2: Math.floor(Math.random() * 100) + 10,
  });
}

const waterUsageData = [];
for (let i = 0; i < 10; i += 1) {
  waterUsageData.push({
    month: new Date().getTime() + 1000 * 60 * 30 * i,
    waterUsage: Math.floor(Math.random() * 100) + 10,
  });
}

const getFakeChartData: AnalysisData = {
  liquidStockInfo,
  liquidUsageData,
  waterUsageData
};

export default {
  'GET  /api/fake_chart_data': getFakeChartData,
};
