(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }


  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });
})()



// Consume API
$(document).ready(function(){
  // Uses the fetch() API to request category recipes from TheMealsDB.com API
  fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
  .then(res => res.json())
  .then(res => {
      res.categories.forEach(meal => {
          let listCategory = ''
          listCategory += `
              <div class="col-lg-4 col-md-6 mt-5 catcat shadow-sm">
                <a href="#" class="barcat" onclick="fetchCategoryMeal('${meal.strCategory}')" href="#mealCardsSection">
                  <div class="icon-box row justify-content-center mx-2">
                    <h3 class="judulcat text-center">"${meal.strCategory}"</h3>
                    <img src="${meal.strCategoryThumb}" alt="" class="tumbcat w-auto">
                    <p class="description mt-4 limittext">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${meal.strCategoryDescription}</p>
                  </div>
                </a>
              </div>`;
              NavBarCategory.innerHTML += listCategory;
      });
  })

  // Fetches random recipe
  $('.btnRandomRecipe').on('click', function(){
      fetchMeal('r');

      $('#dynamicTitle').text('The Random Recipe');
  });

  $('.btnSearchRecipe').on('click', function(){
      fetchMeal('u');
  })

  // Fetch content after 3s
  setTimeout(getData(['u', 'r']), 1000);
});

// Get recipe list based on search input
$(document).keypress(function(e) {
  if( e.which == 13 && $.trim($('#searchRecipe').val()) !== '' ) {
      fetchMeal('u');
  }
});

// Show recipe of clicked meal
$(document).on('click','.mealCardRecipeBtn',function(){
  let meal = $(this).data('meal');
  if(meal.strCategory === undefined){
      fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+meal.idMeal)
      .then( res => res.json() )
      .then( res => {
          meal = res.meals[0];
          window.scrollTo(0,$('#random').offset().top);
          createMeal(meal,'r');
          // Textual updates
          $('#dynamicTitle').text(meal.strMeal);
      })
  } else {
      window.scrollTo(0,$('#random').offset().top);
      createMeal(meal,'r');
      // Textual updates
      $('#dynamicTitle').text(meal.strMeal);
  }
});

// Clear search box on button press
$(document).on('click','.clear-field',function(){
  document.getElementById('searchRecipe').value = '';
});

// Uses the fetch() API to request random meal recipe from TheMealsDB.com API
function fetchMeal(type){
  let url = '';
  if ( type === 'r') { url = 'https://www.themealdb.com/api/json/v1/1/random.php'; }

  if ( type === 'r' ) {
      fetch(url)
      .then( res => res.json() )
      .then( res => {
          createMeal(res.meals[0], type);
          setCache(res.meals[0], type);
      })
      .catch( e => console.warn(e) );
  } else {
      fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+$.trim($('#searchRecipe').val()))
      .then( res => res.json() )
      .then( res => {
          let user_search_term = $.trim($('#searchRecipe').val());
          if (res.meals) {
              $("#errorMessageContainer").remove();
              createMealCards(res.meals);           
              window.scrollTo(0,$('#mealCardsSection').offset().top);
              $('#userInput').text(user_search_term);
              setCache(res.meals, type);
          } else {
              $("#errorMessageContainer").remove();
              $("#mealCardsSection .container").hide();
              $("#mealCardsSection").prepend("<section id='random' class='d-flex flex-column'><h1 class='text-center'>The recipe could not be found.</h1><div class='d-flex mw-100 justify-content-center'><img src='assets/img/sticker.png' class='w-25' alt=''></div><div id='errorMessageContainer' class='d-flex flex-column align-items-center'><p id='errorMessageText'>No recipes match the search term '" + user_search_term + "'</p> <a id='errorMessageBtn' class='button searchagain' href='#hero' title='Search again' >Search again</a> </div>")
              $("#random .container").hide();
          }   
      })
      .catch( e => console.warn(e) );
  }
}

// remove error message
$(document).on('click','#errorMessageBtn',function(){
  $("#errorMessageContainer").remove();
});

// Function to save the data in the cache
const setCache = (meal, type) => {
  let mealJson = JSON.stringify(meal);
  if( type === 'u' ){
      sessionStorage.setItem("search", $.trim($('#searchRecipe').val()));
      sessionStorage.setItem(type, mealJson);
  } else setCookie(type, mealJson);

}

// Function to set the cookie
const setCookie = (key, value, exDays = 3) => {
  let date = new Date();
  date.setTime(date.getTime() + exDays*24*60*60*1000);
  document.cookie = key + "=" + value + "; expires=" + date.toUTCString() + ";path=/";
}

// Function to get cookie
const getCookie = (key) => {
  key = key + "=";
  var cookies = document.cookie.split(';');
  for(var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    while (cookie.charAt(0) == ' ') cookie = cookie.substring(1);
    if (cookie.indexOf(key) == 0) { return cookie.substring(key.length, cookie.length) };
  }
  return null;
}

// Function to get cache data if it exists, otherwise, fetch from the API
const getData = (types) => {
  types.forEach(type => {
      if( type === "u" ) {
          let mealData = JSON.parse(sessionStorage.getItem(type));
          if( mealData !== null ) {
              createMealCards(mealData);      
              window.scrollTo(0,$('#hero').offset().top);
              $('#userInput').text(sessionStorage.getItem("search"));
          }
      }
      else {
          let mealData = null;
          try {
              mealData = JSON.parse(getCookie(type));
          } catch (error) { console.warn(error) };
          mealData !== null ? createMeal(mealData, type) : fetchMeal(type);
      }
  })
}

function fetchCategoryMeal(category){
  fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + category)
      .then(res => res.json())
      .then(res => {
          createMealCards(res.meals);
          window.scrollTo(0, $('#mealCardsSection').offset().top);
      })
  .catch(e => console.warn(e));
  $('#userInput').text(category);
}

// Function to generate the random meal UI component

const createMeal = (meal,type) => {
  // Set meal thumbnail
  setMealThumbnail(meal,type);

  let mealMetadata = '';
 
    mealMetadata = `
    <h1 class="text-center">"${meal.strMeal}"</h1>
    <div class="tagslist row d-inline">
        <ul class="d-flex justify-content-center">`
        if (meal.strTags == null){
          mealMetadata += `<li class="d-inline me-2 listtag">No tag</li>`
        }

        else if ( meal.strTags ) {
          (meal.strTags).split(',').forEach((element)=>{
            mealMetadata += `<li class="d-inline me-2 listtag">${element}</li>`
          });
        }
        `</ul>
    </div>
    `

  let jsisian = '';

  jsisian =`
  <span><b>Area</b>: "<p>${meal.strArea}</p>"</span>
  <span><b>Category</b>: "<p>${meal.strCategory}</p>"</span>
  `
 
  // if ( meal.strCategory ) {
  //     mealMetadata += `<span>Category:</span> ${meal.strCategory} <br/>`
  // }
  
  // Fill ingredients
  let ingredients = [];
  setIngredients(meal, ingredients);
  if ( ingredients.length > 0 ) {
      jsisian +=`<span><b>Ingredients:</b><br/> <ul></span>${ingredients.join('')}</ul>`
  }

  // Set instructions
  if ( meal.strInstructions ) {
      jsisian +=`<span><b>Instructions:</b></span> <br/> ${meal.strInstructions}`
  }

  //   // Set YouTube link
  //   if ( meal.strYoutube ) {
  //     jsisian +=`<span>YouTube:</span> <a href='${meal.strYoutube}' target="_blank" title="Watch how to cook ${meal.strMeal}">${meal.strYoutube}</a><br/>`
  // }

  //  // Set Source link
  //  if ( meal.strSource ) {
  //     jsisian +=`<span>Source:</span> <a href='${meal.strSource}' target="_blank" title="Watch how to cook ${meal.strMeal}">${meal.strSource}</a><br/>`
  // }

  let tomboldetail = '';

  tomboldetail =`
  <a href="${meal.strYoutube}"><i class="bi bi-youtube"><h1>Youtube</h1></i></a>
  <a href="${meal.strSource}"><i class="bi bi-globe2"><h1>Source</h1></i></a> 
  `
  
  if ( type === 'r') { 
      $('#randomMealMetadata').html(mealMetadata); 
      $('#isian').html(jsisian);
      $('#tombollink').html(tomboldetail);
      // $('#idintruksi').html(mealInstr);
      // $('#randomMealInstructions').html(mealInstr); 
  }
}

const setMealThumbnail = (meal,type) => {
  let imgSrc = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}" title="${meal.strMeal}" class="img-fluid rounded"/>`;
  if ( type === 'r') { $('#randomMealImg').html(imgSrc); }
}

const setIngredients = (meal,ingredients) => {   
  for(let i = 1; i <= 20; i++){
      if(meal[`strIngredient${i}`]){
          ingredients.push(
              `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`
          );
      } 
      // else { break; }
      // if ( i % 2 === 0 ) { ingredients.push('<br/>'); }
  }
}

const createMealCards = meals => {
  let mealCards = '';

  meals.forEach(meal => {
      mealData = JSON.stringify(meal);
      mealData = mealData.replace(/(['])/g, "&rsquo;");
      mealCards += 
      `<div class="four columns col-lg-3 col-md-3 mt-5 catcat shadow-sm rounded-3 card">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" title="${meal.strMeal}" class="u-max-full-width" />
          <div class="card-body icon-box row justify-content-center mx-2"">
              <div class="cardTitle text-center limittext2">${meal.strMeal}</div>
              <button class="button mealCardRecipeBtn" data-meal='${mealData}'>Recipe</button>
              </div>
      </div>`;
  });
  $('.mealCards').html(mealCards);
  $('#mealCardsSection .container').show();
}