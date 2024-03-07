// script is loaded with product-reviews.liquid block
// it is responsible for dynamically creating new review form
(function () {
  console.log("Bui Duc Long From Hamsa");

  const stars = document.querySelectorAll(".rate i");

  // add event listener to each star
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      // print data-value of the star
      console.log("Clicked star", star.dataset.value);
    });
  });
})();
