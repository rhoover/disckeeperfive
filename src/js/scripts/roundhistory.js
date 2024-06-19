import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fbConfigStuff } from './config.js';

// firebase shit
let fbConfig = fbConfigStuff();
let app = initializeApp(fbConfig);
let db = getFirestore(app);
let auth = getAuth();

// DOM Elements
let chooseSection = document.querySelector('.choose');
let roundsSection = document.querySelector('.rounds');
let roundsWarning = document.querySelector('.roundhistory');
let statsEncourage = document.querySelector('.stats');
let roundsSectionDialogs = document.querySelectorAll('.course');

// round-detail dialog
let roundModal = document.querySelector('.round-modal');
let roundModalHeader = document.querySelector('.round-modal-header');
let closeButton = document.querySelector('.round-modal-close');
let holesSection = document.querySelector('.round-modal-holes');

//initialize
let roundsData = [];
let deduped;
let dateOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
};

(() => {
  'use strict';

  let roundHistory = {

    init() {

      onAuthStateChanged(auth, async (user) => {

        let fbUserID = user.uid;

          // initialize savedRounds collection reference
          let savedRoundsRef = collection(db, 'players', fbUserID, 'savedRounds');

          // get the sub-collection referenced above
          let querySavedRounds = await getDocs(savedRoundsRef);

          // this both converts firestore data to an in-house js object
          // and gets rid of any dummy documents generated by firestore
          querySavedRounds.forEach((doc) => {
            if (Object.keys(doc.data()).length > 0) {
              roundsData.push(doc.data());              
            };
          });

          if (roundsData.length == 0) {
            roundHistory.noRounds(roundsData, fbUserID);
          } else {
            roundHistory.massageRoundData(roundsData);
          }; // end if()
      }); // end onAuthStateChanged()
    }, // end init()

    noRounds(roundsData, fbUserID) {

      if (roundsData == null && fbUserID == null) {

        statsEncourage.remove();
        roundsSection.remove();
        chooseSection.remove();

        roundsWarning.innerHTML += `
          <p class="warning">You don't have any rounds saved yet,</p>
          <a href="/pages/roundsetup.html" class="warning-link">Go ahead and start one!  ➤</a>
        `;
      };

    }, // end noRounds()

    massageRoundData(roundsData) {

      //sort by date
      roundsData.sort((a,b) => {
        return new Date(b.roundDate) - new Date(a.roundDate);
      });

      // dedupe so only one courseName appearance in choose section
      if (roundsData.length > 1) {
        deduped = roundsData.filter((obj, index) => {
          return index === roundsData.findIndex(o => obj.courseName === o.courseName)
        });        
      };

      roundHistory.buildChooseCourseSection(deduped);
      roundHistory.buildRoundsList(roundsData, deduped);
      // roundHistory.roundScoresModal(roundsData);
    }, // end massageRoundData()

    buildChooseCourseSection(deduped) {

      chooseSection.innerHTML = ``;

      deduped.forEach((course) => {
        chooseSection.innerHTML += `
        <button class="button" data-course="${course.courseID}">${course.courseName}</button>
        `;
      }); // end forEach()
    }, // end buildChooseCourseSection()

    manageChooseCourseSectionButtons() {

      customElements.define('choose-section', class extends HTMLElement {
        constructor() {
          super();
        };
      
        handleEvent(event) {
          this[`on${event.type}`](event);
        };
      
        connectedCallback() {
          this.addEventListener('click', this);
        };
      
        onclick(event) {
          let courseChoiceClicked = event.target.getAttribute('data-course');

          // show the appropriate dialog
          roundsSectionDialogs.forEach((round) => {
            if (courseChoiceClicked == round.getAttribute('data-courseid')) {
              round.showModal();
            };
          });
        }; // end onclick()
      }); // end customElements.define()
    }, // end manageChooseCourseSectionButtons()

    buildRoundsList(roundsData, deduped) {
      console.log('rounsaData', roundsData);
      console.log('dedepudData', deduped);

      // first create each dialog in the section
      deduped.forEach((course) => {
        roundsSection.innerHTML += `
        <course-component>
          <dialog class="course" data-courseid="${course.courseID}">
            <button class="close">Close</button>
          </dialog>
        </course-component>
        `;
      });

      // then capture each dialog element in the section
      roundsSectionDialogs = document.querySelectorAll('.course');

      // then populate each dialog element for each course
      roundsSectionDialogs.forEach((course) => {

        roundsData.forEach((round) => {
          if (round.courseID === course.dataset.courseid) {

            let dateReadable = new Date(round.roundDate).toLocaleDateString("en-US", dateOptions);

            course.innerHTML += `
            <div class="round" data-roundid="${round.roundID}">
              <div class="round-header">
                <p class="round-header-name">${round.courseName}</p>
                <p class=round-header-date> ${dateReadable}</p>
              </div>
              <p class="round-score"><span>Scored ${round.player.finalScore}</span><br /><br /><span>from</span><br /><br /><span> ${round.player.finalThrows} throws</span></p><p class="round-arrow" data-roundid="${round.roundID}">Details  ➤</p>
            </div>
          `;
          }; // end if
        }); // end roundsData forEach()
      }); // end courseTragets forEach()
      roundHistory.manageRoundsList(roundsData);
    }, // end buildRoundsList()

    manageRoundsList(roundsData) {

      customElements.define('course-component', class extends HTMLElement {
        // 'course-component' is each dialog for a particular course, containing it's multiple rounds to choose from and click "details"
        constructor() {
          super();
        };
      
        handleEvent(event) {
          this[`on${event.type}`](event);
        };
      
        connectedCallback() {
          this.addEventListener('click', this);
        };
      
        onclick(event) {

          if (event.target.closest = '.close') {
            let openCourseDialog = document.querySelector('[open].course');
            openCourseDialog.close();
          };

          // which button in the list of courses was clicked
          let roundIDClicked = event.target.getAttribute('data-roundid');
          console.log(roundIDClicked);

          // search the roundsData for the matching round
          roundsData.forEach((round) => {
            if (roundIDClicked == round.roundID) {
              // this is the dialog with the list of rounds per course
              let openDialog = document.querySelector('[open].course');
              // send the data along
              roundHistory.roundDetail(round);
              // and close the dialog
              openDialog.close();
            };
          }); // end forEach()
        }; // end onclick()
      }); // end customElements.define()
    }, // end manageRoundsList()

    roundDetail(round) {
      console.log(round);

      let holesArray = round.player.courseHoles;
      let dateReadable = new Date(round.roundDate).toLocaleDateString("en-US", dateOptions);

      // build DOM inside modal from data
      roundModalHeader.innerHTML = `<p>${round.courseName}</p> <p>${dateReadable}</p>`;

      holesArray.forEach((hole) => {
        holesSection.innerHTML += `
        <div class="round-modal-hole">
          <p>Hole ${hole.holeNumber}</p>
          <p>Par: ${hole.holePar}</p>
          <p>Hole Throws: ${hole.throwsHole}</p>
          <p>Hole Score: ${hole.overUnderHole == 0
            ? `Par`
            : `${hole.overUnderHole}`
            }
          </p>
          <p>Round Throws: ${hole.throwsRound}</p>
          <p>Round Score: ${hole.overUnderRound == 0
            ? `Par`
            : `${hole.overUnderRound}`
            }
          </p>
        </div>
      `;
      }); // end forEach()

      // show it now that it's been populated
      roundModal.showModal();

      // close button inside round modal
      closeButton.addEventListener('click', () => {
        roundModal.close();
        // clear out the section in case they want to look at another round of the same course
        holesSection.innerHTML = ``;
      });

    }, // end roundDetail()
  };


  roundHistory.init();
  roundHistory.manageChooseCourseSectionButtons();
})();