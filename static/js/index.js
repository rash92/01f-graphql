// const addDiv = () => {
//     let loginElem = document.getElementById("loginForm")
//     loginElem.innerText = "adding text with js"
//     console.log("here")
//     console.log(loginElem)
// }

// addDiv()

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
    .catch((response) => console.log("unable to retrieve jwt: ", response));
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
        console.log("response ok: ", response)
        return response.json();
      }
      console.log("graphql request failed: ", response)
      throw response;
    })
    .catch((response) => response);
    console.log(data)
  return data.data;
}



async function displayData(form, requestedData) {
  let jwt = await processLogin(form);
  let data = await graphqlRequest(jwt, requestedData);
  console.log("data after graphql request: ", data)
  
  let resultsDiv = document.getElementById("results");
  if (!data){
    let errorDiv = document.createElement("div")
    errorDiv.innerText = "Unfortunately the request failed, please check your credentials or contact the administrator"
    resultsDiv.appendChild(errorDiv)
    return
  }
  addDataToDiv(resultsDiv, data)
}

let form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await doStuff(form);
});

async function doStuff(form){
  let lastMonthQuery = xpQueryStringBeforeDate(dateMonthsBeforeNow(1))
  console.log(lastMonthQuery)
  let query = {
    query: `query ($lang: jsonb){
      user {
        id
        githubId
        login
        discordId
        discordLogin
        profile
        attrs
        campus
      }
      transaction {
        id
        type
        amount
        userId
        attrs
        createdAt
        path
        objectId
        eventId
      }
      xp_per_major_project: transaction(where:{type:{_eq:"xp"}, object:{type:{_eq:"project"}}}){
        amount
        object{
          id
          name
          
        }
      }
      Go_projects_soloable: object(where: {type: {_eq: "project"}, attrs: {_contains: $lang}}) {
        id
        name
        attrs
        childrenAttrs
      }
    }`,
    variables: {
      "lang": {"language" : "Go", "groupMin": 1}
    }
  };
  await displayData(form, query)
  return false
}

async function addDataToDiv(div, data){
  console.log("raw data being added to div: ",data);
  for (let key in data) {
    let newdiv = document.createElement("div");
    newdiv.innerText = "results for " + key + ":"
    if (Array.isArray(data[key])) {
      let listDiv = document.createElement("ul");
      for (let elem in data[key]) {
        let listElem = document.createElement("li");
        listElem.innerText =
          "item " + elem + ": " + JSON.stringify(data[key][elem]);
        listDiv.appendChild(listElem);
      }
      newdiv.appendChild(listDiv);
    } else if (typeof data[key] === "object"){
      addDataToDiv(newdiv, data[key])
    }else {
      let miscDiv = document.createElement("div")
      miscDiv.innerText = JSON.stringify(data[key])
      newdiv.appendChild(miscDiv)
    }
    div.appendChild(newdiv);
  }
}

function dateMonthsBeforeNow(months){
  let timeNow = new Date(Date.now())
  timeNow.setMonth(timeNow.getMonth() - months)
  return timeNow
}

function xpQueryStringBeforeDate(date){
 let queryString = ` xp_before_date: transaction_aggregate(
    where: {type: {_eq: "xp"}, eventId: {_eq: "134"}, createdAt: {_lt: "`+date.getMonth() + "1" + +`"}}
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }`
  return queryString
}