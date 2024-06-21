import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { fbConfigStuff } from './config.js';

// initialize firebase shit
let fbConfig = fbConfigStuff();
let app = initializeApp(fbConfig);
let auth = getAuth();

// get logout item
let logoutNavItem = document.querySelector('#nav-logout');

logoutNavItem.addEventListener('click', (event) => {
  signOut(auth).then(() => {
    // Sign-out successful.
    console.log('successful signout');
  }).catch((error) => {
    // An error happened.
  });
});