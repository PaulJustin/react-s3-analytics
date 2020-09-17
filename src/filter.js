import  { showGraph, emptyContainers } from './index.js'
import { parseJson } from './process_data.js';

document.getElementById("hfc").addEventListener("change", categoryFilter);

export function categoryFilter() {

  emptyContainers();
  var category = document.getElementById("hfc").value;
  var data;

  if(category === 'all')
  {
    data = parseJson();
  }
  else
  {
    data = parseJson(category);
  }
  
  showGraph(data);
}