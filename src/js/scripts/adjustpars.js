import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fbConfigStuff } from './config.js';

// firebase shit
let fbConfig = fbConfigStuff();
let app = initializeApp(fbConfig);
let db = getFirestore(app);
let auth = getAuth();

// grab DOM elements
let holesContainer = document.querySelector('.items');
let submitButton = document.querySelector('.submit');
let successDialog = document.querySelector('.success');

(() => {
  'use strict';

  let adjustPars = {

    init() {
      //get course object
      async function getCourseObject() {
        let storedCourse = await sessionStorage.getItem('course');
        let newCourse = JSON.parse(storedCourse);
        return newCourse;
      };
      // send it along
      getCourseObject().then(courseObject => {
          adjustPars.buildDOMList(courseObject);
        });
    }, //end init()

    buildDOMList(courseObject) {

      // for the header
      document.querySelector('.name').innerText = `${courseObject.courseName}`;

      // create to webcomponents for each hole
      courseObject.courseHoles.forEach((hole,index) => {

        holesContainer.innerHTML += `
        <hole-card class="item">
          <p class="item-hole" data-index="${index}">Hole: ${hole.holeNumber}</p>
          <p class="item-par">Par: <span data-par="par">${hole.holePar}</span></p>
          <p class="item-advice">Adjust Par:</p>
          <button class="item-increase" data-model="increasePar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 217.9L383 345c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.3-24.6 0-34L273 167c-9.1-9.1-23.7-9.3-33.1-.7L95 310.9c-4.7 4.7-7 10.9-7 17s2.3 12.3 7 17c9.4 9.4 24.6 9.4 33.9 0l127.1-127z"/></svg>
          </button>
          <button class="item-decrease" data-model="decreasePar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"/></svg>
          </button>
        </hole-card>
        ` // end template literal
      });

      // send it along
      adjustPars.dataBinding(courseObject)
    }, // end buildDOMList

    dataBinding(courseObject) {

      customElements.define('hole-card', class extends HTMLElement {
        constructor() {
          super();
        }; // end constructor()

        handleEvent(event) {
          this[`on${event.type}`](event);
        }; // end handleEvent()

        connectedCallback() {
          this.addEventListener('click', this);
        };

        // this is the on${event.type} registered above
        onclick(event) {
          let whichButton = event.target.closest('button').getAttribute('data-model');

          let parDisplay = this.querySelector('[data-par]');
          let holeIndex = this.querySelector('.item-hole').getAttribute('data-index');

          let newUpPar, newDownPar;

          switch (whichButton) {
            case 'increasePar':
              parDisplay.innerText++;
              newUpPar = parseFloat(parDisplay.innerText);
              updateCourseObject(holeIndex, newUpPar);
            break;
            case 'decreasePar':
              parDisplay.innerText--;
              newDownPar = parseFloat(parDisplay.innerText);
              updateCourseObject(holeIndex, newDownPar);
            break;
          
            default:
              break;
          }; // end switch()

          // update courseObject
          function updateCourseObject(i, newPar) {
            courseObject.courseHoles[i]['holePar'] = newPar;
          };

          // send it down
          initiateStorage(courseObject);

          function initiateStorage(courseObject) {
            submitButton.addEventListener('click', () => {
              adjustPars.storage(courseObject);
            });
          };
        }; // end onclick()
      }); // end customElements
    }, // end dataBinding()

    storage(newCourseData) {
      console.log(newCourseData);

      // send to firestore
      onAuthStateChanged(auth, async (user) => {
        let fbUserID = user.uid;

        // add document to courseList sub-collection in firestore
        await setDoc(doc(db, 'players', fbUserID, 'courseList', newCourseData.courseID), newCourseData);
      });

      // UI happiness
      successDialog.showModal();

      // clean out, no longer needed
      sessionStorage.removeItem('course');

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } // end storage()
  };
  adjustPars.init();
})();