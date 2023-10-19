async function processLogin(form) {
  let username = form.username.value;
  let password = form.password.value;
  let jwtRequestUrl = "https://learn.01founders.co/api/auth/signin";
  let encodedAuth = btoa(username + ":" + password);

  let jwt = await fetch(jwtRequestUrl, {
    method: "POST",
    headers: {
      Authorization: "Basic " + encodedAuth,
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .catch((response) =>  response);
  return jwt;
}

async function graphqlRequest(jwt, query) {
  let dataRequestUrl =
    "https://learn.01founders.co/api/graphql-engine/v1/graphql";
  let data = await fetch(dataRequestUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + jwt,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      console.log("graphql request failed: ", response);
      throw response;
    })
    .catch((response) => response);
  return data.data;
}

async function getData(form, requestedData) {
  document.getElementById("error").innerText = ""
  let jwt = await processLogin(form);
  if(!jwt){
    return
  }
  let data = await graphqlRequest(jwt, requestedData);
  return data;
}

let form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await doStuff(form);
});


async function addDataToDiv(div, data) {
  console.log("raw data being added to div: ", data);
  for (let key in data) {
    let newdiv = document.createElement("div");
    newdiv.innerText = "results for " + key + ":";
    if (Array.isArray(data[key])) {
      let listDiv = document.createElement("ul");
      for (let elem in data[key]) {
        let listElem = document.createElement("li");
        listElem.innerText =
          "item " + elem + ": " + JSON.stringify(data[key][elem]);
        listDiv.appendChild(listElem);
      }
      newdiv.appendChild(listDiv);
    } else if (typeof data[key] === "object") {
      addDataToDiv(newdiv, data[key]);
    } else {
      let miscDiv = document.createElement("div");
      miscDiv.innerText = JSON.stringify(data[key]);
      newdiv.appendChild(miscDiv);
    }
    div.appendChild(newdiv);
  }
}


function createPieChart(radius, values, labels) {
  let total = values.reduce((runningTotal, elem) => runningTotal + elem);
  let pieChart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  pieChart.setAttribute("width", 2 * radius);
  pieChart.setAttribute("height", 2 * radius + 15 * values.length);

  let keyElem = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let currentAngle = 0;
  for (let index in values) {
    //main pie chart
    value = values[index];
    let proportion = value / total;
    let angle = proportion * 2 * Math.PI;
    let colour =
      "rgb(" +
      (index * 255) / (values.length) +
      ", " +
      (index * 255) / (values.length)+
      ", " +
      (index * 255) / (values.length) +
      ")";
    let colourRedBlue =
      "rgb(" +
      (255 - (index * 255) / (values.length)) +
      ", " +
      0 +
      ", " +
      (index * 255) / (values.length) +
      ")";
    pieChart.appendChild(
      createSegmentPath(radius, currentAngle, angle, colour)
    );
    // pieChart.appendChild(createSegmentPath(radius, currentAngle, angle, colourGrayscale))

    //keys
    let key = document.createElementNS("http://www.w3.org/2000/svg", "g");
    key.setAttribute("color", colour);

    let keySquare = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    keySquare.setAttribute("width", "10");
    keySquare.setAttribute("height", "10");
    keySquare.setAttribute("style", "fill:" + colour);
    keySquare.setAttribute("y", 2 * radius + 15 * index);
    let keyLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    keyLabel.innerHTML = labels[index];
    keyLabel.setAttribute("y", 2 * radius + 10 + 15 * index);
    keyLabel.setAttribute("x", 15);
    key.appendChild(keySquare);
    key.appendChild(keyLabel);
    keyElem.appendChild(key);
    currentAngle += angle;
  }
  pieChart.appendChild(keyElem);
  console.log("pie chart created!");

  return pieChart;
}

function createSegmentPath(r, startAngle, angle, colour) {
  
  let moveToCenter = "M " + r + ", " + r + " ";
  let moveToEdge =
    "L " +
    (Math.cos(startAngle) * r + r) +
    ", " +
    (Math.sin(startAngle) * r + r) +
    " ";
  let moveAlongArc =
    "A " +
    r +
    ", " +
    r +
    " 0 " +
    (angle < Math.PI ? "0" : "1") +
    "1" +
    (Math.cos(startAngle + angle) * r + r) +
    ", " +
    (Math.sin(startAngle + angle) * r + r) +
    " ";
  let moveBack = "Z";
  let pathString = moveToCenter + moveToEdge + moveAlongArc + moveBack;
  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathString);
  path.setAttribute("fill", colour);
  path.setAttribute("stroke", "red");
  return path;
}

function createLineGraph(
  title,
  xlabel,
  ylabel,
  xmax,
  ymax,
  width,
  height,
  points
) {
  let origin = [100, 100 + height];
  let lineGraphSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  lineGraphSvg.setAttribute("width", 1.5 * width);
  lineGraphSvg.setAttribute("height", 1.5 * height);
  let titleElem = document.createElementNS("http://www.w3.org/2000/svg", "text")
  titleElem.setAttribute("x", width/2)
  titleElem.setAttribute("y", 25)
  titleElem.innerHTML = title
  lineGraphSvg.appendChild(titleElem)

  let xaxisElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  xaxisElem.setAttribute("x1", origin[0]);
  xaxisElem.setAttribute("x2", origin[0] + width);
  xaxisElem.setAttribute("y1", origin[1]);
  xaxisElem.setAttribute("y2", origin[1]);
  xaxisElem.setAttribute("stroke", "red");
  let yaxisElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  yaxisElem.setAttribute("x1", origin[0]);
  yaxisElem.setAttribute("x2", origin[0]);
  yaxisElem.setAttribute("y1", origin[1]);
  yaxisElem.setAttribute("y2", origin[1] - height);
  yaxisElem.setAttribute("stroke", "blue");
  lineGraphSvg.appendChild(xaxisElem);
  lineGraphSvg.appendChild(yaxisElem);
  let xlabelElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  xlabelElem.setAttribute("x", origin[0] + width / 2);
  xlabelElem.setAttribute("y", origin[1]+25);
  xlabelElem.innerHTML = xlabel;
  lineGraphSvg.appendChild(xlabelElem);
  let ylabelElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  ylabelElem.setAttribute("x", 25);
  ylabelElem.setAttribute("y", height / 2);
  ylabelElem.innerHTML = ylabel;
  lineGraphSvg.appendChild(ylabelElem);

  let xlabelMaxElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  xlabelMaxElem.setAttribute("x", origin[0] + width);
  xlabelMaxElem.setAttribute("y", origin[1]+25);
  xlabelMaxElem.innerHTML = xmax;
  lineGraphSvg.appendChild(xlabelMaxElem);
  let ylabelMaxElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  ylabelMaxElem.setAttribute("x", 25);
  ylabelMaxElem.setAttribute("y", origin[1]-height);
  ylabelMaxElem.innerHTML = ymax;
  lineGraphSvg.appendChild(ylabelMaxElem);

  
  let lineElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline"
  );
  let pointsStr = "";
  for (let point in points) {

    pointsStr +=
      " " +
      (origin[0] + points[point][0]*width/xmax) +
      "," +
      (origin[1] - points[point][1]*height/ymax);
  }
  lineElem.setAttribute("points", pointsStr);
  lineElem.setAttribute("stroke", "black");
  lineElem.setAttribute("fill", "none");
  lineGraphSvg.appendChild(lineElem);
  return lineGraphSvg;
}

function xpQueryBeforeDate(date) {
  let queryString = {
    query:
      `{
  xp_before_date: transaction_aggregate(
    where: {type: {_eq: "xp"}, eventId: {_eq: "134"}, createdAt: {_lt: "` +
      date +
      `"}}
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }
}`,
  };
  return queryString;
}

function xpQueryBetweenDates(startDate, endDate){
  let queryString = {
    query:
      `{
  xp_before_date: transaction_aggregate(
    where: {type: {_eq: "xp"}, eventId: {_eq: "134"}, createdAt: {_lt: "` +
    endDate +
      `"}, _and: {createdAt: {_gt: "`+startDate+`"}}}
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }
}`,
  };
  return queryString;
}

function xpQueryPerMajorProject(){
  return {query: `{
    xp_per_major_project: transaction(where:{type:{_eq:"xp"}, object:{type:{_eq:"project"}}}){
      amount
      object{
        id
        name
        
      }
    }
  }`}
}

async function basicInfo(form){
  let query = {
    query: `{
      user{
        login
        campus
        attrs
      }
      total_xp: transaction_aggregate(
        where: {type: {_eq: "xp"}, eventId: {_eq: "134"}}
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
    }
    `
  }

  let data = await getData(form, query)
  if(!data){
    return
  }
  let basicInfo = {
    username: data.user[0].login,
    campus: data.user[0].campus,
    firstName: data.user[0].attrs.firstName,
    lastName: data.user[0].attrs.lastName,
    totalXP: data.total_xp.aggregate.sum.amount,
  }
  return basicInfo
}

 function displayBasicInfo(basicInfo){
  if(!basicInfo){
    return
  }

  document.getElementById("name").innerText = "Hello " + basicInfo.firstName + " " + basicInfo.lastName + "!"
  document.getElementById("username").innerText = "Username: " + basicInfo.username
  document.getElementById("campus").innerText = "Campus: " + basicInfo.campus
  document.getElementById("xp").innerText = "Total XP: " + basicInfo.totalXP
}

async function xpPerProjectPieChart(form){
  let data = await getData(form, xpQueryPerMajorProject())
  if(!data){
    return
  }
  let values = []
  let labels = []
  for (let project of data.xp_per_major_project){
    values.push(project.amount)
    labels.push(project.object.name)
  }
  let pieChart = createPieChart(500, values, labels)
  let titleDiv = document.createElement("div")
  titleDiv.innerText = "xp per project"
  document.getElementById("pie").appendChild(titleDiv)
  document.getElementById("pie").appendChild(pieChart)
}

async function xpPerMonthLineGraph(form){
  let points = []
  let maxY = 0
  let maxX = 12
  for (let i=0; i<12; i++){
    let date = (i+1)+" 01 2023"
    let data = await getData(form, xpQueryBeforeDate(date))
    let xp = data.xp_before_date.aggregate.sum.amount
    if (xp > maxY){
      maxY = xp
    }
    points.push([i,xp])
  }
  let lineGraph = createLineGraph("xp for 2023","month", "xp", maxX, maxY, 750, 750, points)
  document.getElementById("graph").appendChild(lineGraph)
  console.log("line graph created!")
}

async function doStuff(form) {
  document.getElementById("error").innerText = ""
  let basicdata = await basicInfo(form)
  if (!basicdata){
    document.getElementById("error").innerText = "unable to log in, please check your credentials"
    return false
  }
  document.getElementById("login").innerHTML = `<a href="./">logout</a>`
  displayBasicInfo(basicdata)
  await xpPerProjectPieChart(form)
  await xpPerMonthLineGraph(form)
  return false;
}
