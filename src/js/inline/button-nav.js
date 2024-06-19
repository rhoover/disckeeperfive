	(() => {
    'use strict';

    let close = document.querySelector('.nav-close');
    let menuButton = document.querySelector('.menu-button');
    let menuText = document.querySelector('.menu-button-text');
    let menuButtonWrap = document.querySelector('.menu-toggle');
    let navMenu = document.querySelector('.nav');
    let main = document.querySelector('.main');

    menuButton.onclick=function(){
      navMenu.classList.toggle('nav-open');

      menuButtonWrap.classList.toggle('opened');
      
      menuText.classList.toggle('menu-button-text-red');

      if (menuText.innerHTML === 'Menu') {
        menuText.innerHTML = 'Close'
      } else {
        menuText.innerHTML = 'Menu'}

    };
    
    close.onclick = function() {
      navMenu.classList.toggle('nav-open');
    
      menuButtonWrap.classList.toggle('opened');
      
      menuText.classList.toggle('menu-button-text-red');
    
      if (menuText.innerHTML === 'Menu') {
        menuText.innerHTML = 'Close'
      } else {
        menuText.innerHTML = 'Menu'
      };
      
    };

  })();