
async function init(){
    await collectData("live")
    for(entry of sourceResponses){
      processResponse(entry)
    }
    filterResponses()
    sortResponses()
    groupResponses()
    visualiseResponses()
    renderVisualisation()
}

init();