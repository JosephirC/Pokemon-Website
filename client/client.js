/* ******************************************************************
 * Constantes de configuration
 * ****************************************************************** */
const apiKey = "92b6fd40-43ca-4e9a-be4e-53133092c219"; //"69617e9b-19db-4bf7-a33f-18d4e90ccab7";
const serverUrl = "https://lifap5.univ-lyon1.fr";

/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * l'utilisateur.
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
/*
 function getVal() {
  // Sélectionner l'élément input et récupérer sa valeur
  var input = document.getElementById("in").value;
  // Afficher la valeur
  console.log(input);
  return input;
}*/

 function fetchWhoami(api) {
  return fetch(serverUrl + "/whoami", { headers: { "Api-Key": api } })
    .then((response) => {
      if (response.status === 401) {
        return response.json().then((json) => {
          console.log(json);
          return { err: json.message };
        });
      } else {
        return response.json();
      }
    })
    .catch((erreur) => ({ err: erreur }));
}
function fetchPokemon() {
  return fetch(serverUrl + "/pokemon")
    .then((response) => {
      if (response.status === 401) {
        return response.json().then((json) => {
          console.log(json);
          return { err: json.message };
        });
      } else {
        return response.json();
      }
    })
    .catch((erreur) => ({ err: erreur }));
}

/*
async function fetchPokemon() {
  const response = await fetch(serverUrl + "/pokemon")
  const data = await response.json();
  console.log(data)
}*/
//fetchPokemon()

/**
 * Fait une requête sur le serveur et insère le login dans la modale d'affichage
 * de l'utilisateur puis déclenche l'affichage de cette modale.
 *
 * @param {Etat} etatCourant l'état courant
 * @returns Une promesse de mise à jour
 */
 function lanceWhoamiEtInsereLogin(api,etatCourant) {
  return fetchWhoami(api).then((data) => {
    majEtatEtPage(etatCourant, {
      login: data.user, // qui vaut undefined en cas d'erreur
      errLogin: data.err, // qui vaut undefined si tout va bien
      loginModal: true, // on affiche la modale
    });
  });
}

function lancePoke(etatCourant) {
  return fetchPokemon().then((data) => {
    console.log(data)
    majEtatEtPage(etatCourant, {
      pokemon: data.sort(((a, b) => {return a.PokedexNumber - b.PokedexNumber})),
      initialData : data,
      inputSearch: "",
      NbPokemonAffiche: 10,
      NbPokemonFiltre : 10, 
      triType : true,
      triDirection : "asc",  
      triColumn : "PokedexNumber", 
      triAb : false,
      triTy: false,
    });
  });
}

function lister(liste){
  return liste.reduce((acc,e)=> acc+`<ul><li>${e}</li></ul>`);
}

/**
 * Génère le code HTML du corps de la modale de login. On renvoie en plus un
 * objet callbacks vide pour faire comme les autres fonctions de génération,
 * mais ce n'est pas obligatoire ici.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et un objet vide
 * dans le champ callbacks
 */
function genereModaleLoginBody(etatCourant) {
  const text =
    etatCourant.errLogin !== undefined
      ? etatCourant.errLogin
      : etatCourant.login === undefined
      ? ""
      : etatCourant.login;
  return {
    html: `
    <section class="modal-card-body">
  <label>Clé d'API:</label><br/>
  <input type="password" class="input" id="inputApi"/>
    <p>${text}</p>
  </section>
  `,
    callbacks: {
  },
  };
}
/********************verifier si la clé d’API n’est pas valable******************************/
/**
 * Génère le code HTML du titre de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginHeader(etatCourant) {
  return {
    html: `
<header class="modal-card-head  is-back">
  <p class="modal-card-title">Utilisateur</p>
  <button
    id="btn-close-login-modal1"
    class="delete"
    aria-label="close"
    ></button>
</header>`,
    callbacks: {
      "btn-close-login-modal1": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
    } ,
  };
}

/**
 * Génère le code HTML du base de page de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginFooter(etatCourant) {
  return {
    html: `
  <footer class="modal-card-foot" style="justify-content: flex-end">
    <button id="btn-close-login-modal2" class="button">Fermer</button>
    <button id="btn-submit-login-modal" class="is-success button">Valider</button>
  </footer>
  `,
    callbacks: {
      "btn-close-login-modal2": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
      "btn-submit-login-modal":{
        onclick: function(){
          const api = document.getElementById("inputApi").value;
          return lanceWhoamiEtInsereLogin(api, etatCourant);
        }
      }
    },
  };
}

/**
 * Génère le code HTML de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLogin(etatCourant) {
  const header = genereModaleLoginHeader(etatCourant);
  const footer = genereModaleLoginFooter(etatCourant);
  const body = genereModaleLoginBody(etatCourant);
  const activeClass = etatCourant.loginModal ? "is-active" : "is-inactive";
  return {
    html: `
      <div id="mdl-login" class="modal ${activeClass}">
        <div class="modal-background"></div>
        <div class="modal-card">
          ${header.html}
          ${body.html}
          ${footer.html}
        </div>
      </div>`,
    callbacks: { ...header.callbacks, ...footer.callbacks, ...body.callbacks },
  };
}

/* ************************************************************************
 * Gestion de barre de navigation contenant en particulier les bouton Pokedex,
 * Combat et Connexion.
 * ****************************************************************** */

/**
 * Déclenche la mise à jour de la page en changeant l'état courant pour que la
 * modale de login soit affichée
 * @param {Etat} etatCourant
 */
function afficheModaleConnexion(etatCourant) {
  lanceWhoamiEtInsereLogin(etatCourant);
}

/**
 * Génère le code HTML et les callbacks pour la partie droite de la barre de
 * navigation qui contient le bouton de login.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBoutonConnexion(etatCourant) {
  const html = `
  <div class="navbar-end">
    <div class="navbar-item">
      <div class="buttons">
      ${etatCourant.login === undefined 
      ? `<a id="btn-open-login-modal" class="button is-light"> Connexion </a>`
      : `<p>${etatCourant.login}</p>
      <a id="btn-dc-login-modal" class="button is-light"> Déconnexion </a>`}
        
      </div>
    </div>
  </div>`;
  return {
    html: html,
    callbacks: {
      "btn-open-login-modal": {
        onclick: () => majEtatEtPage(etatCourant, {loginModal: true}),
      },
      "btn-dc-login-modal":{
        onclick: () => majEtatEtPage(etatCourant, {login: undefined})
      }
    },
  };
}

    

/**
 * Génère le code HTML de la barre de navigation et les callbacks associés.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */

function genereBarreNavigation(etatCourant) {
  const connexion = genereBoutonConnexion(etatCourant);
  return {
    html: `
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar">
    <div class="navbar-item">
      <div class ="search-bar">
      <input id="inputSearch" class="input" placeholder= "Chercher un pokemon" type="text" value="${etatCourant.inputSearch}" >
      </div>
      <div class="navbar-item"><div class="buttons">
          <a id="btn-pokedex" class="button is-light"> Pokedex </a>
          <a id="btn-combat" class="button is-light"> Combat </a> 
          <a id="btn-search" class="button is-light"> Search </a>
      </div>
      </div>
      ${connexion.html}
    </div>
  </nav>`,
    callbacks: {
      ...connexion.callbacks,
      "btn-search": {onclick: () => searchPokemon(etatCourant)},
      "btn-pokedex": { onclick: () => console.log("click bouton pokedex") },
    },
  };
}

function generePokemon(etatCourant) {
  const tab = etatCourant.pokemon
  return { 
    html:
    tab.filter((_,i) => i < etatCourant.NbPokemonAffiche).reduce((acc, poke) => acc + `
  <tr class="">
      <td><img
              alt="${poke.Name}"
              src="${poke.Images.Detail}"
              width="64" />
      </td>
      <td><div class="content">${poke.PokedexNumber}</div></td>
      <td><div class="content">${poke.Name}</div></td>
      <td>${lister(poke.Abilities)}</td>
      <td>${lister(poke.Types)}</td>
    </tr>`, ``),
    callbacks: {},
  };
}

function genereTableaPok(etatCourant){
  //const eI = etatCourant.etatInitial;
  const TabPok=generePokemon(etatCourant);4
  return { 
    html: `
  <div id="tbl-pokemons">
    <table class="table">
    <thead>
      <tr>
        <th><span>Image</span></th>
        <th id = "number">
          <span>#</span>
          <span id="number" class="icon"><i class="fas fa-angle-up"></i></span>
        </th>
        <th id="asc"><span id="name">Name</span>
          <span id="number" class="icon"><i class="fas fa-angle-up"></i></span>
        </th>
        <th id="asc"><span id="ability">Abilities</span>
        <span id="number" class="icon"><i class="fas fa-angle-up"></i></span>
        </th>
        <th id="asc"><span id="type">Types</span>
        <span id="number" class="icon"><i class="fas fa-angle-up"></i></span>
        </th>
      </tr>
    </thead>
    <tbody>
          ${TabPok.html}
    </tbody>
    </table>
  </div>
  `,
    callbacks:{
      "number" : {
        onclick : () => {switchTri(etatCourant, "PokedexNumber"), inverse(etatCourant, "number")}
      },
      "name" : {
        onclick : () => {switchTri(etatCourant, "Name"), inverse(etatCourant, "name")}
      },
      "ability" : {
        onclick : () => {switchTri(etatCourant, "Abilities"), inverse(etatCourant, "ability")}
      },
      "type" : {
        onclick : () => {switchTri(etatCourant, "Types"), inverse(etatCourant, "type")}
      },
    },
  };
}
/*
function generePokemon(etatCourant) {
  const tab = etatCourant.pokemon;
  const listPoke =tab.forEach( poke => {
    const list = document.createElement("div");
    list.setAttribute("class","table");
    list.innerHTML =`
        <td><img
                alt="${poke.Name}"
                src="${poke.Images.Detail}"
                width="64" />
        </td>
        <td><div class="content">${poke.PokedexNumber}</div></td>
        <td><div class="content">${poke.Name}</div></td>
        <td>${lister(poke.Abilities)}</td>
        <td>${lister(poke.Types)}</td>
      </tr>`
      searchResult.appendChild(list);
  })
  return { 
    html: listPoke,
    callbacks: {...listPoke.callbacks},
  };
}*/


function addPokemon(etatCourant){
  console.log("55")
  console.log(etatCourant.pokemon.length)
  majEtatEtPage(etatCourant, {
   NbPokemonAffiche : etatCourant.NbPokemonAffiche+10, NbPokemonFiltre : etatCourant.pokemon.length,
  })
}
 
function removePokemon(etatCourant){
  majEtatEtPage(etatCourant, {
  NbPokemonAffiche : etatCourant.NbPokemonAffiche-10, NbPokemonFiltre : etatCourant.pokemon.length,
  })
}

function genereBoutonAff(etatCourant){
  return {
    html:  `
    <div class = "buttons">
    ${etatCourant.NbPokemonAffiche <= etatCourant.NbPokemonFiltre ? `<a id = "btn-more" class= "button is-light"> More </a>` : '' }
      ${etatCourant.NbPokemonAffiche > 10 ? `<a id = "btn-less" class = "button is-light"> less </a>` : ''}
    </div>`,
      callbacks : {
          "btn-more" : {
            onclick : () => addPokemon(etatCourant),
          },
          "btn-less" : {
            onclick : () => removePokemon(etatCourant),
          },
      },
    };
}

function tabDesPokemon(etatCourant){
  return etatCourant.pokemon
  .filter( poke => poke.Name.toLowerCase().include(etatCourant.namesearch.toLowerCase()) )
  .filter( i => i < etatCourant.NbPokemon)
}

function searchPokemon(etatCourant){
  console.log(document.getElementById("inputSearch").value)
  const value = document.getElementById("inputSearch").value
  const filteredTable = etatCourant.initialData
  .filter( poke => poke.Name.toLowerCase()/* == value */.includes(value.toLowerCase()))
  console.log(filteredTable)
  majEtatEtPage(etatCourant, {
    pokemon: filteredTable,
    inputSearch :value,
   });
}

function triNumber(etatCourant, direction, column){
 // const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  etatCourant.initialData.sort((a, b) => {return a[column] - b[column]}) :
  etatCourant.initialData.sort(function(a,b) {return b[column] - a[column]})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}

function triString(etatCourant, direction, column){
  //const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  etatCourant.initialData.sort((a, b) => {return a[column].localeCompare(b[column])}) :
  etatCourant.initialData.sort(function(a,b) {return b[column][0].localeCompare(a[column][0])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}
function triArray(etatCourant, direction, column){
  //const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  //etatCourant.pokemon.sort((a, b) => {return a[column][0].localeCompare(b[column])}) :
  etatCourant.pokemon.sort(function(a,b) {return a[column][0].localeCompare(b[column][0])}) :
  etatCourant.pokemon.sort(function(a,b) {return b[column][0].localeCompare(a[column][0])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}
function triAbilities(etatCourant, direction, column){
  //const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  //etatCourant.pokemon.sort((a, b) => {return a[column][0].localeCompare(b[column])}) :
  etatCourant.initialData.sort(function(a,b) {return a.Abilities[0].localeCompare(b.Abilities[0])}) :
  etatCourant.initialData.sort(function(a,b) {return b[column][0].localeCompare(a[column][0])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    initialData : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}
function triTypes(etatCourant, direction, column){
  //const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  //etatCourant.pokemon.sort((a, b) => {return a[column][0].localeCompare(b[column])}) :
  etatCourant.initialData.sort(function(a,b) {
    return a.Types.length < b.Types.length ?
      a.PokedexNumber - b.PokedexNumber && a.Types[0].localeCompare(b.Types[0]) :
      //b.Types[0].localeCompare(a.Types)
      a.Types.length > b.Types.length ?
        b.PokedexNumber - a.PokedexNumber && a.Types[0].localeCompare(b.Types) && a.Types[1].localeCompare(b.Types):
        a.Types[0] == b.Types[0] && a.Types.length == b.Types.length == 2 ? 
          a.Types[1].localeCompare(b.Types[1]):
          console.log(a.Types[1].localeCompare(b.Types), a.Name, " " , b.Name)
    }) :
  etatCourant.initialData.sort(function(a,b) {return b[column].localeCompare(a[column])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    initialData : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}

/*function triArray(etatCourant, direction, column){
  const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  //etatCourant.pokemon.sort((a, b) => {return a[column][0].localeCompare(b[column])}) :
  etatCourant.pokemon.sort(function(a,b) {return a.Types[0] - b.Types[0]}) :
  etatCourant.pokemon.sort(function(a,b) {return a.Types[0] - b.Types[0]})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}*/

/*function triArray(etatCourant, direction, column){
  const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  //etatCourant.pokemon.sort((a, b) => {return a[column][0].localeCompare(b[column])}) :
  etatCourant.pokemon.sort(function(a,b) {
    return a.Types.length == 1 && b.Types.length == 2 ?
      a[column][0].localeCompare(b[column][0]) && a[column][0].localeCompare(b[column][1]) :
      a.Types.length == 2 && b.Types.length == 1 ?
        a[column][0].localeCompare(b[column][0]) && a[column][0].localeCompare(b[column][1]) :
        " "
  }) :
  etatCourant.pokemon.sort(function(a,b) {return b[column][0].localeCompare(a[column][0])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}*/

/*function triTypes(etatCourant, direction, column){
  const id = document.getElementById(column)
  const sortedTable = (direction === "asc" ? 
  /*etatCourant.pokemon.sort(function(a,b) {
    return a[column].length == 1 && b[column].length == 2 ?
      a[column][0] -b[column][0] && a[column][0]-b[column][1] :
      a[column].length == 2 && b[column].length == 1 ?
        a[column][0]-b[column][0] && a[column][0]-b[column][1]:
        console.log("brudda")
  }) :*/
  /*etatCourant.pokemon.sort(function(a,b) {
     return a[column][0].localeCompare(b[column][0])
        //console.log("brudda")
  }) :
  etatCourant.pokemon.sort(function(a,b) {return b[column][0].localeCompare(a[column][0])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}*/


/*function triArray(etatCourant, direction, column){
  console.log(
    etatCourant.pokemon[0].Types.length == etatCourant.pokemon[1].Types.length ? etatCourant.pokemon.sort((a,b) => console.log( etatCourant.pokemon[3].Types[0].localeCompare(etatCourant.pokemon[443].Types[0]) )) /*- etatCourant.pokemon[3].Types[0]*/ /*: console.log("F  "))*/
    
  //const id = document.getElementById(column)
  //const sortedTable = (direction === "asc" ? 

    /*etatCourant.pokemon.sort(function(a,b) { 
      return  a.Types[0] == b.Types[0] && a.Types.length == b.Types.length == 2 ? 
      console.log("not workddfsdddddddddddddddddddDDing1") && a.Types[1] - b.Types[1] :
        a.Types[0] == b.Types[0] && a.Types.length == 2 && b.Types.length == 1 ?
          a.Types[0].localeCompare(b.Types[0]) :
          a.Types[0] != b.Types[0] && a.Types.length == 1 && b.Types.length == 2 ?
            a.Types[0].localeCompare(b.Types[0]) && a.Types[0].localeCompare(b.Types[1]) :
            a.Types[0] != b.Types[0] && a.Types.length == 1 || a.Types.length == 2 &&  b.Types.length == 1 && b.Types.length == 2 ?
              a.Types[0].localeCompare(b.Types[0]) : 
              console.log("Error1") 
      }
    ): 
    etatCourant.pokemon.sort(function(a,b) { 
      return a.Types[0] == b.Types[0] && a.Types.length == b.Types.length == 2 ? 
        b.Types[1] - a.Types[1]:
        a.Types[0] == b.Types[0] && a.Types.length == 2 && b.Types.length == 1 ?
          b.Types[0] - a.Types[0] :
          a.Types[0] != b.Types[0] && a.Types.length == b.Types.length == 2 ?
            b.Types[0] - a.Types[0] && b.Types[1] - a.Types[1] :
            a.Types[0] != b.Types[0] && a.Types.length == 1 || a.Types.length == 2 &&  b.Types.length == 1 && b.Types.length == 2 ?
              a.Types[0] - b.Types[0] : 
              console.log("Error2")
      }
    )*/
    /*  a.Types.length == 1 && b.Types.length == 2 ?
        a.Types[0].localeCompare(b.Types[0]) && a.Types[0].localeCompare(b.Types[1])


  )
  //console.log("done?")
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    triDirection : direction,
    triColumn : column,
  })
}*/
function switchTri(etatCourant, column){
  //const sortedTypeColumn = typeof column;
  console.log(column);
  switch(column){
    case "PokedexNumber" : 
      //console.log("aaaaa")
      triNumber(etatCourant, "asc","PokedexNumber");
      break;
    case "Name" :
      triString(etatCourant, "asc", "Name");
      break;
    case "Abilities" :
      triArray(etatCourant,"asc","Abilities" );
      break;
    case "Types" :
      triArray(etatCourant, "asc","Types");
      break;
 }
}
function inverse(etatCourant, column){
  const facing = (etatCourant.triDirection == "asc" ? "fa-angle-down" : "fa-angle-down");
  const newDir = (
    etatCourant.triDirection === "asc" ? 
      etatCourant.triDirection = "desc" : 
      etatCourant.triDirection = "asc");
  return document.getElementById(column).classList.add(facing);
}


/**
 * Génére le code HTML de la page ainsi que l'ensemble des callbacks à
 * enregistrer sur les éléments de cette page.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function generePage(etatCourant) {
  const barredeNavigation = genereBarreNavigation(etatCourant);
  const modaleLogin = genereModaleLogin(etatCourant);
  const tabPoke = genereTableaPok(etatCourant);
  const tab = genereBoutonAff(etatCourant);
  // remarquer l'usage de la notation ... ci-dessous qui permet de "fusionner"
  // les dictionnaires de callbacks qui viennent de la barre et de la modale.
  // Attention, les callbacks définis dans modaleLogin.callbacks vont écraser
  // ceux définis sur les mêmes éléments dans barredeNavigation.callbacks. En
  // pratique ce cas ne doit pas se produire car barreDeNavigation et
  // modaleLogin portent sur des zone différentes de la page et n'ont pas
  // d'éléments en commun.
  return {
    html: barredeNavigation.html + modaleLogin.html + tabPoke.html + tab.html /*+ tri.html*/,
    callbacks: { ...barredeNavigation.callbacks, ...modaleLogin.callbacks, ...tabPoke.callbacks,...tab.callbacks/*, ...tri.callbacks*/},
  };
}

/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Créée un nouvel état basé sur les champs de l'ancien état, mais en prenant en
 * compte les nouvelles valeurs indiquées dans champsMisAJour, puis déclenche la
 * mise à jour de la page et des événements avec le nouvel état.
 *
 * @param {Etat} etatCourant etat avant la mise à jour
 * @param {*} champsMisAJour objet contenant les champs à mettre à jour, ainsi
 * que leur (nouvelle) valeur.
 */

function majEtatEtPage(etatCourant, champsMisAJour) {
  const nouvelEtat = { ...etatCourant, ...champsMisAJour };
  majPage(nouvelEtat);
}

/**
 * Prend une structure décrivant les callbacks à enregistrer et effectue les
 * affectation sur les bon champs "on...". Par exemple si callbacks contient la
 * structure suivante où f1, f2 et f3 sont des callbacks:
 *
 * { "btn-pokedex": { "onclick": f1 },
 *   "input-search": { "onchange": f2,
 *                     "oninput": f3 }
 * }
 *
 * alors cette fonction rangera f1 dans le champ "onclick" de l'élément dont
 * l'id est "btn-pokedex", rangera f2 dans le champ "onchange" de l'élément dont
 * l'id est "input-search" et rangera f3 dans le champ "oninput" de ce même
 * élément. Cela aura, entre autres, pour effet de délclencher un appel à f1
 * lorsque l'on cliquera sur le bouton "btn-pokedex".
 *
 * @param {Object} callbacks dictionnaire associant les id d'éléments à un
 * dictionnaire qui associe des champs "on..." aux callbacks désirés.
 */
function enregistreCallbacks(callbacks) {
  Object.keys(callbacks).forEach((id) => {
    const elt = document.getElementById(id);
    if (elt === undefined || elt === null) {
      console.log(
        `Élément inconnu: ${id}, impossible d'enregistrer de callback sur cet id`
      );
    } else {
      Object.keys(callbacks[id]).forEach((onAction) => {
        elt[onAction] = callbacks[id][onAction];
      });
    }
  });
}

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
  console.log("CALL majPage");
  const page = generePage(etatCourant);
  document.getElementById("root").innerHTML = page.html;
  enregistreCallbacks(page.callbacks);
}

/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
function initClientPokemons() {
  console.log("CALL initClientPokemons");
  const etatInitial = {
    loginModal: false,
    login: undefined,
    errLogin: undefined,
  };
  lancePoke(etatInitial);
}

// Appel de la fonction init_client_duels au après chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Exécution du code après chargement de la page");
  initClientPokemons();
});
