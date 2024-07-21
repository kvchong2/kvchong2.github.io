const CAUSES = [
  ["All causes", "All causes"],
  ["Alzheimer's disease", "Alzheimer's disease"],
  ["Cancer", "Cancer"],
  ["CLRD", "Chronic lower respiratory diseases"],
  ["Diabetes", "Diabetes"],
  ["Heart disease", "Heart disease"],
  ["Influenza and pneumonia", "Influenza and pneumonia"],
  ["Kidney disease", "Kidney disease"],
  ["Stroke", "Stroke"],
  ["Suicide", "Suicide"],
  ["Unintentional injuries", "Unintentional injuries"],
];

const PAGE_PADDING = {top:20, left:40, right:40, bottom:20};

const STATES = [
  "United States",
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const CAUSE_COLOR = d3.scaleOrdinal(d3.schemeCategory10).domain(CAUSES.map(d => d[0]));
//const STATE_COLOR = d3.scaleOrdinal(d3.schemePaired).domain(STATES);
const STATE_COLOR = d3.scaleOrdinal(d3.schemeTableau10).domain(STATES);
//const CUSTOM_SCHEME = [];
//for (let i = 0; i < 51; i++) {
//  CUSTOM_SCHEME.push(d3.scaleSequential(t => d3.hsl(t/50.0 * 360, 1, 0.5).toString())(i));
//}
//const STATE_COLOR = d3.scaleOrdinal(CUSTOM_SCHEME).domain(STATES);
//console.log(CUSTOM_SCHEME);
