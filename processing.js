const dateObject = new Date();
toDate = new Date();

const tableConfigs = [
    {
      type: "Planning",
      columns: 4,
      title: ["Planning", " ", " ", " "],
      columns: ["Playlist", "Submitted", "To Capture", "To Process"],
    },
    {
      type: "Capture",
      columns: 4,
      title: ["Capture", " ", " ", " "],
      columns: ["Captured", "Received", "Uploaded", "Elapsed"],
    },
    {
      type: "Processing",
      columns: 4,
      title: ["Processing", " ", " ", " "],
      columns: ["Ingested", "Processing", "Processed", "Elapsed"],
    },
    {
      type: "Annotation",
      columns: 2,
      title: ["Annotation", " "],
      columns: ["Annnotated", "Elapsed"],
    },
    {
      type: "Info",
      columns: 5,
      title: ["Info", " ", " ", " ", " "],
      columns: ["Completed", "Annotator", "Elapsed", "Loss Rate", "Ticket"],
    },
];

let sourceResponses;
let processedResponses = [];
let filteredResponses = [];
let sortedResponses = [];
let groupedResponses = [];
let visualisedResponses = [];

function processResponse(entry){
  
    //For reference
    const smataKeyOrder = ['name', 'company', 'algorithm', 'createdBy', 'createAt', 'lastUpdateAt', 'annotationTeam', 'ticket', 'toProcess', 'toCapture', 'received', 'captured', 'uploaded', 'inQueue', 'inWorkflow', 'processed', 'annotated', 'annotatedRejected', 'firstIngestAt', 'firstAnnotationAt', 'lastAnnotationAt']
    const dodResultsOrder = ['name', 'createAt', 'toCapture', 'toProcess', 'captured', 'received', 'uploaded', 'captureElapsed', 'inQueue', 'inWorkflow', 'processed', 'processElapsed', 'annotated', 'annotationElapsed', 'completionDate', 'annotationTeam', 'totalTimeElapsed', 'totalLoss', 'ticket']
    const annotationStats =  [annotate(entry['processed'], entry['annotated'], 1, entry['toProcess']), annotationCompletionCheck(entry['annotated'], entry['annotatedRejected'], entry['processed'])]
    
    //Calculate new entry object
    let processedResult = {
      'name': entry['name'],
      'createAt': entry['createAt'],
      'toCapture': entry['toCapture'],
      'toProcess': entry['toProcess'],
      'captured': annotate(entry['toCapture'], entry['captured'], entry['received'], entry['toCapture']),
      'received': annotate(entry['captured'], entry['received'], entry['uploaded'], entry['toCapture']),
      'uploaded': annotate(entry['received'], entry['uploaded'], entry['inQueue'], entry['toCapture']),
      'capturedElapsed': daysElapsed(entry['createAt'], entry['firstIngestAt']),
      'inQueue': annotate(entry['toProcess'], entry['inQueue'], entry['inWorkflow'], entry['toProcess']),
      'inWorkflow': annotate(entry['inQueue'], entry['inWorkflow'], entry['processed'], entry['toProcess']),
      'processed': annotate(entry['inWorkflow'], entry['processed'], entry['annotated'], entry['toProcess']),
      'processedElapsed': daysElapsed(entry['firstIngestAt'], entry['firstAnnotationAt']),
      'annotated': annotationStats.flat(),
      'annotationElapsed': daysElapsed(entry['firstAnnotationAt'], entry['lastUpdateAt']),
      'completionDate': assignCompletionDate(entry['annotated'], entry['annotatedRejected'], entry['processed'], entry['lastUpdateAt']),
      'annotationTeam': entry['annotationTeam'],
      'totalTimeElapsed': daysElapsed(entry['createAt'], entry['lastUpdateAt']),
      'lossRate' : 'placeholder',
      'ticket': `<a href=${entry['ticket']}> Ticket </a>`,
      'project': entry['company'],
      'algorithm': entry['algorithm']
    }

    processedResult['lossRate'] = sumLossRate(processedResult)
  
    //Replace 0s with '/'
    for(const [key, value] of Object.entries(processedResult)){
      if(value == 0 || value == null){
        processedResult[key] = '/'
      }
    }
  
    if(!processedResponses.find(entry => entry.name === processedResult.name)){
      processedResponses.push(processedResult)
    } else {
      let oldEntry = processedResponses.find(entry => entry.name === processedResult.name)
      for(key of Object.keys(entry)){
        oldEntry[key] = processedResult[key]
      }
    }
}

function annotate(stepNMinus1, step, stepNPlus1, intendedSize){
  
  //Returns an array inferring the step's status and loss rate
  //No second value means no loss rate inference provided

  const loss = stepNMinus1 - step;
  let lossPerc = loss / intendedSize;

  if(step === null || step === 0){
    return null
  }

  //if the next step has begun and lossPerc is a valid number we can assume it's safe to apply a loss rate
  if(stepNPlus1 > 0 && lossPerc !== Infinity && lossPerc !== -Infinity && lossPerc !== NaN){
    return [step, (lossPerc * 100).toFixed(1)]
  } else {
    return [step]
  }
  
}

function daysElapsed(processStarted, processCompleted){
    let elapsed
    let daysElapsed
    console.log(`daysElapsed says => processStarted & completed = ${processStarted} | ${processCompleted}`)
    switch(true) {
      case (typeof processStarted === 'string' && typeof processCompleted === 'string'):
        elapsed = convertMsToDay(Date.parse(convertDate(processCompleted)) - Date.parse(convertDate(processStarted)))
        if(elapsed >= 0){daysElapsed = `${elapsed} day(s)`} else {daysElapsed = ``}
        return daysElapsed
      case (typeof processStarted === 'string' && processCompleted === null):
        elapsed = convertMsToDay(dateObject.getTime() - Date.parse(convertDate(processStarted)))
        if(elapsed >= 0){daysElapsed = `${elapsed} day(s)`} else {daysElapsed = ``}
        return daysElapsed
      case (processStarted === null && typeof processCompleted === 'string'): //Time elapsed in annotation = lastUpdate - firstAnnotation therefore it is possible here to have a processCompleted date but not a processStarted date (before annotation begins) 
        daysElapsed = " "
        return daysElapsed
      case (processCompleted === null && processStarted === null):
        daysElapsed = " "
        return daysElapsed
      default:
        daysElapsed = "Error"
        return daysElapsed
    }
}

function sumLossRate(processedResult){
  const values = Object.values(processedResult)
  console.log(`sumLossRate() says => processedResult = ${JSON.stringify(processedResult)}`)
  let totalLossRate = 0;
  for(const value of values){
    if(typeof value === Array && value.length > 1){
      totalLossRate += value[1]
    }
  }
  totalLossRate = totalLossRate.toFixed(1)

return totalLossRate
}

function convertDate(dateString){
    const components = dateString.split("-");
    const reversed = components.reverse();
    const converted = reversed.join("-");
    return converted;
}

function convertMsToDay(ms){
    const days = Math.floor(ms / (24*60*60*1000));
    return days
}

function annotationCompletionCheck(annotated, rejected, processed){
    const finished = annotated + rejected
    if(finished === processed){
      return true
    } else {
      return false
    }
}

function assignCompletionDate(annotated, rejected, processed, lastUpdateAt){
    if(annotated > 0){  
      const finished = annotated + rejected   
      if(finished === processed){
          return lastUpdateAt
      } else {
          return '/'
      }
    } else {
      return '/'
    }
}

async function processSubmission(){

  let company = document.getElementById('project').value;
  let algorithm = document.getElementById('algorithm').value;
  let name = document.getElementById('name').value;
  name = name.replace(/\s/g, '') // remove whitespace from name
  let toCapture = document.getElementById('new-captures').value;
  let toProcess = document.getElementById('to-process').value;
  let annotationTeam = document.getElementById('annotation').value;
  let received = document.getElementById('received').value;
  let captured = document.getElementById('captured').value;
  let uploaded = document.getElementById('uploaded').value;
  let ticket = document.getElementById('ticket').value;

  let newCapture = [
    ["company", company],
    ["algorithm", algorithm],
    ["name", name],
    ["toCapture", toCapture],
    ["toProcess", toProcess],
    ["annotationTeam", annotationTeam],
    ["captured", captured],
    ["received", received],
    ["uploaded", uploaded],
    ["ticket", ticket]
  ]

  let newCaptureRes;

  if(newCapture[0][1] !== null && newCapture[1][1] !== null && newCapture[2][1] !== null){
    newCaptureRes = await singlePost(newCapture)
  } else {
    alert('Please ensure that any captureplan submitted has a name, project, and algorithm associated with it')
    return
  }

  document.getElementById('project').value = ''
  document.getElementById('algorithm').value = ''
  document.getElementById('name').value = ''
  document.getElementById('new-captures').value = ''
  document.getElementById('to-process').value = ''
  document.getElementById('annotation').value = ''
  document.getElementById('received').value = ''
  document.getElementById('captured').value = ''
  document.getElementById('uploaded').value = ''
  document.getElementById('ticket').value = ''

  processResponse(newCaptureRes);
  reFilter();
}

async function processEditSubmission(cells, entry){
    
  let changes = [];
  
  const keys = Object.keys(entry)
  
  //Updates target both tables and so have two endpoints depending on the property we want to change
  const capturePlanLocation = `${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${entry['name']}${capturePlanEndpointURL}` 
  const videoPlaylistLocation = `${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${entry['name']}`

  if(cells[0].getElementsByTagName('input')[0].value == '' || cells[0].getElementsByTagName('input')[0].value == null){
    alert('CapturePlans cannot have null names');
    return
  }

  let editableCells
  if(entry['inQueue'] === '/'){
    editableCells = [0, 2, 3, 4, 5, 6, 15, 18]
  } else {
    editableCells = [2, 3, 4, 5, 6, 15, 18]
  }

  for(let cellN = 0; cellN < (cells.length -1); cellN++){

    if(editableCells.includes(cellN)){
      
      let submitValue = cells[cellN].getElementsByTagName('input')[0].value.trim()
      let initValue = Object.values(entry)[cellN]
      
      switch(true){
        
        case (cellN === 0):
          //don't allow users to make names with whitespace
          submitValue = submitValue.replace(/\s/g, '')
          changes.push([videoPlaylistLocation, keys[cellN], submitValue])
          break;
        case (cellN === 0 || cellN === 15 || cellN === 18):
          if(submitValue && !(String(initValue) === String(submitValue))){
            changes.push([videoPlaylistLocation, keys[cellN], submitValue])
          }
          break;
  
        case (cellN === 2 || cellN === 3):
          if(!(Number(initValue) === Number(submitValue))){
            changes.push([capturePlanLocation, keys[cellN], Number(submitValue)])
          }
          break;
        
        case (cellN > 3 && cellN < 7):
          //converting to String to deconstruct tuple values from processing
          let keyValue;
          if(String(initValue).includes(',')){
            keyValue = String(initValue).substring(0, String(initValue).indexOf(',')).trim()
          } else {
            keyValue = initValue
          }
          if((keyValue) != String(submitValue)){
            changes.push([capturePlanLocation, keys[cellN], Number(submitValue)])
          }
          break; 
        }
    }

  }
  const data = await putChanges(changes, entry)
  return data
}

function reFilter(){
    filterResponses()
    sortResponses()
    groupResponses()
    visualiseResponses()
    renderVisualisation()
}

function reSort(){
    sortResponses()
    groupResponses()
    visualiseResponses()
    renderVisualisation()
}

function reGroup(){
    groupResponses()
    visualiseResponses()
    renderVisualisation()
}

  