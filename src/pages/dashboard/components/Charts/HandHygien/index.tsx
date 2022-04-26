import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';

import DataSet from '@antv/data-set';
import React from 'react';
import Slider from './node_modules/bizcharts-plugin-slider';
import autoHeight from '../autoHeight';
import styles from './index.less';

export interface TimelineChart2Props {
  data: {
    epoch: number;
    water_usage: number;
  }[];
  title?: string;
  titleMap: { water_usage: string; };
  padding?: [number, number, number, number];
  height?: number;
  style?: React.CSSProperties;
  borderWidth?: number;
}

const TimelineChart2: React.FC<TimelineChart2Props> = (props) => {
  const {
    title,
    height = 400,
    padding = [60, 20, 40, 40] as [number, number, number, number],
    titleMap = {
      water_usage: 'water_usage',
    },
    borderWidth = 2,
    data: sourceData,
  } = props;

  const data = Array.isArray(sourceData) ? sourceData : [{ epoch: 0, water_usage: 0 }];

  data.sort((a, b) => a.epoch - b.epoch);

  let max;
  if (data[0] && data[0].water_usage) {
    max = Math.max(
      [...data].sort((a, b) => b.water_usage - a.water_usage)[0].water_usage,
    );
  }

  const ds = new DataSet({
    state: {
      start: data[0].epoch,
      end: data[data.length - 1].epoch,
    },
  });

  const dv = ds.createView();
  dv.source(data)
    .transform({
      type: 'filter',
      callback: (obj: { epoch: string }) => {
        const date = obj.epoch;
        return date <= ds.state.end && date >= ds.state.start;
      },
    })
    .transform({
      type: 'map',
      callback(row: { water_usage: string; }) {
        const newRow = { ...row };
        newRow[titleMap.water_usage] = row.water_usage;
        return newRow;
      },
    })
    .transform({
      type: 'fold',
      fields: [titleMap.water_usage], // 展开字段集
      key: 'key', // key字段
      value: 'value', // value字段
    });

  const timeScale = {
    type: 'time',
    tickInterval: 60 * 60 * 1000,
    mask: 'HH:mm',
    range: [0, 1],
  };

  const cols = {
    epoch: timeScale,
    value: {
      max,
      min: 0,
    },
  };

  const SliderGen = () => (
    <Slider
      padding={[0, padding[1] + 20, 0, padding[3]]}
      width="auto"
      height={26}
      xAxis="epoch"
      yAxis="water_usage"
      scales={{ epoch: timeScale }}
      data={data}
      start={ds.state.start}
      end={ds.state.end}
      backgroundChart={{ type: 'line' }}
      onChange={({ startValue, endValue }: { startValue: string; endValue: string }) => {
        ds.setState('start', startValue);
        ds.setState('end', endValue);
      }}
    />
  );

  return (
    <div className={styles.timelineChart} style={{ height }}>
      <div>
        {title && <h4>{title}</h4>}
        <Chart height={height} padding={padding} data={dv} scale={cols} forceFit>
          <Axis name="month" />
          <Axis name="water_usage" />
          <Tooltip />
          <Legend name="key" position="top" />
          <Geom type="line" position="month*value" size={borderWidth} color="key" />
        </Chart>
        {/* <div style={{ marginRight: -20 }}>
          <SliderGen />
        </div> */}
      </div>
    </div>
  );
};

export default autoHeight()(TimelineChart2);
