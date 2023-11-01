function filterResponses(){
    const search = searchField.value.toLowerCase();
    const fromDate = fromDateField.value;
    const toDate = toDateField.value;
    let objArray;
  
    if(processedResponses.length == 1 || processedResponses.length == 0){
      objArray = [processedResponses] // in situations where a <2 responses returned by the server that result will need to be wrapped in an array
    } else {
      objArray = processedResponses
    }
  
    let filteredForSearch;
  
    if(search){
      filteredForSearch = objArray.filter(function(entry){return entry.name.toLowerCase().includes(search)})
    } else {
      filteredForSearch = objArray  
    }
  
    const filteredForDate = filteredForSearch.filter(function (entry) { return (Date.parse(convertDate(entry.createAt)) > Date.parse(fromDate) && Date.parse(convertDate(entry.createAt)) < /*Date.parse(toDate))*/ 1700000000000)}) // Filter for date range
  
    filteredResponses = filteredForDate
  
}

function sortResponses(){
  const sorting = sortingField.value;
  let sorted;
  //Order by ordering parameter
  switch(sorting){
    case "most-recent":
      sorted = filteredResponses.sort(orderByRecency)
      break;
    case "highest-throughput":
      sorted = filteredResponses.sort(orderBySize)
      break;
    case "highest-failure":
      sorted = filteredResponses.sort(orderByLossRate)
      break;
    case "annotation-supplier":
      sorted = filteredResponses.sort(orderBySupplier)
      break;
    case "time-elapsed":
      sorted = filteredResponses.sort(orderByTimeElapsed)
      break;
    default:
      sorted = filteredResponses.sort(orderByRecency)
      break;
  }
  sortedResponses = sorted
}

function groupResponses(){
    const grouping = groupingField.value;
    const display = displayField.value;
    let grouped = _.groupBy(sortedResponses, grouping) 
    for (const key in grouped) {
      if(Array.isArray(grouped[key])) {
        grouped[key].splice(display)
      }
    }
    groupedResponses = grouped;
}

function orderByRecency(a, b) {
    if (Date.parse(convertDate(a.createAt)) < Date.parse(convertDate(b.createAt))){
      return 1
    }
    if (Date.parse(convertDate(a.createAt)) > Date.parse(convertDate(b.createAt))){
      return -1
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()){
      return 1
    }
    if (a.name.toLowerCase() < b.name.toLowerCase()){
      return 1
    }
    return 0
}

function orderBySize(a, b) {
    if (a.toProcess < b.toProcess) {
      return 1
    }
    if (a.toProcess > b.toProcess) {
      return -1
    }
    return 0
}

function orderByLossRate(a, b) {
    if (Number(a.lossRate) < Number(b.lossRate)) {
      return 1
    }
    if (Number(a.lossRate) > Number(b.lossRate)) {
      return -1
    }
    return 0
}

function orderBySupplier(a, b) {
    if (a.annotationTeam == "Valeo Annotation") {
      return 1
    }
    if (a.annotationTeam == "Scale.ai") {
      return -1
    }
    return 0
}

function orderByTimeElapsed(a, b){
    if (a.totalTimeElapsed < b.totalTimeElapsed) {
      return 1
    }
    if (a.totalTimeElapsed > b.totalTimeElapsed) {
      return -1
    }
    return 0
}