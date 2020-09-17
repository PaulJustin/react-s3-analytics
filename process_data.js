import { s3Data } from './index.js'

function addKey(state, map) {
  var count;
  count = map[state];
  map[state] = count ? count + 1 : 1;
}

function genNodesData(fromCounter, toCounter, nodes) {
  var key;

  for(key in toCounter) {
    if(fromCounter[key] == undefined) {
      fromCounter[key] = 0;
    }
  }

  for(key in fromCounter) {
      var incomingRequests = toCounter[key] ? toCounter[key] : 0;
      var outgoingRequests = fromCounter[key] ? fromCounter[key] : 0;

      var percent = function(incoming, outgoing) {
        if(incoming == 0) return 0;
        var diff = Math.abs(incoming - outgoing);
        return (diff/incoming * 100).toFixed(2);
      }

      nodes.push({id: key, incoming_requests: incomingRequests, outgoing_requests: outgoingRequests, label:"\n\nFriction: " + percent(incomingRequests, outgoingRequests) + "%"});
  }
}

function genEdgesData(transitionCounter, transitionReason, edges) {
  var key;
  var id = 0;

  for(key in transitionCounter) {
      var sourceNode = key.substring(0, key.indexOf('-'));
      var destinationNode = key.substring(key.indexOf('>')+1);
      var edgeId = "e" + id;
      id = id + 1;
      var totalRequests = transitionCounter[key];
      var reason = transitionReason[key];
      edges.push({id: edgeId, source: sourceNode, target: destinationNode, total_requests: totalRequests, label: reason});
  }
}

function genGraphData(fromCounter, toCounter, transitionCounter, transitionReason) {
  var result = { nodes: [], edges: [], };
  genNodesData(fromCounter, toCounter, result.nodes);
  genEdgesData(transitionCounter, transitionReason, result.edges);
  return result;
}

export function parseJson(category) {
  var json = s3Data;
  json = json.root;
  var fromCounter = {};
  var toCounter = {};
  var transitionCounter = {};
  var transitionReason = {};
  for(var i = 0; i < json.length; i++) {
    var obj = json[i];
    var listOfTransitions = obj.list_of_transitions;
    var listOfHfcCategory = obj.hfc_category;

    var toLower = function(x){ 
      return x.toLowerCase();
    };
    listOfHfcCategory = listOfHfcCategory.map(toLower);

    var isExists = false;
    if(category != undefined) {
      isExists = listOfHfcCategory.includes(category.toLowerCase());
    }
    if(category === undefined || isExists) {
      for(var j = 0; j < listOfTransitions.length; j++) {
          var transition = listOfTransitions[j];  //array of strings

          var fromState = transition[0];
          var toState = transition[1];
          var reason = transition[2];

          addKey(fromState, fromCounter);
          addKey(toState, toCounter);
          addKey(fromState + "->" + toState, transitionCounter);
          transitionReason[fromState + "->" + toState] = reason;
      }
    }
  }
  const data = genGraphData(fromCounter, toCounter, transitionCounter, transitionReason);
  return data;
}

export var filterIndex = {
  SERIAL: 0,
  SESSION: 1,
  DEVICE: 2,
  CUSTOMER: 3,
  UTTERANCE: 4,
  BILLER: 5,
};

function checkString(text, pattern) {
  if(pattern == "") {
    return true;
  }
  text = text.toLowerCase();
  var patternList = pattern.split(',');
  var i;
  for(i = 0; i < patternList.length; i++) {
    var sanitized = patternList[i].trim();
    if(sanitized == "") {
      continue;
    }
    if(text.includes(sanitized.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function checkList(textList, pattern) {
  if(pattern == "") {
    return true;
  }
  var i;
  for(i = 0; i < textList.length; i++) {
    if(checkString(textList[i], pattern)) {
      return true;
    }
  }
  return false;
}

function genRowEntries(table, category, transitionEnd, values) {
  var json = s3Data;
  json = json.root;
  var serial = 1;
  for(var i = 0; i < json.length; i++) {
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
    if(isLastTransition && (category === 'all' || isExists))
    {
      var sessionId = obj.sessionId;
      var deviceId = obj.deviceId;
      var customerId = obj.customerId;
      var utteranceList = obj.utterance_id;
      var billerList = obj.biller_ids;
      var utteranceList = obj.utterance_id;

      var utteranceString = "";
      var j = 0;
      for(j = 0; j < utteranceList.length; j++) {
        utteranceString += utteranceList[j];
        utteranceString += '+';
        if(j == 1) {
          j++;
          break;
        }
      }
      if(utteranceList.length > j) {
        utteranceString += (utteranceList.length - j)
      }
      else {
        utteranceString = utteranceString.slice(0, -1);
      }

      var billerString = "";
      for(j = 0; j < billerList.length; j++) {
        billerString += billerList[j];
        billerString += '+';
        if(j == 1) {
          j++;
          break;
        }
      }
      if(billerList.length > j) {
        billerString += (billerList.length - j)
      }
      else {
        billerString = billerString.slice(0, -1);
      }

      var showData = false;
      if(values == undefined) {
        showData = true;
      }
      else {
        showData = checkString(sessionId, values[filterIndex.SESSION]);
        showData = showData && checkString(deviceId, values[filterIndex.DEVICE]);
        showData = showData && checkString(customerId, values[filterIndex.CUSTOMER]);
        showData = showData && checkList(utteranceList, values[filterIndex.UTTERANCE]);
        showData = showData && checkList(billerList, values[filterIndex.BILLER]);
      }

      if(showData == true) {
        table += genRow([serial, obj.sessionId, obj.deviceId, obj.customerId, 
                utteranceString, billerString]);
        serial++;
      }
    }
  }
  return table;
}

function genTableStyle() {
  var style = "<style>\
              </style>";
  return style;
}

function genFilters(entries) {
  //var filter = "<table id=\"filterTable\" style=\"width:100%\">";
  var filter = ""
  filter = "<tr>"
  for(var i = 0; i < entries.length; i++) {
    filter += "<td ><input type=\"text\" id=\""+entries[i] + "\" style=\"width: 100%;\">" + "</td>";
  }
  return filter + "</tr>";
}

function genRow(entries) {
  var row = "<tr>"
  for(var i = 0; i < entries.length; i++) {
    row += "<td>" + entries[i] + "</td>";
  }
  return row + "</tr>";
}

function genTableHeading(entries) {
  var row = "<tr>"
  for(var i = 0; i < entries.length; i++) {
    row += "<th>" + entries[i] + "</th>";
  }
  return row + "</tr>";
}

var heading = ['Serial',
                'sessionId',
                'deviceId',
                'customerId',
                'Utterance',
                'billers'];

export var filterId = heading;

var gCategory;
var gTransitionEnd;

export function genTable(category, transitionEnd, values) {
  var table = "";
  var filters = genFilters(heading);
  table += "<table id=\"transitions\" style=\"width:100%\">";
  table += genTableHeading(heading);
  table += filters;
  table = genRowEntries(table, category, transitionEnd, values);
  gCategory = category;
  gTransitionEnd = transitionEnd;
  return table + "</table>";
}

export function filterTable() {
  var values = [];
  var i;
  for(i=0; i<heading.length; i++) {
    var element = document.getElementById(heading[i]);
    values.push(element.value);
  }

  document.getElementById("container").innerHTML = genTable(gCategory, gTransitionEnd, values);

  for(i=0; i<heading.length; i++) {
    var element = document.getElementById(heading[i]);
    element.value = values[i];
  }
  attachListeners();
}

export function attachListeners() {
  for(var i=0; i<heading.length; i++) {
    var element = document.getElementById(heading[i]);
    if(element != null) {
      element.addEventListener("change", filterTable);
    }
  }
}