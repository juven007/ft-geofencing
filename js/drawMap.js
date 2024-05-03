/**
 * Geofencing test
 * TASK:
 * Creat, Edit, Remove Polygons
 * Update the other polygons if the points are overlapping to each other
 * By: Juven Fieldad
 */

import DeleteMenu from "./deleteMenu.js";

let mapOptions;
let map;

let coordinates = [];
let new_coordinates = [];
let lastElement;
let polygonCtn = 0;
const all_polygons = [];
let active_polygon = null;
let last_index = null;
let _previous = null;
let polygon_color = "#ffff00";
let polygon_name = "";
let is_edit = false;

function initMap() {
  let location = new google.maps.LatLng(24.886, -70.268);
  mapOptions = {
    zoom: 4,
    center: location,
    mapTypeId: google.maps.MapTypeId.RoadMap,
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  /**
   * SAMPLE LIST OF POLYGONS TO DRAW
   */
  let polygon_data = [
    {
      id: 1,
      name: "Polygon 1",
      coords: [
        { lat: 25.774, lng: -79.760187 },
        { lat: 25.774, lng: -61.303156 },
        { lat: 13.674484725552164, lng: -60.55608599999999 },
        { lat: 14.646903, lng: -75.277766 },
        { lat: 14.356673100005045, lng: -85.16546087499998 },
      ],
      color: "#FF0000",
    },
    {
      id: 2,
      name: "Polygon 2",
      coords: [
        { lat: 25.774, lng: -85.101 },
        { lat: 35.406, lng: -85.101 },
        { lat: 35.406, lng: -54.127 },
        { lat: 31.008491575012982, lng: -55.79534337499999 },
        { lat: 25.774, lng: -60.01 },
      ],
      color: "#0000FF",
    },
    {
      id: 3,
      name: "Polygon 3",
      coords: [
        { lat: 25.759886, lng: -61.303156 },
        { lat: 26.155006, lng: -43.109797 },
        { lat: 12.425378, lng: -41.967219 },
        { lat: 13.709568, lng: -60.600031 },
      ],
      color: "#ADFF2F",
    },
  ];

  /**
   * Drawing all the polygon to the map from the the polygon_data Object
   * Creating polygon Object from each polygon_data and
   * Draw it to the map.
   */
  for (let p = 0; p < polygon_data.length; p++) {
    window["gmap_polygon" + p] = new google.maps.Polygon({
      paths: polygon_data[p].coords,
      strokeColor: polygon_data[p].color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: polygon_data[p].color,
      fillOpacity: 0.8,
      clickable: true,
      draggable: false,
      editable: false,
      index: p,
      id: polygon_data[p].id,
      name: polygon_data[p].name,
      isNew: false,
    });
    window["gmap_polygon" + p].setMap(map);
    all_polygons.push(window["gmap_polygon" + p]);
  }

  /**
   * Drawing Manager for creating new polygon
   */
  let drawingManager = new google.maps.drawing.DrawingManager({
    // drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON],
    },
    polygonOptions: getNewPolygonOptions(polygon_color),
  });
  drawingManager.setMap(map);

  // google.maps.event.addListener(drawingManager, 'polygoncomplete', function (event) {
  //   console.log('polygoncomplete');
  //   event.getPath().getLength();
  // });

  google.maps.event.addListener(
    drawingManager,
    "overlaycomplete",
    function (event) {
      var newPolygon = event.overlay;
      // newShape.type = event.type;
      addNewPolygon(newPolygon);
      drawingManager.setDrawingMode(null);
      document.querySelector("#add-btn").removeAttribute("disabled");
      editMode(true);
    },
  );

  /**
   * This will adjust the font size of the label based on map zoom
   */
  google.maps.event.addListener(map, "zoom_changed", function () {
    let option = {
      boxStyle: getDefaultLabelStyle(),
    };
    if (map.getZoom() >= 6) {
      option.boxStyle.fontSize = "18pt";
      option.boxStyle.width = "150px";
      resizePolygonLabel(option);
    } else if (map.getZoom() <= 3) {
      option.boxStyle.fontSize = "7pt";
      resizePolygonLabel(option);
    } else {
      resizePolygonLabel(option);
    }
  });

  /**
   * Inserting Custom Menu in the map
   */
  function CenterControl(controlDiv, map) {
    //START: ADD BUTTON CONTORL
    let add_ui_control = document.createElement("div");
    add_ui_control.className = "custom-control-btn-wrapper";
    add_ui_control.title = "Add";
    controlDiv.appendChild(add_ui_control);

    let add_ui_btn = document.createElement("button");
    add_ui_btn.className = "custom-control-btn";
    add_ui_btn.textContent = "Add";
    add_ui_btn.id = "add-btn";
    add_ui_control.appendChild(add_ui_btn);

    add_ui_btn.addEventListener("click", function () {
      is_edit = false;
      clearAllSelection();
      editMode(false);
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      add_ui_btn.setAttribute("disabled", "disabled");
      //reset name and color of the new polygon
      clearPolygonForm();
      document.querySelector("#color-done__btn").textContent = "Done";
      document.querySelector(".polygon-info-wrapper").style.display = "flex";
    });
    //END: ADD BUTTON CONTORL

    //START: EDIT BUTTON CONTORL
    let edit_ui_control = document.createElement("div");
    edit_ui_control.className = "custom-control-btn-wrapper";
    edit_ui_control.title = "Edit";
    controlDiv.appendChild(edit_ui_control);

    let edit_ui_btn = document.createElement("button");
    edit_ui_btn.className = "custom-control-btn";
    edit_ui_btn.textContent = "Edit";
    edit_ui_btn.id = "edit-btn";
    edit_ui_btn.setAttribute("disabled", "disabled");
    edit_ui_control.appendChild(edit_ui_btn);

    edit_ui_btn.addEventListener("click", function () {
      is_edit = true;
      document.querySelector("#form-title").innerHTML =
        "Edit " + active_polygon.name;
      document.querySelector("#polygon-name").value = active_polygon.name;
      document.querySelector("#map-color").value = active_polygon.fillColor;
      document.querySelector("#color-done__btn").textContent = "Save";
      document.querySelector(".polygon-info-wrapper").style.display = "flex";
    });
    //END: EDIT BUTTON CONTORL

    //START: REMOVE BUTTON CONTORL
    let remove_ui_control = document.createElement("div");
    remove_ui_control.className = "custom-control-btn-wrapper";
    remove_ui_control.title = "Remove";
    controlDiv.appendChild(remove_ui_control);

    let remove_ui_btn = document.createElement("button");
    remove_ui_btn.className = "custom-control-btn";
    remove_ui_btn.textContent = "Remove";
    remove_ui_btn.id = "remove-btn";
    remove_ui_btn.setAttribute("disabled", "disabled");
    remove_ui_control.appendChild(remove_ui_btn);

    remove_ui_control.addEventListener("click", function () {
      deleteSelectedPolygon();
    });
    //END: REMOVE BUTTON CONTORL

    //START: DONE BUTTON CONTORL
    // Set CSS for the control border.
    let done_ui_control = document.createElement("div");
    done_ui_control.className = "custom-control-btn-wrapper";
    done_ui_control.title = "Done";
    controlDiv.appendChild(done_ui_control);

    // Set CSS for the control interior.
    let done_ui_text = document.createElement("div");
    done_ui_text.className = "custom-control-btn";
    done_ui_text.innerHTML = "Done";
    done_ui_control.appendChild(done_ui_text);

    //to request update
    done_ui_control.addEventListener("click", function () {
      if (active_polygon) {
        setActiveEditable(false); // set editable to false to active polygon
        active_polygon.setOptions({ strokeWeight: 2, fillOpacity: 0.8 });
        editMode(false); // Disable the Edit and Remove button
      }
      updateDatabase(all_polygons);
    });
    //END: DONE BUTTON CONTORL
  }

  /**
   * Inserting Add/Edit form in the map
   */
  function PolygonControl(controlDiv, map) {
    let form_control = document.createElement("div");
    form_control.className = "form-wrapper";
    controlDiv.appendChild(form_control);

    let title_control = document.createElement("div");
    title_control.className = "form-title";
    title_control.id = "form-title";
    title_control.innerHTML = "Add new polygon";
    form_control.appendChild(title_control);

    let name_control = document.createElement("div");
    name_control.className = "each-wrapper";
    form_control.appendChild(name_control);

    let input_name_lbl = document.createElement("div");
    input_name_lbl.innerHTML = "Name";
    input_name_lbl.className = "polygon-lbl";
    name_control.appendChild(input_name_lbl);

    let input_name = document.createElement("input");
    input_name.type = "text";
    input_name.className = "text-style"; // set the CSS class
    input_name.id = "polygon-name";
    input_name.title = "Enter polygon name";
    name_control.appendChild(input_name);

    let colorpicker_control = document.createElement("div");
    colorpicker_control.className = "each-wrapper";
    form_control.appendChild(colorpicker_control);

    let input_color_lbl = document.createElement("div");
    input_color_lbl.innerHTML = "Color";
    input_color_lbl.className = "polygon-lbl";
    colorpicker_control.appendChild(input_color_lbl);

    let input_color = document.createElement("input");
    input_color.type = "text";
    input_color.className = "text-style"; // set the CSS class
    input_color.id = "map-color";
    input_color.title = "Pick a color";
    input_color.setAttribute("data-coloris", "");
    colorpicker_control.appendChild(input_color);

    let btn_control = document.createElement("div");
    btn_control.className = "btn-control-wrapper";
    form_control.appendChild(btn_control);

    let cancel_btn = document.createElement("button");
    cancel_btn.className = "btn btn__light";
    cancel_btn.textContent = "Cancel";
    cancel_btn.id = "cancel__btn";
    btn_control.appendChild(cancel_btn);

    cancel_btn.addEventListener("click", function () {
      clearPolygonForm();
      drawingManager.setDrawingMode(null);
      document.querySelector("#add-btn").removeAttribute("disabled");
      document.querySelector(".polygon-info-wrapper").style.display = "none";
    });

    let save_btn = document.createElement("button");
    save_btn.className = "btn btn__primary";
    save_btn.textContent = "Done";
    save_btn.id = "color-done__btn";
    btn_control.appendChild(save_btn);
    save_btn.addEventListener("click", function () {
      if (
        document.querySelector("#map-color").value.trim() != "" &&
        document.querySelector("#polygon-name").value.trim() != ""
      ) {
        polygon_color = document.querySelector("#map-color").value.trim();
        polygon_name = document.querySelector("#polygon-name").value.trim();

        if (is_edit && active_polygon) {
          console.log("edit");
          console.log(active_polygon);
          active_polygon.setOptions(
            getNewPolygonOptions(
              active_polygon.index,
              polygon_color,
              active_polygon.id,
              polygon_name,
              false,
            ),
          );
          processPolygonLabel(map, active_polygon);
        } else {
          console.log("add");
          drawingManager.setOptions({
            polygonOptions: getNewPolygonOptions(
              null,
              polygon_color,
              null,
              polygon_name,
            ),
          });
        }
        document.querySelector(".polygon-info-wrapper").style.display = "none";
      }
    });
  }

  /**
   * Initialize all the polygons
   * Add Listeners etc.
   */
  function initPolygons() {
    for (let j = 0; j < all_polygons.length; j++) {
      let cur_polygon = all_polygons[j];
      cur_polygon.setOptions({ index: j });
      cur_polygon.addListener("click", function (event) {
        // Set editable state to the current polygon clicked.
        clearAllSelection();
        this.setEditable(true);

        // Assign the clicked polygon to active_polygon
        active_polygon = this;

        // console.log(active_polygon);
        active_polygon.setOptions({ strokeWeight: 2, fillOpacity: 0.3 });
        editMode(true); // Enable the Edit and Remove button any polygon is selected
      });

      addRemoveListener(cur_polygon); // Add right-click listener to display Delete button to remove a vertex
      processPolygonLabel(map, cur_polygon); // Adding Label polygon

      let paths = cur_polygon.getPaths();
      for (let p = 0; p < paths.getLength(); p++) {
        google.maps.event.addListener(paths.getAt(p), "insert_at", (index) => {
          // console.log('We inserted a point', paths.getAt(p));
          last_index = index;
          _previous = null;
          updatePolygons();
        });

        google.maps.event.addListener(paths.getAt(p), "remove_at", () => {
          // console.log('We removed a point', paths.getAt(p));
          updatePolygons();
        });

        google.maps.event.addListener(
          paths.getAt(p),
          "set_at",
          (index, previous) => {
            // console.log('We set a point', paths.getAt(p));
            last_index = index;
            _previous = previous;
            updatePolygons();
          },
        );
      }
    }
  }

  /**
   * Clear the Add and Edit Polygon Form
   */
  function clearPolygonForm() {
    polygon_color = "#ffff00";
    polygon_name = "";
    document.querySelector("#map-color").value = "";
    document.querySelector("#polygon-name").value = "";
  }

  /**
   * Enable/Disable the Edit and Remove buttons based on the state given
   * @param state: Boolean set to true if Edit mode and false if Add mode
   */
  function editMode(state) {
    if (state) {
      document.querySelector("#edit-btn").removeAttribute("disabled");
      document.querySelector("#remove-btn").removeAttribute("disabled");
    } else {
      document.querySelector("#edit-btn").setAttribute("disabled", "disabled");
      document
        .querySelector("#remove-btn")
        .setAttribute("disabled", "disabled");
    }
  }

  /**
   * Add new create polygon to the list and initialize it and update necessary updates
   * @param newPolygon: Polygon Object to add in the Polygon list Array
   */
  function addNewPolygon(newPolygon) {
    all_polygons.push(newPolygon);
    initPolygons();
    active_polygon = newPolygon;
    updatePolygons();
  }

  /**
   * Delete selected Polygon if confirm returns to true
   */
  function deleteSelectedPolygon() {
    if (active_polygon) {
      var result = confirm(
        "Are you sure want to delete " + active_polygon.name + "?",
      );
      if (result) {
        active_polygon.setMap(null); // remove selected polygon from the map
        active_polygon.lbl.close(); // remove polygon label from the map
        all_polygons.splice(active_polygon.index, 1); // remove the selected polygon from the main all_polygons array
        initPolygons(); // initialize all the remaining polygons
        active_polygon = null; // set active_polygon to null (no current selected)
        editMode(false);
      }
    }
  }

  /**
   * Creating the Polygon label
   * @param map: Map Object
   * @param polygon: Polygon Object the polygon to insert the label
   */
  function processPolygonLabel(map, polygon) {
    if (polygon && polygon.lbl) {
      polygon.lbl.close();
    }
    let cur_coords = [
      getCoords(polygon).map((coord) => {
        return [coord.lat, coord.lng];
      }),
    ];
    let center_coords = turf.getCoords(
      turf.centerOfMass(turf.polygon(checkLastCoords(cur_coords))),
    );
    let center_of_polygon = { lat: center_coords[0], lng: center_coords[1] };

    var labelOptions = {
      content: polygon.name,
      boxStyle: getDefaultLabelStyle(),
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(-50, -10),
      infoBoxClearance: new google.maps.Size(1, 1),
      position: center_of_polygon,
      closeBoxURL: "",
      isHidden: false,
      pane: "floatPane",
      enableEventPropagation: true,
      zIndex: 999,
    };

    var polygonLabel = new InfoBox(labelOptions);
    polygonLabel.open(map);
    polygon.setOptions({ lbl: polygonLabel });
  }

  /**
   * addListener contextmenu to the active polygon.
   * right-click to the vertex/point will display the delete button to
   * capability to delete/remove a vertex/point
   * @param polygon: (Object) maps polygon object
   */
  function addRemoveListener(polygon) {
    const deleteMenu = new DeleteMenu();
    google.maps.event.addListener(polygon, "contextmenu", (e) => {
      if (e.vertex == undefined) {
        return;
      }

      // Show delete option only if the coords of the polygon is greater than 3
      if (polygon.getPath().getLength() > 3) {
        deleteMenu.open(map, polygon.getPath(), e.vertex);
      }
    });
  }

  /**
   * Setting editable state to active polygon
   * @param status: (Boolean)
   */
  function setActiveEditable(status) {
    active_polygon.setEditable(status);
  }

  /**
   * Check if the two polygon is intersection with each other
   * If true then update the coordinates of affected polygon
   */
  function updatePolygons() {
    if (active_polygon) {
      for (let i = 0; i < all_polygons.length; i++) {
        if (i !== active_polygon.index) {
          let intersection_area = calcPolygonIntersection(
            active_polygon.index,
            i,
          );
          if (intersection_area) {
            reshapePolygon(map, intersection_area, active_polygon.index, i);
          } else {
            //If no other polygons affected from updates then just reposition the Label to the center if necessary
            processPolygonLabel(map, active_polygon);
          }
        }
      }
    }
    // $('img[src$="undo_poly.png"]').parent().parent().hide(); // Hide the undo button
  }

  /**
   * Set All polygon editable state to false
   */
  function clearAllSelection() {
    for (let i = 0; i < all_polygons.length; i++) {
      all_polygons[i].setEditable(false);
      all_polygons[i].setOptions({ strokeWeight: 2, fillOpacity: 0.8 });
    }
  }

  /**
   * Calculate and return the intersection coordinates
   * @param active_pol: (Numeric) index of the active polygon
   * @param affected_pol: (Numeric) index of the affected polygon where the active polygon overlap
   * @return Array of intersection coordinates
   */
  function calcPolygonIntersection(active_pol, affected_pol) {
    let affected_coords = [
      getCoords(all_polygons[affected_pol]).map((coord) => {
        return [coord.lat, coord.lng];
      }),
    ];

    let activeCoords = [
      getCoords(all_polygons[active_pol]).map((coord) => {
        return [coord.lat, coord.lng];
      }),
    ];
    let poly1 = turf.polygon(checkLastCoords(affected_coords));
    let poly2 = turf.polygon(checkLastCoords(activeCoords));
    let intersection = turf.intersect(poly1, poly2);
    let intersection_coords = null;
    if (intersection) {
      intersection_coords = turf.getCoords(intersection);
    }
    return intersection_coords;
  }

  /**
   * Update the affected polygon coordinates and redraw the polygon to the map
   * @param intersection_area: intersection coordinates
   * @param active_polygon_index: (Numeric) index of the active polygon incase in need to do something
   * @param affected_polygon_index: (Numeric) index of the affected polygon to update and redraw
   */
  function reshapePolygon(
    map,
    intersection_area,
    active_polygon_index,
    affected_polygon_index,
  ) {
    let affected_coords = [
      getCoords(all_polygons[affected_polygon_index]).map((coord) => {
        return [coord.lat, coord.lng];
      }),
    ];

    let affected_polygon = turf.polygon(checkLastCoords(affected_coords));
    let intersection_polygon = turf.polygon(intersection_area);
    let newshape = turf.getCoords(
      turf.difference(affected_polygon, intersection_polygon),
    );
    let new_shape_coords = newshape[0].map((item) => {
      return { lat: item[0], lng: item[1] };
    });

    if (new_shape_coords.length > 3) {
      all_polygons[affected_polygon_index].setPath(new_shape_coords);
      all_polygons[affected_polygon_index].setMap(map);
      initPolygons();
    } else {
      // catching drawing error
      const wpath = active_polygon.getPath();
      if (_previous) {
        wpath.setAt(last_index, _previous);
      } else {
        wpath.removeAt(last_index);
      }
      console.log(
        "Error: Not possible! Will cause to divide the affected polygon causing setting map error",
      );
    }
  }

  /**
   * Get the list coordinates of the polygon
   * @param polygon: (Object) map polygon object
   * @return Array of coordinates
   */
  function getCoords(polygon) {
    let path = polygon.getPath();
    let pol_coords = path.getArray().map(function name(coord) {
      return { lat: coord.lat(), lng: coord.lng() };
    });
    return pol_coords;
  }

  /**
   * Check the last coordinates if the same with the first coordinates.
   * If not the same, get the value of the first coordinate and add it as the last coordinates
   * @param coords: (Array) polygon coordinates in Array
   * @return Array of coordinates
   */
  function checkLastCoords(coords) {
    // Needed this to close the polygon in turf.js calculation.
    if (
      JSON.stringify(coords[0][0]) !==
      JSON.stringify(coords[0][coords[0].length - 1])
    ) {
      coords[0].push(coords[0][0]);
    }
    return coords;
  }

  /**
   * Reconstruct the updated coordinates to be send in api request to update backend
   * @param allpolygon
   */
  function updateDatabase(allpolygon) {
    let new_data = allpolygon.map((polygon) => {
      let new_pol_data = {
        id: polygon.id,
        coords: getCoords(polygon),
        color: polygon.fillColor,
        name: polygon.name,
      };
      return new_pol_data;
    });
    console.log(new_data);
    //Script to update backend here (api request)
  }

  initPolygons();

  /**
   * Setting new options for Polygon Label
   * @param opt: Option Object
   */
  function resizePolygonLabel(opt) {
    for (let j = 0; j < all_polygons.length; j++) {
      let cur_polygon = all_polygons[j];
      if (cur_polygon.lbl) {
        cur_polygon.lbl.setOptions(opt);
      }
    }
  }

  /**
   * Return default boxstyle options for infoBox label
   */
  function getDefaultLabelStyle() {
    return {
      textAlign: "center",
      fontSize: "14pt",
      width: "100px",
      fontWeight: "700",
      textShadow: "0px 0px 3px rgba(255,255,255,1)",
    };
  }

  /**
   * Return new Polygon Options Object
   * @param idx: Numeric (Index of the Polygon)
   * @param pol_clr: String (Color of the Polygon)
   * @param id: String (ID of the Polygon)
   * @param name: String (Name of the Polygon)
   * @param is_new: Boolean (whether new or existing polygon)
   */
  function getNewPolygonOptions(idx, pol_clr, id, name, is_new = true) {
    return {
      strokeColor: pol_clr,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: pol_clr,
      fillOpacity: 0.3,
      clickable: true,
      draggable: false,
      editable: true,
      index: idx,
      id: id,
      name: name,
      isNew: is_new,
    };
  }

  let center_control_div = document.createElement("div");
  center_control_div.className = "map-custom-controls-wrapper";

  let polygon_control_div = document.createElement("div");
  polygon_control_div.className = "polygon-info-wrapper";

  let center_control = new CenterControl(center_control_div, map);
  let polygon_control = new PolygonControl(polygon_control_div, map);

  center_control_div.index = 1;
  polygon_control_div.index = 2;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(center_control_div);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(polygon_control_div);
}

initMap();
