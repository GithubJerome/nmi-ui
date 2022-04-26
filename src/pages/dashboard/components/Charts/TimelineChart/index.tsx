import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';

import DataSet from '@antv/data-set';
import React from 'react';
import autoHeight from '../autoHeight';
import styles from './index.less';

export interface TimelineChartProps {
  data: {
    epoch: number;
    soap: number;
    disinfectant: number;
  }[];
  liquidType: [string];
  color?: string;
  color1?: string;
  color2?: string;
  title?: string;
  titleMap: { soap: string; disinfectant: string };
  padding?: [number, number, number, number];
  height?: number;
  style?: React.CSSProperties;
  borderWidth?: number;
  longText: string;
}

const TimelineChart: React.FC<TimelineChartProps> = (props) => {
  const {
    height = 400,
    color1 = 'rgba(70,203,24, 1)',
    color2 = 'rgba(237,125,49, 1)',
    padding = [30, 30, 60, 40] as [number, number, number, number],
    data: sourceData,
    liquidType,
    longText
  } = props;

  const data = Array.isArray(sourceData) ? sourceData : [{ epoch: 0, soap: 0, disinfectant: 0 }];

  data.sort((a, b) => a.epoch - b.epoch);

  const cols = {
    period: {
      range: [0, 1]
    }
  };

  const getColor = (liquidType) => {
    if(liquidType.length === 1){
      if(liquidType[0] === "soap"){
        return [color1]
      } 
      return [color2]
      
    } 
    return [color1, color2];
  }


  return (
    <div className={styles.timelineChart} style={{ height }}>
      <div>
        <p style={{ textAlign: "center", marginBottom: "0", fontSize: "12px" }}>{longText}</p>
        <Chart height={height} padding={padding} data={data} scale={cols} forceFit>
          <Legend position="top" />
          <Axis name="period" />
          <Axis name="value" />
          <Tooltip useHtml htmlContent={(titles, items) => {
            if(items.length > 1){
              return `<div className="g2-tooltip" style='position: absolute; visibility: hidden; z-index: 8; transition: visibility 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s, left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s; background-color: rgba(255, 255, 255, 0.9); box-shadow: rgb(174, 174, 174) 0px 0px 10px; border-radius: 3px; color: rgb(87, 87, 87); font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif; line-height: 20px; padding: 10px 10px 6px; left: 301.4px; top: 80px; display: none;'>
                <div className="g2-tooltip-title">${titles} </div>
                <ul style="margin: 0px; list-style-type: none; padding: 0px;">
                  <li style="margin: 0px 0px 4px; list-style-type: none; padding: 0px;">
                    <svg viewBox="0 0 5 5" class="g2-tooltip-marker" style="width: 5px; height: 5px; border-radius: unset; display: inline-block; margin-right: 8px;"><path d="M2.5,2.5m-2.5,0a2.5,2.5,0,1,0,5,0a2.5,2.5,0,1,0,-5,0" fill="${items[0].color}" stroke="none"></path></svg>
                    ${items[0].value} L
                  </li>
                  <li style="margin: 0px 0px 4px; list-style-type: none; padding: 0px;">
                    <svg viewBox="0 0 5 5" class="g2-tooltip-marker" style="width: 5px; height: 5px; border-radius: unset; display: inline-block; margin-right: 8px;"><path d="M2.5,2.5m-2.5,0a2.5,2.5,0,1,0,5,0a2.5,2.5,0,1,0,-5,0" fill="${items[1].color}" stroke="none"></path></svg>
                    ${items[1].value} L
                  </li>
                </ul>
              </div>`
            }
            return `<div className="g2-tooltip" style='position: absolute; visibility: hidden; z-index: 8; transition: visibility 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s, left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s; background-color: rgba(255, 255, 255, 0.9); box-shadow: rgb(174, 174, 174) 0px 0px 10px; border-radius: 3px; color: rgb(87, 87, 87); font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif; line-height: 20px; padding: 10px 10px 6px; left: 301.4px; top: 80px; display: none;'>
                      <div className="g2-tooltip-title">${titles} </div>
                      <ul style="margin: 0px; list-style-type: none; padding: 0px;">
                        <li style="margin: 0px 0px 4px; list-style-type: none; padding: 0px;">
                          <svg viewBox="0 0 5 5" class="g2-tooltip-marker" style="width: 5px; height: 5px; border-radius: unset; display: inline-block; margin-right: 8px;"><path d="M2.5,2.5m-2.5,0a2.5,2.5,0,1,0,5,0a2.5,2.5,0,1,0,-5,0" fill="${items[0].color}" stroke="none"></path></svg>
                          ${items[0].value} L
                        </li>
                      </ul>
                    </div>`
            }}
          />
          <Geom
            type="line"
            position="period*value"
            size={2}
            color={['type', getColor(liquidType)]}
          />
          <Geom
            type="point"
            shape="circle"
            position="period*value"
            size={2}
            color={['type', getColor(liquidType)]}
          />
          
        </Chart>
      </div>
    </div>
  );
};

export default autoHeight()(TimelineChart);
