import G6 from '@antv/g6';
import insertCss from 'insert-css';
import axios from 'axios';
import { myData } from './information.js';
import { parseJson, genTable, attachListeners, filterTable, filterId, filterIndex } from './process_data.js';
import './filter.js';
import './style.css';
import { categoryFilter } from './filter.js';
import { showChart } from './chart.js'



export function showGraph(graphData) {

  document.getElementById("container").innerHTML = "";
  
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
          <h4>${e.item.getModel().id}</h4>
          <ul>
            <li>Incoming: ${e.item.getModel().incoming_requests}</li>
            <li>Outgoing: ${e.item.getModel().outgoing_requests}</li>
          </ul>`;
      }
      else
      {
          outDiv.innerHTML = `
          <h4>${e.item.getModel().source}</h4>
          <h1><center><bold>↓</bold></center><h1>
          <h4>${e.item.getModel().target}</h4>
          <ul>
            <li>Total_requests: ${e.item.getModel().total_requests}</li>
          </ul>`;
      }
      return outDiv;
    },
  });

  const width = document.getElementById('container').scrollWidth + 0;
  const height = document.getElementById('container').scrollHeight + 900;
  const graph = new G6.Graph({
    container: 'container',
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
              'click-select',
              ],
    },
  });

  // listen to the node click event
  graph.on('node:click', displayChart);
  graph.data(graphData);
  graph.render();

  document.getElementById("chartButton").style.display = "none";
  document.getElementById("showTableButton").style.display = "none";
}

var gCategory = "";
var gTransitionEnd = "";

export function emptyContainers() {
  var containers = ["deviceChart", "utteranceChart", "billersChart", "mostUsedChart"];
  for(var i = 0; i < containers.length; i++) {
    document.getElementById(containers[i]).innerHTML = "";
  }
}

function displayChart(event) {

  if(event.item.getModel().incoming_requests == event.item.getModel().outgoing_requests 
    || event.item.getModel().incoming_requests == 0
    || event.item.getModel().outgoing_requests == 0) {
    return;
  }

  toggleTable("show");
  const item = event.item;
  gCategory = document.getElementById('hfc').value;
  gTransitionEnd = item.getModel().id;
  document.getElementById("container").innerHTML = "";
  emptyContainers();
  showChart(gCategory, gTransitionEnd);

  document.getElementById("showTableButton").style.display = "block";
}

function backToChart() {
  document.getElementById("chartButton").style.display = "none";
  document.getElementById("showTableButton").style.display = "block";
  toggleTable("show");
  document.getElementById("container").innerHTML = "";
  emptyContainers();
  showChart(gCategory, gTransitionEnd);
}

function displayTable(category, transitionEnd, filterType, filterValue) {
  toggleTable("hide");
  document.getElementById("showTableButton").style.display = "none";
  document.getElementById("container").innerHTML = genTable(category, transitionEnd);
  attachListeners();
  document.getElementById("chartButton").style.display = "block";
  document.getElementById("chartButton").addEventListener("click", backToChart);

  if(filterType != undefined) {
    document.getElementById(filterType).value = filterValue;
    filterTable();
  }

}

export function showTable(event) {
  if(event.data === undefined) return;
  if(event.data.data === undefined) return;

  emptyContainers();
  displayTable(gCategory, gTransitionEnd, event.data.data.filterType, event.data.data.item);
}

function directTableDisplay() {
  displayTable(gCategory, gTransitionEnd);
}

function displayGraph() {
  toggleTable("hide");
  categoryFilter();
}


document.getElementById("graphButton").addEventListener("click", displayGraph);
document.getElementById("showTableButton").addEventListener("click", directTableDisplay);

function showDate() {
  console.log(document.getElementById("timestamp").value);
}

document.getElementById("timestamp").addEventListener("change", showDate);

export var s3Data = {};

async function getDataPromise(url) {
  const response = await axios.get(url);
  return response.data;
}

function getS3Data(url) {
  getDataPromise(url)
  .then((data) => {
    s3Data = data;
    showGraph(parseJson());
    toggleTable("hide");
  });
}

var url = "https://jkpaul-s3-dev.s3-us-west-2.amazonaws.com/say_hello/mock_data.json";

getS3Data(url);


function testRandom() {

  //console.log("--test end---");
}

function toggleTable(visibility) {
  var lTable = document.getElementById("charts");
  lTable.style.display = (visibility == "hide") ? "none" : "table";
}