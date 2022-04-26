import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';

import DataSet from '@antv/data-set';
import React from 'react';
import Slider from 'bizcharts-plugin-slider';
import autoHeight from '../autoHeight';
import styles from './index.less';

export interface TimelineChart2Props {
  data: {
    epoch: number;
    consumption: number;
  }[];
  title?: string;
  titleMap: { consumption: string; };
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
      consumption: 'consumption',
    },
    borderWidth = 2,
    data: sourceData,
  } = props;

  const data = Array.isArray(sourceData) ? sourceData : [{ epoch: 0, consumption: 0 }];

  data.sort((a, b) => a.epoch - b.epoch);

  let max;
  if (data[0] && data[0].consumption) {
    max = Math.max(
      [...data].sort((a, b) => b.consumption - a.consumption)[0].consumption,
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
        const epoch = obj.epoch;
        return epoch <= ds.state.end && epoch >= ds.state.start;
      },
    })
    .transform({
      type: 'map',
      callback(row: { consumption: string; }) {
        const newRow = { ...row };
        newRow[titleMap.consumption] = row.consumption;
        return newRow;
      },
    })
    .transform({
      type: 'fold',
      fields: [titleMap.consumption], // 展开字段集
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

  return (
    <div className={styles.timelineChart} style={{ height }}>
      <div>
        {title && <h4>{title}</h4>}
        <Chart height={height} padding={padding} data={dv} scale={cols} forceFit>
          <Axis name="day" />
          <Axis name="consumption" />
          <Tooltip />
          <Legend name="key" position="top" />
          <Geom type="line" position="day*value" size={borderWidth} color="key" />
          <Geom
            type="point"
            shape="circle"
            position="day*value"
            size={2}
            color="key"
          />
        </Chart>
      </div>
    </div>
  );
};

export default autoHeight()(TimelineChart2);
