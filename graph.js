import G6 from '@antv/g6';
import insertCss from 'insert-css';
import { myData } from './information.js';
import { parseJson } from './process_data.js';
import './filter.js'
import 'antd/dist/antd.css';

import React, { Component } from 'react';
import { render } from 'react-dom';
import App from './list';
import { BrowserRouter } from 'react-router-dom';

insertCss(`
  .g6-component-tooltip {
    border-radius: 6px;
    font-size: 12px;
    color: #fff;
    background-color: #000;
    padding: 2px 8px;
    text-align: Left;
  }
`);

const data = parseJson();

function getColor(enter, exit, id) {
  if(id === 'verifyVoicePurchaseEnabledAction' ||
      id === 'PayBillWorkflowAction' )
    return '#00cc66'
  return (enter != exit)?'#ff6666':'#C6E5FF';
}

G6.registerNode(
  'sql',
  {
    drawShape(cfg, group) {
      const rect = group.addShape('rect', {
        attrs: {
          x: -113,
          y: -25,
          width: 225,
          height: 50,
          radius: 10,
          stroke: '#5B8FF9',
          fill: getColor(cfg.incoming_requests, 
                        cfg.outgoing_requests, 
                        cfg.id),
          lineWidth: 3,
        },
        name: 'rect-shape',
      });
      group.addShape('text', {
          attrs: {
            text: cfg.id,
            x: 0,
            y: 0,
            fill: '#00287E',
            fontSize: 12,
            textAlign: 'center',
            textBaseline: 'middle',
            fontWeight: 'bold',
          },
          name: 'text-shape',
        });
      return rect;
    },
  },
  'single-node',
);

const tooltip = new G6.Tooltip({
  // offsetX and offsetY include the padding of the parent container
  // offsetX 与 offsetY 需要加上父容器的 padding
  offsetX: 16 + 10,
  offsetY: 24 + 10,
  // the types of items that allow the tooltip show up
  // 允许出现 tooltip 的 item 类型
  itemTypes: ['node', 'edge'],
  // custom the tooltip's content
  // 自定义 tooltip 内容
  getContent: (e) => {
    const outDiv = document.createElement('div');
    outDiv.style.width = 'fit-content';
    //outDiv.style.padding = '0px 0px 20px 0px';
    if(e.item.getType() === 'node')
    {
      outDiv.innerHTML = `
        <h4>State Information</h4>
        <ul>
          <li>Incoming: ${e.item.getModel().incoming_requests}</li>
          <li>Outgoing: ${e.item.getModel().outgoing_requests}</li>
        </ul>`;
    }
    else
    {
        outDiv.innerHTML = `
        <h4>Transition Information</h4>
        <ul>
          <li>Total_requests: ${e.item.getModel().total_requests}</li>
        </ul>`;
    }
    return outDiv;
  },
});

const width = document.getElementById('graphContainer').scrollWidth + 0;
const height = document.getElementById('graphContainer').scrollHeight + 900;
export const graph = new G6.Graph({
  container: 'graphContainer',
  width,
  height,
  layout: {
    type: 'dagre',
    nodesepFunc: (d) => {
      return 150;
    },
    ranksep: 70,
    controlPoints: true,
  },
  nodeStateStyles: {
    selected: {
      stroke: '#d9d9d9',
      fill: '#5394ef',
    },
  },
  defaultNode: {
    type: 'sql',
  },
  defaultEdge: {
    type: 'polyline',
    style: {
      radius: 20,
      offset: 45,
      endArrow: { path: G6.Arrow.vee(), fill: '#D' },
      lineWidth: 2,
      stroke: '#D',
    },
  },
  plugins: [tooltip],
  modes: {
    default: [
            'drag-canvas',
            'zoom-canvas',
            'click-select'],
  },
});

function handleNodeClick(event) {
  const item = event.item;
}

// listen to the node click event
graph.on('node:click', handleNodeClick);
