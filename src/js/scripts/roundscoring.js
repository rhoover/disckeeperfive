import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fbConfigStuff } from './config.js';

// firebase shit
let fbConfig = fbConfigStuff();
let app = initializeApp(fbConfig);
let db = getFirestore(app);
let auth = getAuth();

// get DOM elements:
// querySelector all the things
let courseName = document.querySelector('[data-courseName]');
let holeNumber = document.querySelector('[data-holenumber]');
let holePar = document.querySelector('[data-parnumber]');
let submitThrowsButton = document.querySelector('[data-submit]');

// seed confirm
let activePlayerName = document.querySelectorAll('[data-playerConfirmname]');

// seed players scores
let scoringSection = document.querySelector('.players');
let throwsBox = document.querySelector('[data-throws]');

// modal
let scoringModal = document.querySelector('dialog');
let modalHeader = document.querySelector('.modal-header');
let modalDate = document.querySelector('.modal-date');
let modalRoundData = document.querySelector('.modal-round');
let closeButton = document.querySelector('.modal-footer-close-icon');
let saveButton = document.querySelector('.modal-footer-save-icon');

// initialize
let activePlayer, nextHoleIndex, roundScore, roundScoreDisplay;

// finishing up
let whereInPlayerList;
let savedRound = {};

(() => {
  'use strict';

  let roundScoring = {

    init() {

      let players = JSON.parse(localStorage.getItem('chosenPlayers'));
      let course = JSON.parse(localStorage.getItem('chosenCourse'));

      //send down course and players data
      roundScoring.seedMetaSection(course);
      roundScoring.seedConfirmSection(players);
      roundScoring.seedPlayerScoresSection(players);
      roundScoring.scoringSection(course, players);

    }, // end init()

    seedMetaSection(course) {
      courseName.innerText = course.courseName;
      holeNumber.innerText = course.courseHoles[0].holeNumber;
      holePar.innerText = course.courseHoles[0].holePar;
    }, // end seedMetaSection()

    seedConfirmSection(players) {
      activePlayerName.forEach((player, index) => {
        activePlayerName[index].innerHTML = players[0].nameFirst;
      });
    }, // end seedConfirmSection()

    seedPlayerScoresSection(players) {
      players.forEach((player, index) => {
        scoringSection.innerHTML += `
        <div class="players-player">
          <p class="players-name" data-player-name">${player.nameFirst}</p>
          <p class="players-text-upper">Score:</p>
          <p class="players-text-lower">Throws:</p>
          <p class="players-score" data-player-score></p>
          <p class="players-throws" data-player-throws></p>
        </div>
        `;
      });
    }, // end seedPlayerScoresSection()

    scoringSection(course, players) {

      // these two DOM elements have to be here as they are generated, not inherent to the page
      let playerScoreCurrent = document.querySelectorAll('[data-player-score]'); 
      let playerThrowsCurrent = document.querySelectorAll('[data-player-throws]');

      // indices for moving through players and holes 
      let activePlayerIndex = 0;
      let roundIndex = 0;

      // number pad web component
      customElements.define('num-pad', class extends HTMLElement {
        constructor() {
          super();
          this.addEventListener('click', this);
        };

        handleEvent(event) {
          this[`on${event.type}`](event);
        };

        onclick(event) {
          // put number clicked into throwsbox
          let numberClicked = event.target.getAttribute('data-step');

          // a ternery in case there's a double digit throw for the hole:
          // is there stuff in target element ? if yes, concatenate new click : if no just drop click into target element
          throwsBox.innerText ? throwsBox.innerText += numberClicked : throwsBox.innerText = numberClicked;

          // clear throwsbox element
          if (event.target.getAttribute('data-clear')) {
            throwsBox.innerText = '';
          }; // end if
        }; // end onclick()
      }); // end customElements.define()

      // and by submit we mean update the js objects
      submitThrowsButton.addEventListener('click', event => {
        
        if (throwsBox.innerText) {

          // deep copy necessary
          activePlayer = JSON.parse(JSON.stringify(players[activePlayerIndex]));

          // this is it!! calling the function just below
          scorekeeping(parseInt(throwsBox.innerText, 10), activePlayer);
        };
      }); // end submitThrowsButton()

      // the big kahuna, scorekeeping():
      // across **possible** multiple players and **certainly** multiple holes
      // TODO would be moving stuff to localStorage for perhaps some persistence
      // in case one round on the same course goes over several days
      // as things stand, the logic is pretty fucking mind-bending imho
      function scorekeeping(incomingThrows, activePlayer) {
        // the parameters come from clicking the submit button above

        switch (true) {
          // if it's not the last hole
          case roundIndex < course.courseHoles.length -1:
            
            // js object activity
            // then update activePlayer object with new scoring data
            activePlayer.courseHoles[roundIndex].throwsHole = incomingThrows;
            // add hole throws to round throws
            activePlayer.courseHoles[roundIndex].throwsRound += incomingThrows;
            activePlayer.courseHoles[roundIndex].overUnderHole = (incomingThrows - activePlayer.courseHoles[roundIndex].holePar);
            // add hole over-under to round over-under
            activePlayer.courseHoles[roundIndex].overUnderRound += activePlayer.courseHoles[roundIndex].overUnderHole;

            // DOM activity
            // first decide how to display the round score, over or under
            roundScoreDisplay = activePlayer.courseHoles[roundIndex].overUnderRound
            let howToDisplayRoundScore = (roundScoreDisplay) => {
              switch (true) {
                case roundScoreDisplay == 0:
                  return roundScoreDisplay;
                break;
                case roundScoreDisplay > 0:
                  return '+' + roundScoreDisplay;
                  
                break;
                case roundScoreDisplay < 0:
                  return roundScoreDisplay;
                break;
              
                default:
                  break;
              }; // end switch
            }; // end howToDisplayRoundScore()

            // then write new score to displayed overUnderRound
            playerScoreCurrent[activePlayerIndex].innerText = `${howToDisplayRoundScore(roundScoreDisplay)}`;
            // then write throwsRound to displayed throws
            playerThrowsCurrent[activePlayerIndex].innerText = activePlayer.courseHoles[roundIndex].throwsRound;

            // then UI goodness: different colors for different scores
            roundScore = activePlayer.courseHoles[roundIndex].overUnderRound;
            switch (true) {
              // over par
              case roundScore > 0:
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-under');
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-par');

                playerScoreCurrent[activePlayerIndex].classList.add('players-score-over');
              break;

              // par
              case roundScore == 0:
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-over');
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-under');

                playerScoreCurrent[activePlayerIndex].classList.add('players-score-par');
              break;

              // under par
              case roundScore < 0:
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-over');
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-par');
                
                playerScoreCurrent[activePlayerIndex].classList.add('players-score-under');
              break;

              default:
              break;
            }; // end switch - roundscore

            // then seed next hole for active player
            nextHoleIndex = roundIndex + 1;
            activePlayer.courseHoles[nextHoleIndex].throwsRound = activePlayer.courseHoles[roundIndex].throwsRound;
            activePlayer.courseHoles[nextHoleIndex].overUnderRound = activePlayer.courseHoles[roundIndex].overUnderRound;

            // then deep copy of original chosenPlayers array necessary after modifying referenced activePlayer object
            players[activePlayerIndex] = JSON.parse(JSON.stringify(activePlayer));
            
            // then bump to next player if exists to become activePlayer
            whereInPlayerList = activePlayerIndex < players.length - 1;
            switch (whereInPlayerList) {
              // if true, it is not the last player in the list
              case true:
                activePlayerIndex++;
                activePlayer = players[activePlayerIndex];
                
                // update UI confirm area player
                activePlayerName.forEach(function(name) {
                  name.innerText = players[activePlayerIndex].nameFirst;
                });
              break;

              // it is either the last player in the list or a single player
              case false:          
                activePlayerIndex = 0;
                roundIndex++;
    
                // update UI confirm area player
                activePlayerName.forEach(function(name) {
                  name.innerText = players[activePlayerIndex].nameFirst;
                });
    
                // update displayed hole meta info at the top of the screen
                holeNumber.innerText = course.courseHoles[roundIndex].holeNumber;
                holePar.innerText = course.courseHoles[roundIndex].holePar;
              break;
              default:
              break;
            }; // end switch - whereInPlayerListh
          break; // end if it's not the last hole

          // then it is the last hole
          case roundIndex == course.courseHoles.length -1:

          // js object activity
          // then update activePlayer object with new scoring data
          activePlayer.courseHoles[roundIndex].throwsHole = incomingThrows;
          // add hole throws to round throws
          activePlayer.courseHoles[roundIndex].throwsRound += incomingThrows;
          activePlayer.courseHoles[roundIndex].overUnderHole = (incomingThrows - activePlayer.courseHoles[roundIndex].holePar);
          // add hole over-under to round over-under
          activePlayer.courseHoles[roundIndex].overUnderRound += activePlayer.courseHoles[roundIndex].overUnderHole;

          // as there is no next hole...
          // ie no DOM activity, no ui goodness, no seeding next hole
          // then deep copy of original chosenPlayers array necessary after modifying referenced activePlayer object
          players[activePlayerIndex] = JSON.parse(JSON.stringify(activePlayer));

          // then bump to next player if exists to become activePlayer
          whereInPlayerList = activePlayerIndex < players.length - 1;
          switch (whereInPlayerList) {
            // if true, it is not the last player in the list
            case true:
              activePlayerIndex++;
              activePlayer = players[activePlayerIndex];
              
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerText = players[activePlayerIndex].nameFirst;
              });
            break;

            // it is either the last player in the list or a single player on last hole
            case false:          
              activePlayerIndex = 0;
  
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerText = players[activePlayerIndex].nameFirst;
              });
  
              // update displayed hole meta info at the top of the screen
              holeNumber.innerText = course.courseHoles[roundIndex].holeNumber;
              holePar.innerText = course.courseHoles[roundIndex].holePar;

              // finishing up
              // then seed the finishing modal
              roundScoring.seedFinishedModal(course, players, roundIndex);
            break;
            default:
            break;
          }; // end switch
          break;
        
          default:
          break; // end then it is the last hole
        }; // end grand switch: last hole or not
        
        // start all over again
        throwsBox.innerText = "";
      };
    }, // end scoringSection()

    seedFinishedModal(course, players, roundIndex) {

      // seed dialog header
      modalHeader.innerText = `Finished Round: ${course.courseName}`;
      modalDate.innerText = `${course.roundDate}`;

      players.forEach((player) => {
        player.finalScore = player.courseHoles[roundIndex].overUnderRound;
        player.finalThrows = player.courseHoles[roundIndex].throwsRound;

        modalRoundData.innerHTML += `
        <div class="modal-player">
          <p class="modal-player-name">${player.nameFirst}:</p>
          <p class="modal-player-upper">Score:</p>
          <p class="modal-player-score">${player.finalScore}</p>
          <p class="modal-player-lower">Throws:</p>
          <p class="modal-player-throws">${player.finalThrows}</p>
        </div>
        `;
      });

      roundScoring.manageFinishedModal(course, players);

    }, // end seedFinishedModal()

    manageFinishedModal(course, players) {

      let primaryPlayer = players.find((player) => player.primary === true);

      savedRound = {
        player: primaryPlayer,
        courseName: course.courseName,
        courseID: course.courseID,
        roundID: course.roundID,
        roundDate: new Date().toLocaleDateString('en-US')
      };

      scoringModal.showModal();

      // footer events
      saveButton.addEventListener('click', (event) => {
        if (event.target.closest('.modal-footer-save-icon')) {
          roundScoring.storage(savedRound, course);
        };
      });

      closeButton.addEventListener('click', (event) => {
        if (event.target.closest('.modal-footer-close-icon')) {
          scoringModal.close();
          // // off to home page
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        };
      });
    }, // end manageFinishedModal()

    storage(savedRound, course) {
      // bump by 1
      course.roundsScored++;
      console.log('round:', savedRound, 'course:', course);

      // remove chosenStuff in local storage for this round
      localStorage.removeItem('chosenCourse');
      localStorage.removeItem('chosenPlayers');

      // fire up firebase
      onAuthStateChanged(auth, async (user) => {

          let fbUserID = user.uid;

            // set new document to savedRounds sub-collection in firestore
            await setDoc(doc(db, 'players', fbUserID, 'savedRounds', savedRound.roundID), savedRound)

            updateDoc(doc(db, 'players', fbUserID, 'courseList', course.courseID), {roundsScored: course.roundsScored});

          scoringModal.close();
          // off to home page
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);

        // };
      });

    }, // end storage()
  };

roundScoring.init();
})();