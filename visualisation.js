const searchField = document.getElementById('search')
const fromDateField = document.getElementById('from-date')
const toDateField = document.getElementById('to-date')
const sortingField = document.getElementById('order-by')
const displayField = document.getElementById('max-playlists')
const groupingField = document.getElementById('group-by')
const projectField = document.getElementById('project')
const algorithmField = document.getElementById('algorithm')
const nameField = document.getElementById('name')
const newCaptureField = document.getElementById('new-captures')
const toProcessField = document.getElementById('to-process')
const capturePlanSubmit = document.getElementById('capture-plan-submit')

searchField.addEventListener('keyup', reFilter)
fromDateField.addEventListener('change', reFilter)
toDateField.addEventListener('change', reFilter)
sortingField.addEventListener('change', reSort)
displayField.addEventListener('change', reSort)
groupingField.addEventListener('change', reGroup)
capturePlanSubmit.addEventListener('click', processSubmission)

let tableSetTotal = 0;
let rowsTotal = 0;

function renderVisualisation(){
    let displayArea = document.getElementById('level-1-dashboard')
    displayArea.innerHTML = ''
    displayArea.innerHTML = visualisedResponses
    generateEditButtons();
}

function visualiseResponses(){

    tableSetTotal = 0;
    rowsTotal = 0;

    const grouping = groupingField.value;
    let visualisation = document.createElement('div')
  
    if(grouping === "algorithm"){
      let tablesByAlgorithm = [];
      for(const algorithm in groupedResponses){
        const algorithmData = groupedResponses[algorithm]
        let tableSetTitle = document.createElement('h3')
        tableSetTitle.innerText = algorithm
        let tableSet = createTableSet(algorithmData)
        tableSet = populateTableSet(tableSet, algorithmData)
        tablesByAlgorithm.push(tableSetTitle)
        tablesByAlgorithm.push(tableSet)
      } 
      for(element of tablesByAlgorithm){
        visualisation.appendChild(element)
      }
    }
    if(grouping === "project"){
      let tablesByProject = [];
      for(const project in groupedResponses){
        const projectData = groupedResponses[project]
        let tableSetTitle = document.createElement('h3')
        tableSetTitle.innerText = project
        let tableSet = createTableSet(projectData)
        tableSet = populateTableSet(tableSet, projectData)
        tablesByProject.push(tableSetTitle)
        tablesByProject.push(tableSet)
      }
      for(element of tablesByProject){
        visualisation.appendChild(element)
      }
    }
    if(grouping === "ungrouped"){
      let tableSetTitle = document.createElement('h3')
      tableSetTitle.innerText = "All Playlists"
      let tableSet = createTableSet(sourceResponses)
      tableSet = populateTableSet(tableSet, sortedResponses)
      visualisation.appendChild(tableSetTitle)
      visualisation.appendChild(tableSet)
    }
      
    visualisedResponses = visualisation.innerHTML
    
}
  
function createTableSet(){

    tableSetTotal++
  
    let tableSetContainer = document.createElement('div')
    
    tableSetContainer.className = 'table'
    tableSetContainer.dataset.group = tableSetTotal 
  
    for(const tableTemplate of tableConfigs){
      const generatedTable = createTable(tableTemplate)
      tableSetContainer.appendChild(generatedTable)
    }
    
    return tableSetContainer
  
}

function createTable(tableTemplate){
  
    const table = document.createElement('table')
    const titleRow = table.insertRow()
    const columns = table.insertRow()
  
    for(const title of tableTemplate.title){
      const titleCell = document.createElement("th")
      titleCell.textContent = title
      titleRow.appendChild(titleCell)
    }
  
    for(const column of tableTemplate.columns) {
      const columnHeaderCell = document.createElement("td")
      columnHeaderCell.innerText = column
      columns.appendChild(columnHeaderCell)
    }
  
    table.appendChild(titleRow)
    table.appendChild(columns)
  
    return table
  
}

function populateTableSet(tableSetContainer, group,){
  
  const tables = tableSetContainer.querySelectorAll('table')
  
  for(let entry = 0; entry < group.length; entry++){
    
    rowsTotal++
    
    for(const table of tables){
      let row = table.insertRow()
      row.dataset.row = rowsTotal
    }
    
    for(let key = 0; key < Object.keys(group[entry]).length; key++){
     
      const row = entry + 2
      const value = Object.values(group[entry])[key]
      let cell = document.createElement('td')
     
      switch (true) {
        
        //Planning table
        case (key <= 3):
          tables[0].getElementsByTagName('tr')[row].appendChild(cell)
          cell.outerHTML = `<td class="green">${value}</td>`
        break;
        
        //Capture table
        case (key > 3 && key <= 7):
          tables[1].getElementsByTagName('tr')[row].appendChild(cell)
          if(key > 3 && key < 7){
            cell.outerHTML = `${generateCell(value)}`
          } else {
            cell.outerHTML = `<td class='blue'>${value}</td>`
          }
        break
        
        //Processing table
        case (key > 7 && key <= 11):
          tables[2].getElementsByTagName('tr')[row].appendChild(cell)
          if(key > 7 && key <= 10){
            cell.outerHTML = generateCell(value)
          } else {
            cell.outerHTML = `<td class='blue'>${value}</td>`
          }
        break
        
        //Annotation tables
        case (key > 11 && key <=13):
          tables[3].getElementsByTagName('tr')[row].appendChild(cell)
          if(key == 12){
            if(!(value[0] === null)){
              cell.outerHTML = generateCell(value)
            } else {
              cell.outerHTML = `<td>/</td>`
            }
          } else {
            cell.outerHTML = `<td class='blue'>${value}</td>`
          }
        break
        
        //Information table
        case (key > 13 && key <=18):

          tables[4].getElementsByTagName('tr')[row].appendChild(cell)

          if(key == 14){
            if(Object.values(group[entry])[key].includes('/')){
              cell.outerHTML = `<td>${value}</td>`
            } else {
              cell.outerHTML = `<td class="green">${value}</td>`
            }
          }

          if(key == 15){
            if(Object.values(group[entry])[key].includes('/')){
              cell.outerHTML = `<td>/</td>`
            } else {
              cell.outerHTML = `<td class="green">${value}</td>`
            }
          }

          if(key == 16){
            cell.outerHTML = `<td class='blue'>${value}</td>`
          }

          if(key == 17){
            let severity; 
            switch (true){
              case value < 0:
                severity = "green"
                cell.outerHTML = `<td class=${severity}> ${value} </td>`
                break;
              case value > 0 && value < 0.5:
                severity = "green"
                cell.outerHTML = `<td class=${severity}> ${value} </td>`
                break;
              case value < 2 && value > 0.5:
                severity = "aqm"
                cell.outerHTML = `<td class=${severity}> ${value} </td>`
                break;
              case value >= 2 && value < 5:
                severity = "yellow"
                cell.outerHTML = `<td class=${severity}> ${value} </td>`
                break;
              case value >= 5 && value < 10:
                severity = "amber"
                cell.outerHTML = `<td class=${severity}> ${value} </td>`
                break;
              case value >= 10:    
                severity = "red"
                cell.outerHTML = `<td class=${severity}> ${value} </td>`
                break;
              default: 
                cell.outerHTML = `<td>/</td>`
                break;
            }
          }

          if(key == 18){
            console.log(`Value in Ticket link = ${value}`)
            if(value.includes("<a href=> Ticket </a>") || value.includes("<a href=null> Ticket </a>")){
              cell.outerHTML = `<td>/</td>`
            } else {
              cell.outerHTML = `<td class='green'>${value}</td>`
            }
          }
      }

    }
  }
  return tableSetContainer;
}

function generateCell(value){
  switch(true){

    case (value === undefined): 
      console.warn('Data processing error, undefined value passed to generateCell')
      break;
    
    case (!(Array.isArray(value))): 
      if(value.includes('/')) {
        return `<td>${value}</td>`
      } else {
        return `<td class="green">${value}</td>`
      }

    case (Array.isArray(value)):
      let severity; 
      switch (true){
        case value.length == 1:
          return `<td class="green">${value[0]}</td>`
        case value[1] == 0:
          return `<td class="green">${value[0]}</td>`
        case value[1] > 0 && value[1] < 0.5:
          return `<td class="green">${value[0]}</td>`
        case value[1] < 2 && value[1] > 0.5:
          severity = "aqm"
          return `<td class="green">${value[0]} <span class="${severity}"> (${value[1]}%)</span></td>`
        case value[1] >= 2 && value[1] < 5:
          severity = "yellow"
          return `<td class="green">${value[0]} <span class="${severity}"> (${value[1]}%)</span></td>`
        case value[1] >= 5 && value[1] < 10:
          severity = "amber"
          return `<td class="green">${value[0]} <span class="${severity}"> (${value[1]}%)</span></td>`
        case value[1] >= 10:    
          severity = "red"
          return `<td class="green">${value[0]} <span class="${severity}"> (${value[1]}%)</span></td>`
        default: 
          severity = "green"
          return `<td class="green">${value[0]} <span class="${severity}"> (${value[1]}%)</span></td>`
    }
      default :
         return '<td>/</td>'
    }
}

function generateEditButtons(){
    const tableSets = document.getElementsByClassName('table')
    for(let table = 5; table <= (tableSets.length*5); table+=5){
      const tables = document.getElementsByTagName('table')
      const infoTableBody = tables[(table-1)].getElementsByTagName('tbody')[1] //TODO: Figure out why script generates two tbodies
      const infoRows = infoTableBody.getElementsByTagName('tr')
      for(let row = 2; row < infoRows.length; row++){
        let newCell = document.createElement('td')
        newCell.innerHTML = `<button class='edit' data-row='${row}' onclick="switchRowMode(this, 'edit')">Edit</button>`
        infoRows[row].appendChild(newCell)
      }
    }
}

async function switchRowMode(el, command){
  
    const cell = el.parentElement
    const row = cell.parentElement
    const rowN = row.dataset.row
    const rows = document.querySelectorAll(`[data-row="${rowN}"]`);
    let tableSetArray = Array.from(rows, singleRow => {
      const rowCells = Array.from(singleRow.getElementsByTagName('td'));
      return rowCells;
    }); // tableset array => [ row => [ cell => [] ] ]
    let cells = tableSetArray.flatMap(subArray => subArray) // [cell, cell, cell]
    let equivalentEntry = sortedResponses[el.dataset.row-1]
    let editButton;
    let buttonCell = cells[19]
      
      switch(command){
        
        case 'edit':
  
          for(let cellN = 0; cellN < (cells.length -1); cellN++){
            cells[cellN].innerHTML = generateEditCell(cells[cellN], cellN, cells[cellN].innerText, equivalentEntry)
          }
  
          let cancelButton = document.createElement('button')
          cell.appendChild(cancelButton)
          cancelButton.outerHTML = `<button class='edit' data-row=${rowN} onclick="switchRowMode(this, 'cancel')">Cancel</button>`
          let submitButton = document.createElement('button')
          cell.appendChild(submitButton)
          submitButton.outerHTML = `<button class='edit' data-row=${rowN} onclick="switchRowMode(this, 'submit')">Submit</button>`
          el.remove()
        break;
        
        case 'cancel':
  
          for(let cellN = 0; cellN < (cells.length -1); cellN++){
            if((cellN >= 0 && cellN <= 6) || cellN === 15 || cellN === 18)
            cells[cellN].innerHTML = reconstructCell(cellN, equivalentEntry)
          }
  
          buttonCell.innerHTML = '<td></td>'
          editButton = document.createElement('button')
          buttonCell.appendChild(editButton)
          editButton.outerHTML = `<button class='edit' data-row=${el.dataset.row} onclick="switchRowMode(this, 'edit')">Edit</button>`
        break;
  
        case 'submit':
  
          const responseData = await processEditSubmission(cells, equivalentEntry)
        
          //update context
          processedResponses = processedResponses.filter(entry => {
            return entry.name !== equivalentEntry.name
          })
          processResponse(responseData)
          reFilter()
          equivalentEntry = sortedResponses[el.dataset.row-1]

          console.log(JSON.stringify(equivalentEntry))
          
          for(let cellN = 0; cellN < (cells.length -1); cellN++){
            if((cellN >= 0 && cellN <= 6) || cellN === 15 || cellN === 18)
            cells[cellN].innerHTML = reconstructCell(cellN, equivalentEntry)
          }
          
          buttonCell.innerHTML = '<td></td>'
          editButton = document.createElement('button')
          buttonCell.appendChild(editButton)
          editButton.outerHTML = `<button class='edit' data-row=${el.dataset.row} onclick="switchRowMode(this, 'edit')">Edit</button>`
        break;
      }
}

function generateEditCell(original, column, content, equivalentEntry){
    let width;
    
    switch (true){
      case(column === 0):
        width = 150
        break;
      case (column === 1):
        width = 80
        break;
      case (column === 15 || column === 18):
        width = 150
        break;
      case (column > 1 && column < 7):
        width = 50
        break;
    }

    switch(true){
      case(column === 0):
        if(equivalentEntry['inQueue'] === '/'){
          return `<input style="width:${width}px;" type="text" value="${content}"></input>`
        } else {
          return original
        }
      case ((column > 1 && column < 7) || column === 15):
        if(content.includes("%")){
          content = content.substring(0, content.indexOf("("))
        } else if (content.includes('/')){
          content = ''
        }
        return `<input style="width:${width}px;" type="text" value="${content}"></input>`
      case (column === 18):
        return `<input style="width:${width}px;" type="text" value=""></input>`
      default:
        return original.innerHTML
    }
}
  
function reconstructCell(column, entry){
    let value = Object.values(entry)[column]
    let cellContents;
    switch(true){
      case ((column >= 0 && column <= 3) || column === 15):
        cellContents = `<td class="green">${value}</td>`
        return cellContents
      case(column >=4 && column <= 6):
        cellContents = generateCell(value)
        return cellContents
      case (column === 18):
        cellContents = `<td class="green"><a href="${value}">Ticket</a></td>`
        return cellContents
    }
}

function getEntryData(tableSetNum, rowN){
    tabletSetData = Object.values(groupedResponses)[tableSetNum - 1];
    let rowSetData = tabletSetData[rowN-1];
    return rowSetData
}
