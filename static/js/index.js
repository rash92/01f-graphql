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
  console.log(encodedAuth);

  let jwt = await fetch(jwtRequestUrl, {
    method: "POST",
    headers: {
      Authorization: "Basic " + encodedAuth,
      "Content-Type": "application/json",
    }
  })
    .then(function (response) {
      if (response.ok) {
        console.log("got a response");
        return response.json();
      }
      console.log("response failed", response);
      throw response;
    })
    .catch((response) => response);
  console.log("jwt is: ", jwt);
  
  let graphqlquery =  {query: `query {
    user {
      id
      login
    }
  }`}
  
  console.log("body after restringifying: ",  JSON.stringify(graphqlquery))
  let dataRequestUrl = "https://learn.01founders.co/api/graphql-engine/v1/graphql"
  let data = await fetch(dataRequestUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer "+jwt,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphqlquery)
  }).then(function(response){
    if (response.ok){
      return response.json()
    }
    throw response
  }).catch(response => console.log(response))
  console.log(data)
  return data;
}

let form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  processLogin(form);
});
