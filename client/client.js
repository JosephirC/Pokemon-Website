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

 function fetchWhoami() {
  return fetch(serverUrl + "/whoami", { headers: { "Api-Key": apiKey } })
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
 function lanceWhoamiEtInsereLogin(etatCourant) {
  return fetchWhoami().then((data) => {
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
      pokemon: data,
      initialData : data,
      inputSearch: "",
      NbPokemonAffiche: 10,
      NbPokemonFiltre : 10, 
      triC : "croissant",
      triD : "decroissant",
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
    : etatCourant.login;
  //const api = document.getElementById("in").value;
  return {
    html: `
  <section class="modal-card-body">
  ${text}
    <label for= "API">Clé API</label><br />
    <input id ="in" class="input" value="" >
  </section>
  `,
    callbacks: {
     /* "in": {
      onclick: () => majEtatEtPage(etatCourant, { getVal() }),
    },*/
  },
  };
}

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
    <button id="btn-close-login-modal2" class="button" tabindex="0">Fermer</button>
    <button id="btn-close-login-modal1" class="is-success button" tabindex="0">Valider</button>
  </footer>
  `,
    callbacks: {
      "btn-close-login-modal2": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
      "btn-close-login-modal1": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
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
  var api = fetchWhoami();
  const html = `
  <div class="navbar-end">
    <div class="navbar-item">
      <div class="buttons">
        ${api === apiKey ? `<a id="btn-open-login-modal" class="button is-light"> Deconnexion </a>`: `<a id="btn-open-login-modal" class="button is-light"> Connexion </a>`}
      </div>
    </div>
  </div>`;
  return {
    html: html,
    callbacks: {
      "btn-open-login-modal": {
        onclick: () => afficheModaleConnexion(etatCourant),
      },
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
      <div class="buttons">
          <a id="btn-pokedex" class="button is-light"> Pokedex </a>
          <a id="btn-combat" class="button is-light"> Combat </a>
          <a id="btn-search" class="button is-light"> Search </a>
      </div></div>
      ${connexion.html}
    </div>
  </nav>`,
    callbacks: {
      ...connexion.callbacks,
      //"inputSearch": { onchange: () => searchPokemon(etatCourant)/*, onkeyup : () => searchPokemon(etatCourant)*/ },

      "btn-search": {
        onclick: () => searchPokemon(etatCourant)
      },
      "btn-pokedex": { onclick: () => console.log("click bouton pokedex") },
    },
    
  };
}

function generePokemon(etatCourant) {
  const tab = etatCourant.pokemon;
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
  const TabPok=generePokemon(etatCourant);
  return { 
    html: `
  <div id="tbl-pokemons">
    <table class="table">
    <thead>
      <tr>
        <th><span>Image</span></th>
        <th>
          <span>#</span
          ><span class="icon"><i class="fas fa-angle-up"></i></span>
        </th>
        <th><span>Name</span></th>
        <th><span>Abilities</span></th>
        <th><span>Types</span></th>
      </tr>
    </thead>
    <tbody>
          ${TabPok.html}
    </tbody>
    </table>
  </div>
  `,
    callbacks:{},
  };
}


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
  .filter((poke, i) => i < etatCourant.NbPokemon)
}

function searchPokemon(etatCourant){
  console.log(document.getElementById("inputSearch").value)
  /*majEtatEtPage(etatCourant, {
    namesearch : document.getElementById("search-bar").value
  });*/
  const value = document.getElementById("inputSearch").value
  const filteredTable = etatCourant.initialData
  .filter( poke => poke.Name.toLowerCase()/* == value */.includes(value.toLowerCase()))
  console.log(filteredTable)
  majEtatEtPage(etatCourant, {
    pokemon: filteredTable,
    inputSearch :value,
   });
}

function triNumberC(etatCourant){
  return (etatCourant.triC == "croissant" ?
    etatCourant.pokemon.sort(function(a,b) {return a.PokedexNumber - b.PokedexNumber}) :
    etatCourant.pokemon.sort(function(a,b) {return b.PokedexNumber - a.PokedexNumber})
  )
}

function triNumberD(etatCourant){
  return (etatCourant.triD == "decroissant" ?
    etatCourant.pokemon.sort(function(a,b) {return a.PokedexNumber - b.PokedexNumber}) :
    etatCourant.pokemon.sort(function(a,b) {return b.PokedexNumber - a.PokedexNumber})
  )
}

/*
function sortTabPoke(table,col, asc =true){
  const modif = asc ? 1 : -1;
  const bodyTable = table.bodiesTable[0];
  const row = Array.from(bodyTable.querySelectorAll("tr"));

  const sortRow = row.sort((a,b)=>{
    const aCol= a.querySelector(`td:nth-child(${col +1})`);
    const bCol= b.querySelector(`td:nth-child(${col +1})`);
    console.log(aCol);
    console.log(bCol);
  })
}*/
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
    html: barredeNavigation.html + modaleLogin.html + tabPoke.html + tab.html,
    callbacks: { ...barredeNavigation.callbacks, ...modaleLogin.callbacks, ...tabPoke.callbacks, ...tab.callbacks},
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
  console.log(nouvelEtat.pokemon);
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
