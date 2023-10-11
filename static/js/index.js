// const addDiv = () => {
//     let loginElem = document.getElementById("loginForm")
//     loginElem.innerText = "adding text with js"
//     console.log("here")
//     console.log(loginElem)
// }

// addDiv()

async function processLogin(form, query) {
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
        return response.json();
      }
      throw response;
    })
    .catch((response) => console.log(response));
  return data;
}

async function displayData(form) {
  requestedData = {
    query: `query {
      user {
        id
      }
      xp: transaction_aggregate(
        where: {type: {_eq: "xp"}, eventId: {_eq: "134"}}
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
    }`,

  };


  // {"data":{"user":[{"id":3345,"login":"rrahman"}]}}
  // {"type":"data","id":"g8yum40n5x","payload":{"data":{"xp":{"aggregate" : {"sum" : {"amount" : 570575.0}}},"level":[{"amount":24.0}]}}}
  let jwt = await processLogin(form, requestedData);
  console.log(jwt);
  let data = await graphqlRequest(jwt, requestedData);
  console.log(data);
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerText = JSON.stringify(data);
  for (let key in data.data){
    let newdiv = document.createElement("div")
    newdiv.innerText = "results for " + key + ": " + JSON.stringify(data.data[key])
    resultsDiv.appendChild(newdiv)
  }
}

let form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await displayData(form);
});
