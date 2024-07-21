function chart_rates(chart, data, states=["United States"], causes=["All causes"], specialAnnotations=null) {

const view = document.querySelector(`.${chart} .chart-container`);

const controls = view.querySelector(`.controls`);
const left_padding = 70;
const right_padding = 150;
const top_padding = 30;
const bottom_padding = 80;
const width = view.offsetWidth - left_padding - right_padding - (controls ? controls.offsetWidth : 0);
const height = view.offsetHeight - top_padding - bottom_padding;// - (controls ? controls.offsetHeight : 0);

const svg = d3.select(`.${chart} .chart`).append("svg")
  .attr("class", "canvas")
  .attr("width", width + left_padding + right_padding)
  .attr("height", height + top_padding + bottom_padding)
;
const container = svg.append("g").attr("class", "container");
container.append("g").attr("class", "xaxis");
container.append("g").attr("class", "yaxis");
container.append("g").attr("class", "annotations")
  .attr("transform", `translate(${left_padding},${top_padding})`);
container.append("g").attr("class", "chart");

// X-axis label
container.append("text")
  .attr("class", "xlabel")
  .attr("transform", `translate(0,${height / 2 + top_padding}) rotate(-90)`)
  .style("text-anchor", "middle")
  .style("font-family", "sans-serif")
  .style("font-size", ".8em")
  .text("Age-adjusted Deaths per 100,000")
;

// For tooltips
const tooltip = d3.select(`.${chart} .chart`)
  .append("div").attr("class", "tooltip")
;

//
// Controls
//

// Make state selector
let selected_states = states;
let selected_causes = causes;
const states_el = view.querySelector(`select[name=states]`);
if (states_el) {
  states_el.onchange = function(e) {
    selected_states = [];
    for (const option of states_el.options) {
      if (option.selected) {
        selected_states.push(option.value);
      }
    }
    update(data, selected_states, selected_causes, specialAnnotations);
  }
  for (const option of states_el.options) {
    option.selected = states.indexOf(option.value) > -1;
  }
}

// Make causes selector
const causes_el = view.querySelector(`select[name=causes]`);
if (causes_el) {
  causes_el.onchange = function(e) {
    selected_causes = [];
    for (const option of causes_el.options) {
      if (option.selected) {
        selected_causes.push(option.value);
      }
    }
    update(data, selected_states, selected_causes, specialAnnotations);
  }
  for (const option of causes_el.options) {
    option.selected = causes.indexOf(option.value) > -1;
  }
}

// Deaths / age-adjusted deaths
let death_type = "deaths_adjusted";
if (view.querySelector(`.controls`)) {
  const death_type_els = view.querySelectorAll(`input[type=radio]`);
  for (let i = 0; i < death_type_els.length; i++) {
    death_type_els[i].onchange = function(e) {
      death_type = e.target.value;
      update(data, selected_states, selected_causes, specialAnnotations);
    };
  }
}

const transition_time = 1000;
const transition_pause = 0;

update(data, states, causes, specialAnnotations);

function update(data, states=["United States"], causes=["All causes"], specialAnnotations=null) {
  // The filtered data we want to display
  const filtered_data = data.filter(d=>states.indexOf(d.state)>-1 && causes.indexOf(d.cause)>-1);
  // Min/max for the number for the x-axis
  const min_year = filtered_data.reduce((accum,d)=>d.year<=accum?d.year:accum, 10000);
  const max_year = filtered_data.reduce((accum,d)=>d.year>accum?d.year:accum, 0);
  // Min/max for the number for the y-axis
  const min_deaths = filtered_data.reduce((accum,d)=>d[death_type]<=accum?d[death_type]:accum, 10000000);
  const max_deaths = filtered_data.reduce((accum,d)=>d[death_type]>accum?d[death_type]:accum, 0);

  container.attr("transform", `translate(40,${top_padding})`);

  container.select(".xlabel")
    .text(d => death_type === "deaths" ? "Total Deaths" : "Age-adjusted Deaths per 100,000")

  //
  // x-axis (year)
  //
  const x_axis = d3.scaleLinear()
    .range([0, width])
    .domain([min_year, max_year])
  ;
  container.select("g.xaxis")
    .attr("transform", `translate(${left_padding},${height+top_padding})`)
    .transition().duration(transition_time) //.ease(d3.easeLinear)
    .call(d3.axisBottom(x_axis).ticks(max_year - min_year, "d"))
    .selectAll("text")
      .attr("transform", "translate(-10,0) rotate(-45)")
      .style("text-anchor", "end")
  ;

  //
  // y-axis (deaths)
  //
  const y_axis = d3.scaleLinear()
    .range([height, 0])
    .domain([min_deaths, max_deaths])
  ;
  container.select("g.yaxis")
    .attr("transform", `translate(${left_padding},${top_padding})`)
    .transition().duration(transition_time) //.ease(d3.easeLinear)
    .call(d3.axisLeft(y_axis))
  ;

  //
  // Chart
  //
  const selected_data = filtered_data.filter(d => states.indexOf(d.state) > -1 && causes.indexOf(d.cause) > -1);

  // Annotations to indicate the cause
  let annotations = [];
  for (const state of states) {
    for (const cause of causes) {
      const path = selected_data.filter(d => d.state === state && d.cause === cause);
      const last_point = path[path.length - 1];
      const label = [];
      if (states.length > 1) {
        label.push(last_point.state);
      }
      if (causes.length > 1) {
        label.push(last_point.cause);
      }
      if (label.length > 0) {
        annotations.push({
          note: { label: label.join(" - ")},
          connector: { end: "arrow" },
          type: d3.annotationLabel,
          x: x_axis(last_point.year) + 8,
          y: y_axis(last_point[death_type]),
          dx: 40,
          dy: -10,
          className: "small",
        });
      }
    }
  }
  // Spread out the annotations
  const totalAnnotations = states.length * causes.length;
  if (totalAnnotations > 1) {
    annotations.sort((a,b) => b.y - a.y);
    for (let i = 0; i < totalAnnotations; i++) {
      annotations[i].dy = height - ((i+1) * height / totalAnnotations + annotations[i].y) + height / totalAnnotations / 2;
    }
  }
  // Add in the special annotations
  if (specialAnnotations) {
    for (const annotation of specialAnnotations) {
      annotation.x = x_axis(annotation.x);
      annotation.y = y_axis(annotation.y);
      annotations.push(annotation);
    }
  }
  // Add annotation to the chart
  const makeAnnotations = d3.annotation()
    .annotations(annotations)
  ;
  d3.select(`.${chart} g.annotations`)
      .call(makeAnnotations)
  ;

  // Create lines between the points
  const lines = [];
  for (const state of states) {
    for (const cause of causes) {
      // Make path for a cause
      const path = selected_data.filter(d => d.state === state && d.cause === cause);
      const prev_point = {
        x: x_axis(path[0].year),
        y: y_axis(path[0][death_type]),
      };
      const path_lines = [];
      for (let i = 1; i < path.length; i++) {
        const x = x_axis(path[i].year);
        const y = y_axis(path[i][death_type]);
        lines.push({
          x1: prev_point.x,
          y1: prev_point.y,
          x2: x,
          y2: y,
          color: states.length > 1 ? STATE_COLOR(path[i].state) : CAUSE_COLOR(path[i].cause),
        });
        prev_point.x = x;
        prev_point.y = y;
      }
    }
  }

  // Add the lines between the points
  const join_lines = container.select("g.chart")
    .attr("transform", `translate(${left_padding},${top_padding})`)
    .selectAll("path")
    .data(lines)
  ;
  // Create the line
  join_lines.enter()
    .append("path")
      .attr("class", d => `path path-${causes.indexOf(d.cause) + 1}`)
      .attr("stroke", d => d.color)
      .attr("d", d => `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`)
  ;
  // Update the line
  join_lines
    .transition().duration(500)
    .attr("stroke", d => d.color)
    .attr("d", d => `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`)
  ;
  // Remove the line
  join_lines.exit().remove();

  // Add the point
  const join_point = container.select("g.chart")
    .attr("transform", `translate(${left_padding},${top_padding})`)
    .selectAll("circle.point")
    .data(selected_data)
  ;
  // Create the point
  join_point.enter()
    .append("circle")
      .attr("class", d => `point point-${causes.indexOf(d.cause) + 1}`)
      .attr("cx", d => x_axis(d.year))
      .attr("cy", d => y_axis(d[death_type]))
      .attr("fill", d => states.length > 1 ? STATE_COLOR(d.state) : CAUSE_COLOR(d.cause))
      .attr("r", 4)
  ;
  // Update the point
  join_point
    .transition().duration(500)
    .attr("cx", d => x_axis(d.year))
    .attr("cy", d => y_axis(d[death_type]))
    .attr("fill", d => states.length > 1 ? STATE_COLOR(d.state) : CAUSE_COLOR(d.cause))
  ;
  // Remove the point
  join_point.exit().remove();

  // Add larger area over the point for hover
  const join_hover = container.select("g.chart")
    .attr("transform", `translate(${left_padding},${top_padding})`)
    .selectAll("circle.hover")
    .data(selected_data)
  ;
  // Create hover area
  join_hover.enter()
    .append("circle")
      .attr("class", d => `hover hover-${causes.indexOf(d.cause) + 1}`)
      .attr("cx", d => x_axis(d.year))
      .attr("cy", d => y_axis(d[death_type]))
      .attr("fill", "transparent")
      .attr("r", 10)
      .attr("cursor", "pointer")
      .on("mouseover", (e)=>tooltip.style("visibility", "visible"))
      .on("mouseout", (e)=>tooltip.style("visibility", "hidden"))
      .on("mousemove", (e,d)=>tooltip
        .html(`
          <p><strong>${d.state}</strong></p>
          <p><strong>Cause:</strong> ${d.cause}</p>
          <p><strong>Year:</strong> ${d.year}</p>
          <p><strong>Age-adjusted deaths:</strong> ${d[death_type].toLocaleString()} (per 100,000)</p>
          <p><strong>Total deaths:</strong> ${d.deaths.toLocaleString()}</p>
        `)
        .style("top", (e.pageY - 200)+"px")
        .style("left", e.pageX <= window.innerWidth / 2 ? (e.pageX + 8)+"px" : "auto")
        .style("right", e.pageX > window.innerWidth / 2 ? (window.innerWidth - e.pageX + 8)+"px" : "auto")
      )
  ;
  // Update position of hover area
  join_hover
    .attr("cx", d => x_axis(d.year))
    .attr("cy", d => y_axis(d[death_type]))
  ;
  // Remove hover area
  join_hover.exit().remove();
}

}
