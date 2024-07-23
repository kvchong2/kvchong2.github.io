function app() {

//
// Load our data and then build the slides
//
const datafile = "data/NCHS_-_Leading_Causes_of_Death__United_States.csv";
d3.csv(datafile).then((d) => {
  data = d.map(d => {
    return {
      year: Number(d.Year),
      cause: d["Cause Name"],
      state: d.State,
      deaths: Number(d.Deaths),
      deaths_adjusted: Number(d["Age-adjusted Death Rate"])
    };
  }).sort((a,b) => a.year - b.year);
  buildSlides(data);
//  // Also update if the window size changes
//  window.addEventListener("resize", function() {
//    update(data);
//    console.log(window.innerHeight, window.innerWidth);
//  });

  startScroll();
});

function buildSlides(data) {
  chart_rates("chart-national-trends", data, ["United States"], ["All causes"], [
    {
      note: {label:"Death rates decreased from 875.6 per 100,000 in 1999 to 731.9 per 100,000 in 2017."},
      connector: { end: "arrow" },
      x: 2006, y: 800, dx: 100, dy: -80,
      type: d3.annotationLabel,
    },
  ]);
  chart_rates('chart-decreasing', data, ["United States"], ["Cancer", "Heart disease"], [
    {
      note: {label:"Deaths from heart disease has declining the most from 266.5 per 100,000 in 1999 to 165 per 100,000 in 2017."},
      connector: { end: "arrow" },
      x: 2006, y: 210, dx: 50, dy: -50,
      type: d3.annotationLabel,
    },
    {
      note: {label:"Deaths from cancer has been steadily declining."},
      connector: { end: "arrow" },
      x: 2003, y: 185, dx: -40, dy: 40,
      type: d3.annotationLabel,
    },
  ]);
  chart_rates('chart-cardio', data, ["United States"], ["Diabetes", "Heart disease", "Stroke"], [
    {
      note: {label:"Deaths from heart disease declined the most, but deaths from stroke and diabetes also displayed a decline."},
      x: 2004, y: 160, dx: 0, dy: 0,
      type: d3.annotationLabel,
    },
  ]);
  chart_rates('chart-increasing', data, ["United States"], ["Alzheimer's disease", "Suicide", "Unintentional injuries"], [
    {
      note: {label:"Deaths from unintentional injuries, Alzheimer's disease, and suicide has been increasing."},
      x: 2004, y: 35, dx: 0, dy: 0,
      type: d3.annotationLabel,
    },
  ]);
  chart_rates('chart-states', data, [
    "Mississippi", "West Virginia", "Alabama", "Kentucky", "Oklahoma",
    "Hawaii", "California", "New York", "Connecticut", "Minnesota"
  ], ["All causes"], [
    {
      note: { label: "States with higher death rates" },
      connector: { end: "arrow" },
      x: 2014, y: 920, dx: -100, dy: 100,
      type: d3.annotationCalloutCircle,
      subject: { radius: 80, radiusPadding: 10 },
      className: "medium"
    },
    {
      note: { label: "States with lower death rates" },
      connector: { end: "arrow" },
      x: 2014, y: 620, dx: -100, dy: -100,
      type: d3.annotationCalloutCircle,
      subject: { radius: 80, radiusPadding: 10 },
      className: "medium"
    }
  ]);
  chart_rates('chart-explore', data);
}

//
// Handle the scrolling between the slides
//
function startScroll() {
  const container = document.querySelector(".scroll-container");
  const sections = document.getElementsByTagName("section");

  let currentScreen = 0;

  // Build dots navigation based on number of <section> tags
  const pagination = document.createElement("div");
  pagination.classList.add("pagination");

  const ul = document.createElement("ul");
  pagination.appendChild(ul);
  ul.classList.add("pagination");
  for (let i = 0; i < sections.length; i++) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", `#${i}`);
    li.appendChild(a);
    ul.appendChild(li);
  }
//  document.body.appendChild(ul);
  document.body.appendChild(pagination);

  // Add page up/down buttons
  const pgup = document.createElement("a");
  pgup.classList.add("pagebutton");
  pgup.classList.add("up");
  pgup.innerHTML = `<span class="arrowup"/>`;
  pgup.onclick = function() {
    location.hash = --currentScreen;
    removeEvents();
    setTimeout(addEvents, 500);
  };
  document.body.appendChild(pgup);

  const pgdown = document.createElement("a");
  pgdown.classList.add("pagebutton");
  pgdown.classList.add("down");
  pgdown.innerHTML = `<span class="arrowdown"/>`;
  pgdown.onclick = function() {
    location.hash = ++currentScreen;
    removeEvents();
    setTimeout(addEvents, 500);
  };
  document.body.appendChild(pgdown);

  // Add events
  function addEvents() {
    document.addEventListener("mousewheel", handleInput, false);
    document.addEventListener("wheel", handleInput, false);
    document.addEventListener("keyup", handleInput, false);
  }
  addEvents();

  // Remove events
  function removeEvents() {
    document.removeEventListener("mousewheel", handleInput, false);
    document.removeEventListener("wheel", handleInput, false);
    document.removeEventListener("keyup", handleInput, false);
  }

  // Mouse wheel and key events
  function handleInput(event) {
    if (event.target.tagName !== "SELECT" && event.target.tagName !== "OPTION") {
      if (event.deltaY > 0 || event.keyCode === 40 /* down */ || event.keyCode === 39 /* right */ || event.keyCode === 34 /* pgdown */) {
        location.hash = ++currentScreen;
      } else if (event.deltaY < 0 || event.keyCode === 38 /* up */ || event.keyCode === 37 /* left */ || event.keyCode === 33 /* pgup */) {
        location.hash = --currentScreen;
      }
      // Temp. remove events to wait for animation to finish before adding back
      removeEvents();
      setTimeout(addEvents, 500);
    }
  }

  // Whenever the hash changes, scroll to the screen number in the hash
  window.addEventListener("hashchange", handleHashChange);
  function handleHashChange() {
    if (location) {
      const anchor = Number(location.hash.replace("#", "").split("/")[0]);
      if (anchor < 0) {
        currentScreen = 0;
      } else if (anchor > sections.length - 1) {
        currentScreen = sections.length - 1;
      } else {
        currentScreen = anchor;
      }
      if (currentScreen <= 0) {
        pgup.classList.add("hidden");
      } else {
        pgup.classList.remove("hidden");
      }
      if (currentScreen >= sections.length - 1) {
        pgdown.classList.add("hidden");
      } else {
        pgdown.classList.remove("hidden");
      }
      location.hash = currentScreen;
    }

    // Animate the scrolling between screens
    const animateTime = 0.7;
    const animateFunction = "ease";
    const position = currentScreen * 100;

    container.style.transform = `translateY(-${position}vh)`;
    container.style.transition = `all ${animateTime}s ${animateFunction}`;

    // Mark the appropriate screen dot as active
    for (let i = 0; i < ul.childNodes.length; i++) {
      if (i === currentScreen) {
        ul.childNodes[i].classList.add("active");
      } else {
        ul.childNodes[i].classList.remove("active");
      }
    }
  }
  handleHashChange();
}

}

document.addEventListener("DOMContentLoaded", app);
