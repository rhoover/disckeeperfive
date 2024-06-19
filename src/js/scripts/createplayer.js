import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fbConfigStuff } from './config.js';

// firebase shit
let fbConfig = fbConfigStuff();
let app = initializeApp(fbConfig);
let db = getFirestore(app);
let auth = getAuth();

// initialize
let playerObject = {};
let playersData = [];

// grab the DOM elements
let createPlayerForm = document.querySelector('.form');
let submitButton = document.querySelector('.form-submit');

let successDialog = document.querySelector('.success');
let existsDialog = document.querySelector('.exists');

let existsButton = document.querySelector('.exists-button');
let successButton = document.querySelector('.success-button');

let successName = document.querySelector('.success-name');
let existsName = document.querySelector('.exists-name');

let formRequired = document.querySelector('.form-required');

(() => {
  'use strict';

  let createNewPlayer = {

    init() {
      onAuthStateChanged(auth, async (user) => {

          let fbUserID = user.uid;
      
            // initialize playerList fb reference
            let playerListRef = collection(db, 'players', fbUserID, "playerList");
      
            // get the playerList sub-collection referenced above
            let queryPlayersList = await getDocs(playerListRef);
      
            // this both converts firestore data to an in-house js object
            // and gets rid of any dummy documents generated by firestore
            queryPlayersList.forEach((doc) => {
              if (Object.keys(doc.data()).length > 0) {
                playersData.push(doc.data());              
              };
            });

            // send data along
            createNewPlayer.createPlayer(fbUserID, playersData);
      }); // end onAuthChanged

    }, // end init()

    createPlayer(fbUserID, playersData) {

      submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        playerObject.nameFirst = createPlayerForm.querySelector('#playerNameFirst').value;
        playerObject.nameLast = createPlayerForm.querySelector('#playerNameLast').value;

        // if dumbass didn't fill out both fields
        if (playerObject.nameFirst === '' || playerObject.nameLast === '') {
          formRequired.classList.add('form-required-error');
          createPlayerForm.reset();
        } else { // but if they did, then build the player object
          playerObject.playerID = Math.random().toString(36).substring(2,11);
          playerObject.playerID.toString();
          playerObject.playerCreated = new Date().toLocaleDateString('en-US');
  
          // send data along for checking if duplicate
          createNewPlayer.playerCheck(playerObject, playersData, fbUserID);
        }; // end if-else
      }); // end eventListener()
    }, // end createPlayer()

    playerCheck(playerObject, playersData, fbUserID) {
      
      if (playersData.find(x => x.nameFirst == playerObject.nameFirst && playersData.find(x => x.nameLast == playerObject.nameLast))) { // does typed in player already exist
        createNewPlayer.dialogBehavior(existsDialog, playerObject);
      } else { // else player does not exist
        createNewPlayer.dialogBehavior(successDialog, playerObject);
        // so go store it
        createNewPlayer.storage(playerObject, fbUserID)
      }; // end if-else
    }, // end playerCheck()

    dialogBehavior(whichDialog, playerObject) {

      whichDialog.querySelector('.name').innerText = `${playerObject.nameFirst} ${playerObject.nameLast}`;        
      
      whichDialog.showModal();

      successButton.addEventListener('click', () => {
        createPlayerForm.reset();
        whichDialog.close();
      });

      existsButton.addEventListener('click', () => {
        createPlayerForm.reset();
        whichDialog.close();
      });
    }, // end dialogBehavior()

    storage(playerObject, fbUserID) {

      // add document to playerList sub-collection in firestore
      setDoc(doc(db, 'players', fbUserID, 'playerList', playerObject.playerID), playerObject);
    } // end storage()
  }; // end createNewPlayer{}

  createNewPlayer.init();
})();