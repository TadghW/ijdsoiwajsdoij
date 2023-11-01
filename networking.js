const serverRoot = "http://tua1-sv00227:8085"
const videoPlaylistURL = "/api/v1/videoplaylist/"
const capturePlanEndpointURL = "/captureplan"
const searchableProjects = [
  'VW',
  'UCAP',
  'STLA_MY24'
]

async function collectData(source){
  if(source === "live") {
    let urls = []
    for(const project of searchableProjects){
      const url = `${serverRoot}${videoPlaylistURL}${project}${capturePlanEndpointURL}`
      urls.push(url)
    }
    urls = urls.flat(Infinity)
    const capturePlanURLs = await getCapturePlanURLs(await parallelGet(urls))
    const capturePlanStatuses = await parallelGet(capturePlanURLs)
    sourceResponses = capturePlanStatuses
  } else if (source === "example") {
    sourceResponses = examplePayload;
  }
}

async function getCapturePlanURLs(allProjectResponses){
let urls = [];
allProjectResponses.forEach(project => {
  project.forEach(capturePlan => {
    const url = `${serverRoot}${videoPlaylistURL}${capturePlan.company}/${capturePlan.algorithm}/${capturePlan.name}${capturePlanEndpointURL}/status`
    urls.push(url)
  })
});
return urls
}

async function parallelGet(urls) {

  const fetchPromises = urls.map(async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok){
        console.warn(`NOK response from ${url} => ${response.status}: ${response.statusText}`)
        return null
      } else {
        return await response.json()
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${url} => ${error}`)
      return null
    }
  })

  try {
    const responseData = await Promise.all(fetchPromises)
    const successfulResponses = responseData.filter(data => data !== null);
    return successfulResponses
  } catch (error) {
    console.error('Error reading or filtering response data')
    return [];
  }

}

async function singleGet(endpoint){

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
  
    const request = {
        method: "GET",
        headers: headers,
    };

    const response = await fetch(endpoint, request)
    const data = await response.json();
    return data
}

async function singlePost(capturePlan) {

  const endpoint = `${serverRoot}${videoPlaylistURL}`;
  let requestBody = '';

  for(const el of capturePlan){
    const key = el[0]
    const value = el[1]
    if(/*typeof value === Number*/false){
      //There's some issue with SMATA API wherein if you input a Number you have to escape double quotes before PUTing new data in
      requestBody += `\"${key}\": ${value},`
      } else {
        requestBody += `"${key}": "${value}",`
      }
  }

  requestBody = `{${requestBody.slice(0, -1)}}`;

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  const request = {
    method: "POST",
    headers: headers,
    body: requestBody
};

const response = await fetch(endpoint, request)
const data = await response.json();
return data

}
  
async function putChanges(changes, entry){

  //Changes can target two different endpoints so we need to be prepared to make both requests

  const videoPlaylistEndpoint = `${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${entry['name']}`;
  const capturePlanEndpoint = `${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${entry['name']}${capturePlanEndpointURL}`
  let videoPlaylistChanges = [];
  let capturePlanChanges = [];
  let videoPlaylistRequestBody = '';
  let capturePlanRequestBody = '';
  let newName = '';

  for(const change of changes){
    const target = change[0];
    if(target === videoPlaylistEndpoint){
      videoPlaylistChanges.push(change)
    } else if (target === capturePlanEndpoint){
      capturePlanChanges.push(change)
    } else {
      console.error(`change submitted with invalid target`)
    }
  }

  for (const change of videoPlaylistChanges) {
      const key = change[1];
      const value = change[2];
      if(key === 'name'){
        newName = value;
      }
      if(typeof value === Number){
        //There's some issue with SMATA API wherein if you input a Number you have to escape double quotes before PUTing new data in
        videoPlaylistRequestBody += `\"${key}\": ${value},`
      } else {
        videoPlaylistRequestBody += `"${key}": "${value}",`
      }
  }

  videoPlaylistRequestBody = `{${videoPlaylistRequestBody.slice(0, -1)}}`;

  for(const change of capturePlanChanges){
    const key = change[1];
    const value = change[2];
    if(typeof value === Number){
      //There's some issue with SMATA API wherein if you input a Number you have to escape double quotes before PUTing new data in
      capturePlanRequestBody += `\"${key}\": ${value},`
    } else {
      capturePlanRequestBody += `"${key}": "${value}",`
    }
  }

  capturePlanRequestBody = `{${capturePlanRequestBody.slice(0, -1)}}`;

  const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
  };

  const videoPlaylistRequest = {
      method: "PUT",
      headers: headers,
      body: videoPlaylistRequestBody
  };

  const capturePlanRequest = {
    method: "PUT",
    headers: headers,
    body: capturePlanRequestBody
  }

  let responseData
  let capturePlanJSON
  let videoPlaylistJSON

  if(capturePlanChanges.length > 0){
    let capturePlanResponse = await fetch(capturePlanEndpoint, capturePlanRequest)
    capturePlanJSON = await capturePlanResponse.json()
    console.log(`capturePlanResponse => ${JSON.stringify(capturePlanJSON)}`)
  }

  if(videoPlaylistChanges.length > 0){
    let videoPlaylistResponse = await fetch(videoPlaylistEndpoint, videoPlaylistRequest)
    videoPlaylistJSON = await videoPlaylistResponse.json()
    console.log(`videoPlaylistResponse => ${JSON.stringify(videoPlaylistJSON)}`)
  }

  //if only vp changes made we'll have to request extra information for processing
  if(videoPlaylistChanges.length > 0 && capturePlanChanges.length < 1){
    //captureplan endpoint will only respond with captureplan info, and the combined endpoint is forbidden unless there's videoplaylist info inside it
    //so we need make sure the submission is processed, then check both captureplan and captureplan/status to see which is appropriate      
    try {
      console.log(`trying captureplan/status => ${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${newName}/captureplan/status`)
      responseData = await singleGet(`${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${newName}/captureplan/status`)
    } catch (error) {
      console.log(`trying captureplan => ${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${newName}/captureplan/status`)
      responseData = await singleGet(`${serverRoot}${videoPlaylistURL}${entry['project']}/${entry['algorithm']}/${newName}/captureplan/status`)
    }
  } else {
    console.log(`using existing response data`)
    responseData = {...capturePlanJSON, ...videoPlaylistJSON}
  }

  console.log(`responseData => ${JSON.stringify(responseData)}`)
  return responseData
}