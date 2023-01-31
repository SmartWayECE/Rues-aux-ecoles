/*
    Lorque l'on click sur la loupe, on lance le programme suivant :
*/
loupe.onclick = () => {
  console.clear(); //on vide la console

  layerRemoveMarkers(); //on enlève les marqueurs de la carte

  var saisie = lieu.value.toLowerCase(); //on met la saisie en minuscule
  console.log("1) Donnée d'entrée (en minuscule) :", saisie);

  //on vide l'affichage des résultats
  var viderAffichageOutput = (document.getElementById("output").textContent = "");
  var viderAffichageResultat = (document.getElementById("resultat").textContent = "");

  var compteur = 0; //compteur pour les critères

  //on interdit la saisie à vide
  if (saisie.length != 0 && saisie != " ") {
    console.log("2) L'utilisateur a bien saisie quelques choses");

    //c'est la seule exeption de la base de donnée, on la traite donc à la main pour aller plus vite 
    if (saisie == "boulevard davout") {
      saisie = "bd davout";
    };

    //on va charger l'API de l'ensemble des écoles élementaires, pour trouver l'école correspondant à la rue saisie
    const urlEcole = "https://opendata.paris.fr/api/records/1.0/search/?dataset=etablissements-scolaires-ecoles-elementaires&q=&rows=354&refine.id_projet=ELEMENTAIRES+(année+scolaire+2022%2F2023)&q=" + saisie + "&row=1";
    
    fetch(urlEcole)
      .then((reponseEcole) => reponseEcole.json())
      .then((dataEcole) => {
        console.log("3) L'API écoles élementaires a bien été chargée");

        if(dataEcole.records[0]==null) {
          console.log("4) Il n'y a pas d'école dans cette rue");

          //affichage pour l'utilisateur
          const h3 = document.createElement("h3");
          h3.classList = "rue";
          output.appendChild(h3);
          const textContent = document.createTextNode("Il n'y a pas d'école dans cette rue.");
          h3.appendChild(textContent);
        }
        else {
          console.log("4) Il a bien une école dans cette rue");

          var addresseEcole = dataEcole.records[0].fields.adresse.toLowerCase(); //on met l'adresse de l'école en minuscule
          console.log("5) Adresse de l'école :", addresseEcole);

          //le marqueur est placé sur la carte avec les coordonnées de l'école
          var latitude = dataEcole.records[0].fields.geo_point_2d[0];
          var longitude = dataEcole.records[0].fields.geo_point_2d[1];
          macarte.setView([latitude, longitude], 18);
          L.marker([latitude, longitude]).addTo(lgMarkers);

          //on remplace boulevard par bd
          var i = 1;
          var addresseEcoleModifiee ="";
          var splittedSaisie = addresseEcole.split(" "); //on coupe à chaque fois qu'on rencontre un espace
          if (splittedSaisie[1] == "bis") {
            addresseEcoleModifiee = "";
            while (i != splittedSaisie.length - 1) {
              ++i;
              addresseEcoleModifiee += " ";
              addresseEcoleModifiee += splittedSaisie[i];
            };
            console.log("6) La saisie après le traitement de la chaîne :", addresseEcoleModifiee);
          }
          else if (splittedSaisie[1] == "bd") {
            addresseEcoleModifiee = "boulevard";
            for(i=1; i<splittedSaisie.length - 1; ++i) {
              if(splittedSaisie[0] != " ") {
                addresseEcoleModifiee += " ";
              };
              addresseEcoleModifiee += splittedSaisie[i];
            };
            console.log("6) La saisie après le traitement de la chaîne :", addresseEcoleModifiee);
          }
          else {
            for(i=1; i<splittedSaisie.length; ++i) {
              if(splittedSaisie[0] != " ") {
                addresseEcoleModifiee += " ";
              };
              addresseEcoleModifiee += splittedSaisie[i];
            };
            console.log("6) La saisie après le traitement de la chaîne :", addresseEcoleModifiee);
          };

          const addresseEcoleMajuscule = addresseEcoleModifiee.toUpperCase(); //pour l'affichage en majuscule de la rue de l'école
          console.log("7) Adresse pour les recherches :", addresseEcoleMajuscule);

          //on va charger l'API bornes électriques, pour trouver si il y a une borne électrique dans la rue de l'école souhaitée
          const urlBorne = "https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=belib-points-de-recharge-pour-vehicules-electriques-donnees-statiques&q=" + addresseEcoleModifiee + "&rows=1";
          fetch(urlBorne)
            .then((reponseBorne) => reponseBorne.json())
            .then((dataBorne) => {
              console.log("8) L'API bornes électriques a bien été chargée");

              const records = dataBorne.records;

              if (records.length == 0) {
                console.log("9) Il n'y a pas de borne électrique dans cette rue");

                //affichage pour l'utilisateur
                const h3 = document.createElement("h3");
                h3.classList = "rue";
                output.appendChild(h3);
                const textContent = document.createTextNode(addresseEcoleMajuscule);
                h3.appendChild(textContent);
                const br = document.createElement("br");
                output.appendChild(br);
                const img = document.createElement("img");
                img.src = "img/check.png";
                img.classList = "validation";
                output.appendChild(img);
                const div = document.createElement("div");
                output.appendChild(div);
                const texteBorne = document.createTextNode("Il n'y a pas de borne électrique.");
                div.classList = "check";
                div.appendChild(texteBorne);
              } 
              else {
                console.log("9) Il a une borne électrique dans cette rue");

                const adresse_station = dataBorne.records[0].fields.adresse_station;
                console.log("+) La borne se situe au :", adresse_station);

                //affichage pour l'utilisateur
                const h3 = document.createElement("h3");
                h3.classList = "rue";
                output.appendChild(h3);
                const textContent = document.createTextNode(addresseEcoleMajuscule);
                h3.appendChild(textContent);
                const br = document.createElement("br");
                output.appendChild(br);
                const img = document.createElement("img");
                img.src = "img/croix.png";
                img.classList = "validation";
                output.appendChild(img);
                const div = document.createElement("div");
                output.appendChild(div);
                const texteBorne = document.createTextNode("Il y a des bornes électrique.");
                div.classList = "croix";
                div.appendChild(texteBorne);
                ++compteur;
              }

              //on va convertir l'adresse de l'école pour l'utiliser pour déterminer si il s'agit d'un axe principal
              var splittedAxePrincipal = addresseEcoleModifiee.split(" "); // On coupe à chaque fois qu'on rencontre un espace
              var newAddresseEcoleModifiee = "";

              for(i=1; i<splittedAxePrincipal.length; i++) {
                if(splittedAxePrincipal[i]!="de" && splittedAxePrincipal[i]!="du" && splittedAxePrincipal[i]!="rue") {
                  newAddresseEcoleModifiee += splittedAxePrincipal[i];
                  if(i != splittedAxePrincipal.length-1) {
                    newAddresseEcoleModifiee += "_";
                  }
                }
              }

              console.log("10) Adresse pour déterminer l'axe principal :", newAddresseEcoleModifiee);

              //on va charger l'API axes principaux, pour déterminer si il s'agit d'un axe principal
              const urlAxePrincipale = "https://opendata.paris.fr/api/records/1.0/search/?dataset=referentiel-comptages-routiers&q=" + newAddresseEcoleModifiee + "&rows=1";
              fetch(urlAxePrincipale)
                .then((reponseAxePrincipal) => reponseAxePrincipal.json())
                .then((dataAxePrincipal) => {
                  console.log("11) L'API Axes principaux a bien été chargée");

                  //on va déterminer si l'adresse contient boulevard ou avenue
                  const adresseAxePrincipal = addresseEcoleModifiee.split(" ");

                  //on concidère qu'un axe contenant boulevard ou avenue est forcement principal
                  if (adresseAxePrincipal[1] == "boulevard" || adresseAxePrincipal[1] == "avenue" || adresseAxePrincipal[2] == "jeanne" || newAddresseEcoleModifiee=="d'alesia" || newAddresseEcoleModifiee=="des_pyrenees" || newAddresseEcoleModifiee=="lafayette" || newAddresseEcoleModifiee=="blanche") {
                    console.log("12) C'est une rue principale (boulevard ou avenue)");

                    //affichage pour l'utilisateur
                    const img = document.createElement("img");
                    img.src = "img/croix.png";
                    img.classList = "validation";
                    output.appendChild(img);
                    const div = document.createElement("div");
                    output.appendChild(div);
                    const texteAxePrincipal = document.createTextNode("C'est une rue principale");
                    div.classList = "croix";
                    div.appendChild(texteAxePrincipal);

                    ++compteur;
                  } 
                  else {
                    const lectureAxePrincipal = dataAxePrincipal.records;

                    if (lectureAxePrincipal.length == 0) {
                      console.log("12) Ce n'est pas une rue principale (absente de l'API)");

                      //affichage pour l'utilisateur
                      const img = document.createElement("img");
                      img.src = "img/check.png";
                      img.classList = "validation";
                      output.appendChild(img);
                      const div = document.createElement("div");
                      output.appendChild(div);
                      const texteAxePrincipal = document.createTextNode("Ce n'est pas une rue principale");
                      div.classList = "check";
                      div.appendChild(texteAxePrincipal);
                    } 
                    else {
                      console.log("12) C'est une rue principale (présente dans l'API)");

                      //affichage pour l'utilisateur
                      const img = document.createElement("img");
                      img.src = "img/croix.png";
                      img.classList = "validation";
                      output.appendChild(img);
                      const div = document.createElement("div");
                      output.appendChild(div);
                      const texteAxePrincipal = document.createTextNode(
                        "C'est une rue principale"
                      );
                      div.classList = "croix";
                      div.appendChild(texteAxePrincipal);

                      ++compteur;
                    }
                  };

                  //on récupère les coordonnées de tous les arrêts des bus dans Paris
                  var checkBus = 0; //variable pour déterminer si il y a un bus dans la rue

                  //chargement du fichier json
                  const urlBus = "js/busbackup.json";
                  fetch(urlBus)
                    .then(reponse => reponse.json())
                    .then(dataBus => {
                      console.log("13) Le fichier JSON des arrets de bus a bien été chargé");

                      var i = 0;
                      for (i = 0; i < dataBus.length; ++i) {
                        console.log(addresseEcoleModifiee, "vs", dataBus[i].street);

                        if (addresseEcoleModifiee == dataBus[i].street) {
                          console.log("Il y a un bus dans la rue :", dataBus[i].street);
                          ++checkBus;
                          break;
                        }

                      };

                      //affichage pour l'utilisateur
                      if (checkBus > 0) {
                        const img = document.createElement("img");
                        img.src = "img/croix.png";
                        img.classList = "validation";
                        output.appendChild(img);
                        const div = document.createElement("div");
                        output.appendChild(div);
                        const texteBus = document.createTextNode("Il y a un arrêt de bus");
                        div.classList = "croix";
                        div.appendChild(texteBus);
                        ++compteur;
                      }
                      else {
                        const img = document.createElement("img");
                        img.src = "img/check.png";
                        img.classList = "validation";
                        output.appendChild(img);
                        const div = document.createElement("div");
                        output.appendChild(div);
                        const texteBus = document.createTextNode("Il n'y a pas d'arrêt de bus dans la rue");
                        div.classList = "check";
                        div.appendChild(texteBus);
                      };

                          //ici on va déterminer si l'école est éligible au projet "Rues aux écoles"
                          console.log("13) Valeur du compteur :", compteur);

                          var nomEcole = "";
                          var splittedNomEcole =
                            addresseEcoleMajuscule.split(" "); //on coupe à chaque fois qu'on rencontre un espace*/
                          for (i = 2; i < splittedNomEcole.length; ++i) {
                            if (i > 2) {
                              nomEcole += " ";
                            }
                            nomEcole += splittedNomEcole[i];
                          };

                          console.log("14) Nom de l'école élémentaire :", nomEcole);

                          //affichage pour l'utilisateur
                          if (compteur == 0) {
                            const pC = document.createElement("p");
                            resultat.appendChild(pC);
                            const textResultC = document.createTextNode("Cette école remplit tous les critères pour pouvoir faire partie du projet 'Rues aux écoles'.");
                            pC.appendChild(textResultC);
                            const divR = document.createElement("div");
                            divR.classList = "rue";
                            resultat.appendChild(divR);
                            const pR = document.createElement("p");
                            pR.classList = "vert";
                            divR.appendChild(pR);
                            const textResult = document.createTextNode("Ecole Elémentaire " + nomEcole + " : éligible");
                            pR.appendChild(textResult);
                            const imgR = document.createElement("img");
                            imgR.src = "img/check.png";
                            imgR.classList = "conclusion";
                            resultat.appendChild(imgR);
                          } 
                          else {
                            const pC = document.createElement("p");
                            resultat.appendChild(pC);
                            const textResultC = document.createTextNode("Cette école ne remplit pas encore tous les critères pour pouvoir faire partie du projet 'Rues aux écoles'.");
                            pC.appendChild(textResultC);
                            const divR = document.createElement("div");
                            divR.classList = "rue";
                            resultat.appendChild(divR);
                            const pR = document.createElement("p");
                            pR.classList = "rouge";
                            divR.appendChild(pR);
                            const textResult = document.createTextNode("Ecole Elémentaire " + nomEcole + " : pas éligible");
                            pR.appendChild(textResult);
                            const imgR = document.createElement("img");
                            imgR.src = "img/croix.png";
                            imgR.classList = "conclusion";
                            resultat.appendChild(imgR);
                          };
                        });
                })
                .catch((error) => console.log(error));

            })
            .catch((error) => console.log(error));

        };

      })
      .catch((error) => console.log(error));

  } 
  //la saisie n'est pas valide, on informe l'utilisateur
  else {
    console.log("2) L'utilisateur n'a rien saisie");

    //affichage pour l'utilisateur
    const h3 = document.createElement("h3");
    h3.classList = "rue";
    output.appendChild(h3);
    const textContent = document.createTextNode("Veuillez saisir le nom d'une rue.");
    h3.appendChild(textContent);
  };

};