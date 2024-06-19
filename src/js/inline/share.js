(() => {
  'use strict';

  const homeShareButton = document.querySelector(".share");
  
  const pageTitle = document.title;
  const pageURL = document.querySelector("link[rel=canonical]");


  if (navigator.share) {
    homeShareButton.classList.add('share-phone');
    homeShareButton.addEventListener('click', () =>
      navigator.share({
        title: pageTitle,
        url: pageURL.href
      })
    );
  };
})();