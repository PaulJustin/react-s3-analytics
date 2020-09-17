import { Chart } from '@antv/g2';
import { DataSet } from '@antv/data-set';
import { showTable, s3Data } from './index.js'
import { filterId, filterIndex } from './process_data.js';

var gChartCategory = "";
var gChartTransitionEnd = "";

var deviceCount = {};
var billersCount = {};
var utteranceCount = {};

function addKey(key, map) {
    var count;
    count = map[key];
    map[key] = count ? count + 1 : 1;
}

function countAll(category, transitionEnd) {
    deviceCount = {};
    billersCount = {};
    utteranceCount = {};

    var json = s3Data;
    json = json.root;
    var i;
    for(i = 0; i < json.length; i++) {
      var obj = json[i];
      var listOfTransitions = obj.list_of_transitions;
      var listOfHfcCategory = obj.hfc_category;
  
      var toLower = function(x) { 
        return x.toLowerCase();
      };
      listOfHfcCategory = listOfHfcCategory.map(toLower);
  
      var isExists = false;
      var isLastTransition = true;
      if(category != 'all') {
        isExists = listOfHfcCategory.includes(category.toLowerCase());
      }
      if(listOfTransitions[listOfTransitions.length-1][1] != transitionEnd) {
        isLastTransition = false;
      }
      if(isLastTransition && (category === 'all' || isExists)) {
        var deviceId = obj.deviceId;
        var utteranceList = obj.utterance_id;
        var billerList = obj.biller_ids;
        
        //Decive counter
        addKey(deviceId, deviceCount);
        
        //Utterance counter
        for(let k = 0; k < utteranceList.length; k++) {
            addKey(utteranceList[k], utteranceCount);
        }

        //biller counter
        for(let k = 0; k < billerList.length; k++) {
            addKey(billerList[k], billersCount);
        }

      }
    }
}

function genPieChartData(counter, type) {
    var data = [];
    var total = 0;
    var key;

    for(key in counter) {
        total += counter[key];
    }

    for(key in counter) {
        let value = counter[key];
        let percentValue = (value/total);
        percentValue = percentValue;
        data.push({item: key, count: value, percent: percentValue, filterType: type});
    }
    return [data, total];
}

function genFunnelChartData(counter) {
    var data = [];
    var total = 0;
    var key;

    for(key in counter) {
        total += counter[key];
    }

    for(key in counter) {
        let value = counter[key];
        data.push({action: key, pv: value});
    }

    var compare = function(a, b) {
        if (a.pv > b.pv){
            return -1;
        }
        if (a.pv < b.pv){
            return 1;
        }
        return 0;
    }
    data.sort(compare);
    return [data, total];
}

export function showChart(category, transitionEnd) {

    gChartCategory = category;
    gChartTransitionEnd = transitionEnd;

    countAll(category, transitionEnd);

    const deviceData = genPieChartData(deviceCount, filterId[filterIndex.DEVICE]);
    deviceChart(deviceData[0], deviceData[1]);

    const utteranceData = genPieChartData(utteranceCount, filterId[filterIndex.UTTERANCE]);
    utteranceChart(utteranceData[0], utteranceData[1]);

    const billersData = genPieChartData(billersCount, filterId[filterIndex.BILLER]);
    billersChart(billersData[0], billersData[1]);

    const funnelData = genFunnelChartData(billersCount);
    mostUsedChart(funnelData[0], funnelData[1]);
}

function deviceChart(chartData, totalValue) {

    const data = chartData;

    const chart = new Chart({
    container: 'deviceChart',
    autoFit: true,
    height: 500,
    });
    chart.data(data);
    chart.scale('percent', {
    formatter: (val) => {
        val = val * 100 + '%';
        return val;
    },
    });
    chart.coordinate('theta', {
    radius: 0.75,
    innerRadius: 0.6,
    });
    chart.tooltip({
    showTitle: false,
    showMarkers: false,
    itemTpl: '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
    });
    chart
    .annotation()
    .text({
        position: ['50%', '50%'],
        content: 'Total',
        style: {
        fontSize: 14,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: -20,
    })
    .text({
        position: ['50%', '50%'],
        content: 'Device',
        style: {
        fontSize: 20,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: 20,
    })
    .text({
        position: ['50%', '50%'],
        content: totalValue,
        style: {
        fontSize: 14,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: 40,
    });
    chart
    .interval()
    .adjust('stack')
    .position('percent')
    .color('item')
    .label('percent', (percent) => {
        return {
        content: (data) => {
            return `${data.item}: ${percent * 100}%`;
        },
        };
    })
    .tooltip('item*percent', (item, percent) => {
        percent = percent * 100 + '%';
        return {
        name: item,
        value: percent,
        };
    });

    chart.interaction('element-active');

    chart.on('plot:click', showTable);

    chart.render();
}

function utteranceChart(chartData, totalValue) {

    const data = chartData;
    const chart = new Chart({
    container: 'utteranceChart',
    autoFit: true,
    height: 500,
    });

    chart.data(data);
    chart.scale('percent', {
    formatter: (val) => {
        val = val * 100 + '%';
        return val;
    },
    });
    chart.coordinate('theta', {
    radius: 0.75,
    innerRadius: 0.6,
    });
    chart.tooltip({
    showTitle: false,
    showMarkers: false,
    itemTpl: '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
    });
    chart
    .annotation()
    .text({
        position: ['50%', '50%'],
        content: 'Total',
        style: {
        fontSize: 14,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: -20,
    })
    .text({
        position: ['50%', '50%'],
        content: 'Utterance',
        style: {
        fontSize: 20,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: 20,
    })
    .text({
        position: ['50%', '50%'],
        content: totalValue,
        style: {
        fontSize: 14,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: 40,
    });
    chart
    .interval()
    .adjust('stack')
    .position('percent')
    .color('item')
    .label('percent', (percent) => {
        return {
        content: (data) => {
            return `${data.item}: ${percent * 100}%`;
        },
        };
    })
    .tooltip('item*percent', (item, percent) => {
        percent = percent * 100 + '%';
        return {
        name: item,
        value: percent,
        };
    });

    chart.interaction('element-active');
    
    chart.on('plot:click', showTable);

    chart.render();
}

function billersChart(chartData, totalValue) {
    const data = chartData;
    const chart = new Chart({
    container: 'billersChart',
    autoFit: true,
    height: 500,
    });
    chart.data(data);
    chart.scale('percent', {
    formatter: (val) => {
        val = val * 100 + '%';
        return val;
    },
    });
    chart.coordinate('theta', {
    radius: 0.75,
    innerRadius: 0.6,
    });
    chart.tooltip({
    showTitle: false,
    showMarkers: false,
    itemTpl: '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
    });
    // 辅助文本
    chart
    .annotation()
    .text({
        position: ['50%', '50%'],
        content: 'Total',
        style: {
        fontSize: 14,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: -20,
    })
    .text({
        position: ['50%', '50%'],
        content: 'Billers',
        style: {
        fontSize: 20,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: 20,
    })
    .text({
        position: ['50%', '50%'],
        content: totalValue,
        style: {
        fontSize: 14,
        fill: '#8c8c8c',
        textAlign: 'center',
        },
        offsetY: 40,
    });
    chart
    .interval()
    .adjust('stack')
    .position('percent')
    .color('item')
    .label('percent', (percent) => {
        return {
        content: (data) => {
            return `${data.item}: ${percent * 100}%`;
        },
        };
    })
    .tooltip('item*percent', (item, percent) => {
        percent = percent * 100 + '%';
        return {
        name: item,
        value: percent,
        };
    });

    chart.interaction('element-active');

    chart.on('plot:click', showTable);

    chart.render();
}

function mostUsedChart(chartData, totalValue) {
    const { DataView } = DataSet;
    const dv = new DataView().source(chartData);
    dv.transform({
    type: 'map',
    callback(row) {
        row.percent = row.pv / totalValue;
        return row;
    },
    });
    const data = dv.rows;
    const chart = new Chart({
    container: 'mostUsedChart',
    autoFit: true,
    height: 500,
    padding: [20, 120, 95],
    });
    chart.data(data);
    chart.axis(false);
    chart.tooltip({
    showTitle: false,
    showMarkers: false,
    itemTpl:
        '<li style="margin-bottom:4px;list-style-type:none;padding: 0;">' +
        '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
        '{name}<br/>' +
        '<span style="padding-left: 16px;line-height: 16px;">Total：{pv}</span><br/>' +
        '<span style="padding-left: 16px;line-height: 16px;">Percent：{percent}</span><br/>' +
        '</li>',
    });
    chart
    .coordinate('rect')
    .transpose()
    .scale(1, -1);
    chart
    .interval()
    .adjust('symmetric')
    .position('action*percent')
    .shape('funnel')
    .color('action', ['#0050B3', '#1890FF', '#40A9FF', '#69C0FF', '#BAE7FF'])
    .label(
        'action*pv',
        (action, pv) => {
        return {
            content: `${action} ${pv}`,
        };
        },
        {
        offset: 35,
        labelLine: {
            style: {
            lineWidth: 1,
            stroke: 'rgba(0, 0, 0, 0.15)',
            },
        },
        }
    )
    .tooltip('action*pv*percent', (action, pv, percent) => {
        return {
        name: action,
        percent: +percent * 100 + '%',
        pv,
        };
    })
    .animate({
        appear: {
        animation: 'fade-in'
        },
        update: {
        annotation: 'fade-in'
        }
    });

    chart.interaction('element-active');

    chart.on('beforepaint', () => {
    chart.annotation().clear(true);
    const chartData = chart.getData();
    chartData.forEach((obj) => {
        chart.annotation().text({
        top: true,
        position: {
            action: obj.action,
            percent: 'median',
        },
        content: +obj.percent * 100 + '%', 
        style: {
            stroke: null,
            fill: '#fff',
            textAlign: 'center',
        },
        });
    });
    });

    chart.render();

}