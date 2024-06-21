import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore"; //
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { fbConfigStuff } from './config.js';

// initialize firebase shit
let fbConfig = fbConfigStuff();
let app = initializeApp(fbConfig);
let db = getFirestore(app);
let auth = getAuth();

// grab DOM elements
let creds = document.querySelector('.creds');
let signUpModal = document.querySelector('[data-modal="signup"]');
let loginModal = document.querySelector('[data-modal="login"]');
let loginSubmit = document.querySelector('[data-button="login-submit"]');
let signupSubmit = document.querySelector('[data-button="signup-submit"]');
let passwordToggle = document.querySelectorAll('.password-show');
let frontLinks = document.querySelectorAll('.links');

// assign falsey
let fbUserID = '';

onAuthStateChanged(auth, (user) => {
  if (user) {
  // signOut(auth);
    fbUserID = user.uid;
    console.log('logged in user is:', fbUserID);
    if (fbUserID) {
      creds.innerHTML = `<p>Looks Like You're Logged In, Have A Great Round!</p>`;
      frontLinks.forEach(link => {
        link.classList.add('links-active');
      });
    };
  };
});

// which top button did you click
creds.addEventListener('click', (event) => {
  let buttonTarget = event.target.closest('.creds-button');
  let whichButton = buttonTarget.getAttribute('data-button');
  switch (whichButton) {
    case 'signup':
      // obvs
      signUpModal.showModal();
      // send to appropriate modal to be handled
      handleOpenModal(document.querySelector('[open]'));
    break;
    case 'login':
      // obvs
      loginModal.showModal();
      // send to appropriate modal to be handled
      handleOpenModal(document.querySelector('[open]'))
    break;
    default:
    break;
  };
});

// which dialog modal are you using
let handleOpenModal = (openModal) => {
    switch (openModal.getAttribute('data-modal')) {
      case "signup":
        let signupForm = openModal.querySelector('.modal-form');
        signupPrimary(signupForm, openModal);
      break;
      case "login":
        let loginForm = openModal.querySelector('.modal-form');
        loginPrimary(loginForm, openModal);
      break;
      default:
      break;
    }
};

// password show/hide toggle
// forEach because it's on two modal dialogs
passwordToggle.forEach(eye => {
  eye.addEventListener('click', (event) => {
    // clicking on svg bubbles up to parent, i.e. label
    let parentLabel = event.target.closest('label');  
    // password input element
    let siblingInput = parentLabel.querySelector('[required]');
    // toggle
    if (siblingInput.type == "password") {
      siblingInput.type = "text";
    } else {
      siblingInput.type = "password";
    };
  });
});

// all signup-dialog steps in one function
let signupPrimary = (form, openModal) => {
  signupSubmit.addEventListener('click', (event) => {
    event.preventDefault();

    let signupNameFirst = form.querySelector('#signup-name-first').value;
    let signupNameLast = form.querySelector('#signup-name-last').value;
    let signupemail = form.querySelector('#signup-email').value;
    let signuppassword = form.querySelector('#signup-password').value;

    let success = openModal.querySelector('[data-success="signup"]');

    let newPlayerID = Math.random().toString(36).substring(2,11);
    newPlayerID.toString();

    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    if (!emailRegex.test(signupemail)) {
      success.innerHTML = '<p class="failure" data-success="signup">INVALID EMAIL ADDRESS. Please fix to continue.</p>'
    };

    signupSubmit.innerText = 'SUCCESS! In 2...3...';

    // create auth stuff
    createUserWithEmailAndPassword(auth, signupemail, signuppassword)
    .then(() => {
      createNewDocument(fbUserID);
    })
    .catch((error) => {
      setTimeout(() => {
        openModal.close();
        success.innerHTML = '<p data-success="signup">Please KNOW, this info is NOT being Shared With ANY Third Party!</p>';
        creds.querySelector('p').innerText = `You Are Already Signed Up, Now Log In!`;
        form.reset();
      },750);
    });

    // create new db document
    let createNewDocument = (fbUserID) => {
      // add main document
      setDoc(doc(db, 'players', fbUserID), {
        nameFirst: signupNameFirst,
        nameLast: signupNameLast,
        playerID: newPlayerID,
        playerCreated: new Date().toLocaleDateString('en-US'),
        primary: true
        }); // end setDoc

        // add sub-collections to main player document
        let courseListRef = collection(db, 'players', fbUserID, 'courseList');
        let playerListRef = collection(db, 'players', fbUserID, 'playerList');
        let savedRoundsRef = collection(db, 'players', fbUserID, 'savedRounds');
        let course = {};
        let player = {};
        let savedRound = {};
        addDoc(courseListRef, course);
        addDoc(playerListRef, player);
        addDoc(savedRoundsRef, savedRound);

        setTimeout(() => {
          openModal.close();
          success.innerHTML = '<p data-success="signup">Please KNOW, this info is NOT being Shared With ANY Third Party!</p>';
          creds.innerHTML = `<p>Success! You've Logged In As Well, Have A Great Round!</p>`;
          form.reset();
        },750);
      
    }; // end createNewDocument

    frontLinks.forEach(link => {
      link.classList.add('links-active');
    });
  }); // end addEventListener
}; // end signupPrimary

// login-dialog steps
let loginPrimary = (form, openModal) => {
  loginSubmit.addEventListener('click', (event) => {
    event.preventDefault();

    let loginemail = form.querySelector('#login-email').value;
    let loginpassword = form.querySelector('#login-password').value;

    loginSubmit.innerText = 'SUCCESS! In 2...3...'; 

    signInWithEmailAndPassword(auth, loginemail, loginpassword)
    .then((userCredential) => {
      let player = userCredential.user;
    });

    frontLinks.forEach(link => {
      link.classList.add('links-active');
    });

    setTimeout(() => {
      openModal.close();
      creds.innerHTML = `<p>Success! You've Logged In, Have A Great Round!</p>`;
      form.reset();
    },750);
  });
};

