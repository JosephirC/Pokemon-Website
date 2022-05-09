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
      pokemon: data.sort(((a, b)=>{return a.PokedexNumber-b.PokedexNumber})),
      iData : data,
      inputSearch: "",
      NbPokemonAffiche: 10,
      NbPokemonFiltre : 10, 
      dirNum : false,
      dirName : true,
      dirAb : true,
      dirT : true,
      selectedPoke : data[18],
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

function genereNav(etatCourant){
  return {
    html: `
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar">
        <div class="navbar-item">
        <div class ="search-bar">
          <input id="iSearch" class="input" placeholder= "Chercher un pokemon" 
            type="text" value="${etatCourant.inputSearch}">
        </div>
        <div class="navbar-item"><div class="buttons">
          <a id="btn-search" class="button is-light"> Search </a>
          <a id="btn-pokedex" class="button is-light"> Pokedex </a>
          <a id="btn-combat" class="button is-light"> Combat </a>
        </div></div>`,
    callbacks: {},
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
  const nav = genereNav(etatCourant);
  return {
    html: `
          ${nav.html}
          ${connexion.html}
        </div>
      </nav>`,
    callbacks: {
      ...connexion.callbacks,
      "btn-search": { onclick: () => searchPokemon(etatCourant) },
      "btn-pokedex": { onclick: () => {majEtatEtPage(etatCourant, {
        pokemon : etatCourant.iData, 
        inputSearch : "",
        NbPokemonAffiche : 10, 
        NbPokemonFiltre : 10}) 
      }} 
    },
  };
}

function generePokemon(etatCourant) {
  const tab = etatCourant.pokemon;
 /* const callBackMap = etatCourant.inputSearch=== undefined ?
      Pokemons.slice(0,etatCourant.NbPoke)
      .map( (n) => clickPokeSelect(etatCourant,n)):
      tab.slice(0,etatCourant.NbPokemonAffiche)
      .map((n)=> clickPokeSelect(etatCourant,n)); 
      const callbacks = callBackMap.reduce( (acc,l) => ( {...acc, ...l }), {});
        console.log(callbacks);*/
  return { 
    html:
    tab.filter((_,i) => i < etatCourant.NbPokemonAffiche).reduce((acc, poke) => acc + `
  <tr >
      <td id="is-selected"><img
              alt="${poke.Name}"
              src="${poke.Images.Detail}"
              width="64" />
      </td>
      <td><div class="content">${poke.PokedexNumber}</div></td>
      <td><div class="content">${poke.Name}</div></td>
      <td>${lister(poke.Abilities)}</td>
      <td>${lister(poke.Types)}</td>
    </tr>`, ``),
    callbacks: {
      },
  };
}

function clickPokeSelect(etatCourant, poke)
        {
          const callback = {};
          callback[`${poke.PokedexNumber}`] 
          = {"onclick": () => majEtatEtPage(etatCourant,{PokeSelect:poke}) };
          return callback;

        }

function genereImageHeader(){
  return {
    html: `
      <th>
        <span id="im">Image</span>
        <span>
          <i id="imIcon" class ="fas"></i>
        </span>
      </th>`,
    callbacks: {},
  }; 
}

function genereNumberHeader(){
  return {
    html: `
      <th>
        <span id = "number">#</span>
        <span id="sNumber">
          <i id="numIcon" class ="fas"></i>
        </span>
      </th>`,
    callbacks: {},
  }; 
}

function genereNameHeader(){
  return {
    html: `
      <th>
        <span id="name">Name</span>
        <span id="sName">
          <i id="nameIcon" class ="fas"></i>
        </span>
      </th>`,
    callbacks: {},
  }; 
}

function genereAbilityHeader(){
  return {
    html: `
      <th>
        <span id="ability">Abilities</span>
        <span id="sAbility">
          <i id="abIcon" class ="fas"></i>
        </span>
      </th>`,
    callbacks: {},
  }; 
}

function genereTypesHeader(){
  return {
    html: `
      <th>
        <span id="type">Types</span>
        <span id="sType">
          <i id="typeIcon" class ="fas"></i>
        </span>
      </th>`,
    callbacks: {},
  }; 
}

function pokeHeader(){
  const imHeader = genereImageHeader();
  const numHeader = genereNumberHeader();
  const nameHeader = genereNameHeader();
  const abiHeader = genereAbilityHeader();
  const tyHeader = genereTypesHeader();
  return {
    html: `
      <div id="tbl-pokemons">
        <table class="table">
          <thead><tr>
            ${imHeader.html}
            ${numHeader.html}
            ${nameHeader.html}
            ${abiHeader.html}
            ${tyHeader.html}
          </tr></thead>`,
    callbacks: {},
  }; 
}

function genereHeader(etatCourant){
  const pHeader = pokeHeader();
  const TabPok=generePokemon(etatCourant);
  return {
    html: `
          ${pHeader.html}
          <tbody>${TabPok.html}</tbody>
        </table>
      </div>`,
    callbacks: {"is-selected":{ onclick : () => {/*clickPokeSelect(etatCourant, poke),*/ console.log("a")} },
  },
  };
}

function genereTabPok(etatCourant){
  const header = genereHeader(etatCourant);
  return { 
    html: `${header.html}`,
    callbacks:{
      "im" : { onclick : () => displayImage(etatCourant)},
      "number" : { onclick : () => switchTri(etatCourant, "PokedexNumber")},
      "name" : { onclick : () => switchTri(etatCourant, "Name")},
      "ability" : { onclick : () => switchTri(etatCourant, "Abilities")},
      "type" : {onclick : () => switchTri(etatCourant, "Types")},
    },
  };
}


function detailsHeader(poke){
  return{
    html:`
    <div class="column">
   <div class="card">
     <div class="card-header">
       <div class="card-header-title">${poke.JapaneseName}</div>
     </div>
     <div class="card-content">
       <article class="media">
         <div class="media-content">
           <h1 class="title">${poke.Name}</h1>
         </div>
       </article>
     </div>
     `,
     callbacks: {}
  };
}

/*function detailsBody(etatCourant, weakAgainst, resAgainst){
  console.log(etatCourant.pokemon) 
  return {
    html:` 
    <div class="card-content">
       <article class="media">
    <div class="media-content">
    <div class="content has-text-left">
      <p>Hit points: ${etatCourant.pokemon.Hp}</p>
      <h3>Abilities</h3>
      ${etatCourant.pokemon.Abilities.map( (a) => `<li> ${a} </li>`).join('\n') }
                
      <h3>Resistant against</h3>
      ${resAgainst.map( (a) => `<li> ${a} </li>`).join('\n') }
                
      <h3>Weak against</h3>
      ${weakAgainst.map( (a) => `<li> ${a} </li>`).join('\n') }
                
    </div>
  </div>
  `,
  callbacks: {}
  };
 
}*/

function imageFull(poke){
  return{
    html: `<figure class="media-right">
    <figure class="image is-475x475">
      <img
        class=""
        src=${poke.Images.Full}
        alt=${poke.Name}
      />
    </figure>
  </figure>
</article>
</div>`,
callbacks: {}
  };
  
}

function detailsFooter(){
  return {
    html:`
    <div class="card-footer">
       
     
     
    <article class="media">
         <div class="media-content">
           <button class="is-success button" tabindex="0">
             Ajouter à mon deck
           </button>
         </div>
       </article>
       </div>
       </div>
       </div>
      </div> `,
      callbacks: {}
  };
}

function AfficheSelectedPokemon(etatCourant){
  const against = Object.keys(etatCourant.selectedPoke.Against);
  console.log(against);
  const weak = against.filter((a) => etatCourant.selectedPoke.Against[a] > 1);
  const resistant = against.filter((b) => etatCourant.selectedPoke.Against[b] < 1);
  //const dHeader = detailsHeader(poke);
  //const dBody = detailsBody(poke);
  //const dImg = imageFull(poke);
  //const dFooter = detailsFooter();
  //${detailsBody(poke, weak, resistant)}
  console.log("yee")
  
  return {
    html:
    against.reduce((acc, poke) => acc +
    ` 
     ${detailsHeader(poke)}
    
     <div class="card-content">
       <article class="media">
    <div class="media-content">
    <div class="content has-text-left">
      <p>Hit points: ${poke.Hp}</p>
      <h3>Abilities</h3>
     
      <h3>Resistant against</h3>
      ${resistant.map( (a) => `<li> ${a} </li>`).join('\n') }
                
      <h3>Weak against</h3>
      ${weak.map( (a) => `<li> ${a} </li>`).join('\n') }
                
    </div>
  </div>
  
     ${imageFull(etatCourant.selectedPoke)}
     ${detailsFooter()}
     `,),
    callbacks : {}
  };

}


function genereSelectedPokemon(etatCourant) {
  const against = Object.keys(etatCourant.PokeSelect.Against);
  const againstRes = against.filter( (w) => etatCourant.PokeSelect.Against[w] < 1);
  const againstWeak = against.filter( (w) => etatCourant.PokeSelect.Against[w] > 1);
  return {
    html:`
    <div class="column" style="float:left; width: 50%;">
      <div class="card">
        ${AfficheUnPokeHeader(etatCourant.PokeSelect)}
        <div class="card-content">
          <article class="media">
            ${AfficheUnPokeBody(etatCourant.PokeSelect
              ,againstRes,againstWeak)}
            ${AfficheUnPokeImage(etatCourant.PokeSelect)}
          </article>
        </div>
        <div class="card-footer">
              ${AfficheUnPokeFooter()}
        </div>
      </div>
    </div>
    `,
    callbacks: {}
  };
}

function addPokemon(etatCourant){
  majEtatEtPage(etatCourant, {
   NbPokemonAffiche : etatCourant.NbPokemonAffiche+10, 
   NbPokemonFiltre : etatCourant.pokemon.length,
  })
}
 
function removePokemon(etatCourant){
  majEtatEtPage(etatCourant, {
  NbPokemonAffiche : etatCourant.NbPokemonAffiche-10, 
  NbPokemonFiltre : etatCourant.pokemon.length,
  })
}

function genereBoutonAff(etatCourant){
  const NbA = etatCourant.NbPokemonAffiche;
  const NbF = etatCourant.NbPokemonFiltre;
  return {
    html:  `
      <div class = "buttons">
        ${NbF < 10 ? 
          '' : 
          `${NbA <= NbF ? 
            `<a id = "btn-more" class= "button is-light"> More </a>` : '' }`}
        ${NbA  > 10 ? 
          `<a id = "btn-less" class = "button is-light"> Less </a>` : ''}
      </div>`,
    callbacks : {
      "btn-more" : { onclick : () => addPokemon(etatCourant)},
      "btn-less" : { onclick : () => removePokemon(etatCourant)},
    },
  };
}

function searchPokemon(etatCourant){
  const value = document.getElementById("iSearch").value
  const filteredTable = etatCourant.iData
  .filter( poke => poke.Name.toLowerCase().includes(value.toLowerCase()))
  majEtatEtPage(etatCourant, {
    pokemon: filteredTable,
    inputSearch : value,
    NbPokemonAffiche : 10,
    NbPokemonFiltre : filteredTable.length,
   });
}

function displayImage(etatCourant){
  etatCourant.iData.sort((a, b) => a.PokedexNumber -b.PokedexNumber)
  majEtatEtPage(etatCourant)
  inverseDir("imIcon",true);
}

function triNumber(etatCourant, direction, column){
  const iData = etatCourant.iData;
  const sortedTable = (direction === true ? 
    iData.sort((a, b)=>{return a[column]-b[column]}):
    iData.sort((a, b)=>{return b[column]-a[column]})
  )
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    dirNum : !direction,
  })
}

function triString(etatCourant, direction, column){
  const iData = etatCourant.iData;
  etatCourant.iData.sort(((a, b)=>{return a.PokedexNumber-b.PokedexNumber}))
  const sortedTable = (direction === true ? 
    iData.sort((a, b) => {return a[column].localeCompare(b[column])}) :
    iData.sort((a, b) => {return b[column].localeCompare(a[column])})
  )
  console.log(sortedTable)
  majEtatEtPage(etatCourant, {
    pokemon : sortedTable,
    dirName : !direction,
  })
}

function triAbilities(etatCourant, direction, column){
  const iData = etatCourant.iData;
  iData.sort(((a, b)=>{return a.PokedexNumber-b.PokedexNumber}))
  const sortedTable = (direction === true ? (iData.sort(function(a,b){
    (a[column][0] || "").localeCompare((b[column][0] || "")) === 0 ?
      ((a[column][1] || "").localeCompare((b[column][1] || "")) === 0 ? 
        res = (a[column][2] || "").localeCompare((b[column][2] || "")): 
        res = (a[column][1] || "").localeCompare((b[column][1] || ""))
      ) : res = (a[column][0] || "").localeCompare((b[column][0] || ""));
    return res}
    )) : (iData.sort(function(a,b){
    (b[column][0] || "").localeCompare((a[column][0] || "")) === 0 ?
      ((b[column][1] || "").localeCompare((a[column][1] || "")) === 0 ? 
        res = (b[column][2] || "").localeCompare((a[column][2] || "")):
        res = (b[column][1] || "").localeCompare((a[column][1] || ""))
      ) : res = (b[column][0] || "").localeCompare((a[column][0] || ""));
    return res})))
  majEtatEtPage(etatCourant, {  
    pokemon : sortedTable, dirAb : !direction,
  })
}

function triTypes(etatCourant, direction, column){
  const iData = etatCourant.iData;
  iData.sort(((a, b)=>{return a.PokedexNumber-b.PokedexNumber}))
  const sortedTable = (direction === true ? (iData.sort(function(a,b){
    (a[column][0] || "").localeCompare((b[column][0] || "")) === 0 ?
      ((a[column][1] || "").localeCompare((b[column][1] || "")) === 0 ? 
        res = (a[column][2] || "").localeCompare((b[column][2] || "")): 
        res = (a[column][1] || "").localeCompare((b[column][1] || ""))
      ) : res = (a[column][0] || "").localeCompare((b[column][0] || ""));
    return res}
    )) : (iData.sort(function(a,b){
    (b[column][0] || "").localeCompare((a[column][0] || "")) === 0 ?
      ((b[column][1] || "").localeCompare((a[column][1] || "")) === 0 ? 
        res = (b[column][2] || "").localeCompare((a[column][2] || "")):
        res = (b[column][1] || "").localeCompare((a[column][1] || ""))
      ) : res = (b[column][0] || "").localeCompare((a[column][0] || ""));
    return res})))
  majEtatEtPage(etatCourant, {  
    pokemon : sortedTable, dirT : !direction,
  })
}

function switchTri(etatCourant, column){
  const dnum = !etatCourant.dirNum; const dname = !etatCourant.dirName;
  const dAbi = !etatCourant.dirAb; const dTy = !etatCourant.dirT;
 switch(column){
    case "PokedexNumber" : 
      triNumber(etatCourant, !dnum,"PokedexNumber");
      inverseDir("numIcon", !dnum); break;
    case "Name" :
      triString(etatCourant, !dname, "Name");
      inverseDir("nameIcon", !dname); break;
    case "Abilities" :
      triAbilities(etatCourant,!dAbi,"Abilities");
      inverseDir("abIcon", !dAbi); break;
    case "Types" :
      triTypes(etatCourant, !dTy,"Types");
      inverseDir("typeIcon", !dTy); break;
  }
}

function inverseDir(column, dir){
  const d = dir;
  d === true ? 
    document.getElementById(column).classList.add("fa-angle-up") : 
    document.getElementById(column).classList.add("fa-angle-down")
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
  const tabPoke = genereTabPok(etatCourant);
  const tab = genereBoutonAff(etatCourant);
  const affSelected = AfficheSelectedPokemon(etatCourant);
  // remarquer l'usage de la notation ... ci-dessous qui permet de "fusionner"
  // les dictionnaires de callbacks qui viennent de la barre et de la modale.
  // Attention, les callbacks définis dans modaleLogin.callbacks vont écraser
  // ceux définis sur les mêmes éléments dans barredeNavigation.callbacks. En
  // pratique ce cas ne doit pas se produire car barreDeNavigation et
  // modaleLogin portent sur des zone différentes de la page et n'ont pas
  // d'éléments en commun.
  return {
    html: barredeNavigation.html + modaleLogin.html + tabPoke.html + tab.html + affSelected.html,
    callbacks: { ...barredeNavigation.callbacks, ...modaleLogin.callbacks, ...tabPoke.callbacks,...tab.callbacks, ...affSelected.callbacks},
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
