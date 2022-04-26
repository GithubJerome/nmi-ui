import { Axis, Chart, Geom, Legend, Tooltip, Label } from 'bizcharts';

import DataSet from '@antv/data-set';
import React from 'react';
import Slider from '@/pages/tutor/course/components/TimelineChart2/node_modules/bizcharts-plugin-slider';
import autoHeight from '../autoHeight';
import styles from './index.less';

export interface TimelineChart2Props {
  data: {
    epoch: number;
    water_usage: number;
  }[];
  title?: string;
  color?: string;
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
    padding = [10, 20, 40, 40] as [number, number, number, number],
    color = 'rgba(111,167,217, 1)',
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
        <Chart height={height} padding={padding} data={dv} scale={cols} forceFit>
          <Axis name="period" />
          <Axis name="water_usage" />
          <Tooltip useHtml htmlContent={(titles, items) => {
            return `<div className="g2-tooltip" style='position: absolute; visibility: hidden; z-index: 8; transition: visibility 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s, left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s; background-color: rgba(255, 255, 255, 0.9); box-shadow: rgb(174, 174, 174) 0px 0px 10px; border-radius: 3px; color: rgb(87, 87, 87); font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif; line-height: 20px; padding: 10px 10px 6px; left: 301.4px; top: 80px; display: none;'>
                      <div className="g2-tooltip-title">${titles} </div>
                      <ul style="margin: 0px; list-style-type: none; padding: 0px;">
                        <li style="margin: 0px 0px 4px; list-style-type: none; padding: 0px;">
                          <svg viewBox="0 0 5 5" class="g2-tooltip-marker" style="width: 5px; height: 5px; border-radius: unset; display: inline-block; margin-right: 8px;"><path d="M2.5,2.5m-2.5,0a2.5,2.5,0,1,0,5,0a2.5,2.5,0,1,0,-5,0" fill="${items[0].color}" stroke="none"></path></svg>
                          ${items[0].value}
                        </li>
                      </ul>
                    </div>`}}
          />
          {/* <Legend name="key" position="top" /> */}
          <Geom type="line" position="period*value" size={borderWidth} color={color}  />
          <Geom
            type="point"
            shape="circle"
            position="period*value"
            size={2}
            color={color} 
          />
        </Chart>
      </div>
    </div>
  );
};

export default autoHeight()(TimelineChart2);
