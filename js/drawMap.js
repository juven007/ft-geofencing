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
let is_circle = false;
let circle_radius = 10;
let circle_steps = 20;

function initMap() {
  let location = new google.maps.LatLng(-25.83857063120318, 133.417046875);
  mapOptions = {
    zoom: 5,
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
        { lat: -37.64641178895053, lng: 149.83062109375 },
        { lat: -37.07261879599334, lng: 148.64987266971153 },
        { lat: -36.8240707548176, lng: 148.13873928288626 },
        { lat: -36.55993992039596, lng: 148.16069921875 },
        { lat: -36.559208316565794, lng: 148.16046380429745 },
        { lat: -36.558587766564116, lng: 148.16051617054396 },
        { lat: -36.08194481395504, lng: 148.006890625 },
        { lat: -35.92196261356255, lng: 147.72124609375 },
        { lat: -35.97532607380198, lng: 147.4356015625 },
        { lat: -36.04642126815326, lng: 147.01812109375 },
        { lat: -36.02865348120192, lng: 146.44683203125 },
        { lat: -36.02865348120192, lng: 145.7656796875 },
        { lat: -35.850755289001995, lng: 145.4580625 },
        { lat: -35.815127622493684, lng: 145.0625546875 },
        { lat: -36.02192047676144, lng: 144.9135960634491 },
        { lat: -36.05093951713505, lng: 144.84808631787743 },
        { lat: -36.11745231694747, lng: 144.667046875 },
        { lat: -35.583158232771574, lng: 144.0078671875 },
        { lat: -35.22496699955037, lng: 143.45855078125 },
        { lat: -34.86518766550889, lng: 143.260796875 },
        { lat: -34.7185314210534, lng: 142.99907435104424 },
        { lat: -34.71853142105335, lng: 142.99907435104413 },
        { lat: -34.594315299050365, lng: 142.7773984375 },
        { lat: -34.82912266161175, lng: 142.57964453125 },
        { lat: -34.376979250372294, lng: 142.31597265625 },
        { lat: -34.14089380816011, lng: 142.0742734375 },
        { lat: -34.081352250134614, lng: 141.9065225451109 },
        { lat: -34.0813522501346, lng: 141.9065225451109 },
        { lat: -34.031708060422396, lng: 141.76665625 },
        { lat: -34.23177430190611, lng: 141.52495703125 },
        { lat: -34.079002650578595, lng: 141.17010484834515 },
        { lat: -33.99457062768354, lng: 140.97564848719375 },
        { lat: -28.957402633593627, lng: 141.03135641858577 },
        { lat: -28.976414838064045, lng: 148.99566015625 },
        { lat: -28.571965595239195, lng: 149.5449765625 },
        { lat: -28.53336499431112, lng: 150.31401953125 },
        { lat: -28.726226306365497, lng: 150.48980078125 },
        { lat: -28.66840513390643, lng: 150.88530859375 },
        { lat: -28.899497878599888, lng: 151.23687109375 },
        { lat: -29.187641568307846, lng: 151.32476171875 },
        { lat: -28.861018001977953, lng: 151.7422421875 },
        { lat: -28.918732469947635, lng: 152.049859375 },
        { lat: -28.610552039195852, lng: 152.11577734375 },
        { lat: -28.243410483652916, lng: 152.5332578125 },
        { lat: -28.340150067793928, lng: 152.9727109375 },
        { lat: -28.16595557663809, lng: 153.52202734375 },
        { lat: -28.803271474885246, lng: 153.65386328125 },
        { lat: -29.340988468521502, lng: 153.39019140625 },
        { lat: -30.275184289834883, lng: 153.17046484375 },
        { lat: -30.899382976928372, lng: 152.99468359375 },
        { lat: -31.27572036312104, lng: 152.99468359375 },
        { lat: -32.061148934051104, lng: 152.6211484375 },
        { lat: -32.525497044034196, lng: 152.5332578125 },
        { lat: -32.98745768693295, lng: 151.72026953125 },
        { lat: -33.8859082443047, lng: 151.25884375 },
        { lat: -34.70277075735006, lng: 150.79741796875 },
        { lat: -35.904166785529924, lng: 150.22612890625 },
        { lat: -36.94724506582368, lng: 149.87456640625 },
        { lat: -37.332591086573125, lng: 150.05034765625 },
      ],
      color: "#FF0000",
    },
    {
      id: 2,
      name: "Polygon 2",
      coords: [
        { lat: -38.18147787255209, lng: 141.03131702744685 },
        { lat: -38.04504461801273, lng: 140.9160001421248 },
        { lat: -38.10558373562015, lng: 140.7072599077498 },
        { lat: -37.59375886824487, lng: 140.15706493936455 },
        { lat: -37.32341237905784, lng: 139.82747509561455 },
        { lat: -37.113441375664095, lng: 139.72859814248955 },
        { lat: -36.938019488599615, lng: 139.61873486123955 },
        { lat: -36.867737364752564, lng: 139.81648876748955 },
        { lat: -36.67412798621386, lng: 139.86043407998955 },
        { lat: -36.045971198678764, lng: 139.53084423623955 },
        { lat: -35.514892617772425, lng: 138.75884429123036 },
        { lat: -35.90739609089946, lng: 138.03374663498036 },
        { lat: -36.040761729899764, lng: 137.61626616623036 },
        { lat: -36.07628783034885, lng: 136.69341460373036 },
        { lat: -35.70246492954412, lng: 136.62749663498036 },
        { lat: -35.586400586829136, lng: 138.11065093185536 },
        { lat: -35.30895229113276, lng: 138.47319975998036 },
        { lat: -34.84141263973178, lng: 138.60503569748036 },
        { lat: -34.18055605324915, lng: 138.08867827560536 },
        { lat: -34.60664022277433, lng: 137.90191069748036 },
        { lat: -35.25851089307599, lng: 137.82334860608577 },
        { lat: -35.006935443115076, lng: 137.03233298108577 },
        { lat: -34.61003562182011, lng: 137.51573141858577 },
        { lat: -33.59116622606325, lng: 137.99912985608577 },
        { lat: -32.966614040581696, lng: 137.82334860608577 },
        { lat: -33.81052671483131, lng: 137.25205954358577 },
        { lat: -33.81052671483131, lng: 136.54893454358577 },
        { lat: -34.93491409463043, lng: 135.67002829358577 },
        { lat: -34.211229293737034, lng: 135.23057516858577 },
        { lat: -33.334538991309465, lng: 134.70323141858577 },
        { lat: -32.966614040581696, lng: 134.17588766858577 },
        { lat: -32.48601249918225, lng: 133.86827048108577 },
        { lat: -32.114561892640225, lng: 133.03330954358577 },
        { lat: -32.114561892640225, lng: 132.33018454358577 },
        { lat: -31.554543419791397, lng: 131.23155173108577 },
        { lat: -31.81630824772185, lng: 128.99034079358577 },
        { lat: -26.011738407807577, lng: 128.99034079358577 },
        { lat: -26.090699495155594, lng: 141.03135641858577 },
        { lat: -28.957402633593627, lng: 141.03135641858577 },
        { lat: -33.99457062768354, lng: 140.97564848719375 },
        { lat: -33.994342184714846, lng: 140.9751223575702 },
      ],
      color: "#054385",
    },
    {
      id: 3,
      name: "Polygon 3",
      coords: [
        { lat: -39.16114161423806, lng: 146.4421231889998 },
        { lat: -38.96494337268781, lng: 146.2993009233748 },
        { lat: -38.853807640431874, lng: 146.1125333452498 },
        { lat: -38.93076629630057, lng: 145.9037931108748 },
        { lat: -38.716786453213075, lng: 145.7829435014998 },
        { lat: -38.64817714761974, lng: 145.5742032671248 },
        { lat: -38.53654678591893, lng: 145.1347501421248 },
        { lat: -38.519357481153484, lng: 144.8600919389998 },
        { lat: -38.3472387054747, lng: 144.7612149858748 },
        { lat: -38.31276573051776, lng: 144.4755704546248 },
        { lat: -38.50216407052878, lng: 144.0690763139998 },
        { lat: -38.742497981571525, lng: 143.8163907671248 },
        { lat: -38.9051226763881, lng: 143.5197599077498 },
        { lat: -38.69964029385054, lng: 143.1791837358748 },
        { lat: -38.64817714761974, lng: 142.9374845171248 },
        { lat: -38.47636625734831, lng: 142.6518399858748 },
        { lat: -38.35585438682914, lng: 142.3661954546248 },
        { lat: -38.407526945317414, lng: 142.2233731889998 },
        { lat: -38.261025527520914, lng: 141.8058927202498 },
        { lat: -38.398917415650985, lng: 141.5422208452498 },
        { lat: -38.33000426775799, lng: 141.3554532671248 },
        { lat: -38.14879527563742, lng: 141.1796720171248 },
        { lat: -38.184425537305984, lng: 141.03135658743727 },
        { lat: -33.994342184714846, lng: 140.9751223575702 },
        { lat: -34.079002650578595, lng: 141.17010484834515 },
        { lat: -34.22186676285767, lng: 141.50194417626022 },
        { lat: -34.23177430190611, lng: 141.52495703125 },
        { lat: -34.031708060422396, lng: 141.76665625 },
        { lat: -34.0813522501346, lng: 141.9065225451109 },
        { lat: -34.19598065236937, lng: 142.1306701686327 },
        { lat: -34.22800069101238, lng: 142.16345159832122 },
        { lat: -34.748116206224466, lng: 142.53240482046772 },
        { lat: -34.82912266161175, lng: 142.57964453125 },
        { lat: -34.61891075603991, lng: 142.75668423313 },
        { lat: -34.71853142105337, lng: 142.9990743510442 },
        { lat: -34.7185314210534, lng: 142.99907435104424 },
        { lat: -34.86518766550889, lng: 143.260796875 },
        { lat: -35.22496699955037, lng: 143.45855078125 },
        { lat: -35.31250035168428, lng: 143.59279054471045 },
        { lat: -36.11700265389125, lng: 144.6623380327498 },
        { lat: -36.11597579448975, lng: 144.66522523100076 },
        { lat: -36.11745231694747, lng: 144.667046875 },
        { lat: -36.05093951713505, lng: 144.84808631787743 },
        { lat: -36.02098396048108, lng: 144.91571022513259 },
        { lat: -35.81578984746424, lng: 145.06333900931227 },
        { lat: -35.85308685707538, lng: 145.4602201128279 },
        { lat: -35.967556883662134, lng: 145.66003295062993 },
        { lat: -36.02865348120192, lng: 145.7656796875 },
        { lat: -36.02865348120192, lng: 146.41318361209923 },
        { lat: -36.029545781319996, lng: 146.4755222276893 },
        { lat: -36.04642126815326, lng: 147.01812109375 },
        { lat: -35.97532607380198, lng: 147.4356015625 },
        { lat: -35.92196261356255, lng: 147.72124609375 },
        { lat: -36.08194481395504, lng: 148.006890625 },
        { lat: -36.558587766564116, lng: 148.16051617054396 },
        { lat: -36.82377817215181, lng: 148.13813759329665 },
        { lat: -37.07261879599334, lng: 148.64987266971153 },
        { lat: -37.60807693364535, lng: 149.75173581536058 },
        { lat: -37.793706298488175, lng: 149.4194181108748 },
        { lat: -37.854452793116465, lng: 148.1559903764998 },
        { lat: -38.22651157201979, lng: 147.3869474077498 },
        { lat: -38.56232304334271, lng: 147.0573575639998 },
        { lat: -38.68249002276323, lng: 146.6618497514998 },
        { lat: -38.819577032514545, lng: 146.4970548296248 },
        { lat: -38.99910396883546, lng: 146.5410001421248 },
      ],
      color: "#09ab2c",
    },
  ];
  /**
   * Drawing all the polygon to the map from the the polygon_data Object
   * Creating polygon Object from each polygon_data and
   * Draw it to the map.
   */
  if (polygon_data.length > 0) {
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
    initPolygons();
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
      clearAllSelection();
      if (active_polygon) {
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

    // Type Form Control
    let type_control = document.createElement("div");
    type_control.className = "each-wrapper";
    type_control.id = "type-control";
    form_control.appendChild(type_control);

    let input_type_lbl = document.createElement("div");
    input_type_lbl.innerHTML = "Type";
    input_type_lbl.className = "polygon-lbl";
    type_control.appendChild(input_type_lbl);

    let type_radio_wrap_control = document.createElement("div");
    type_radio_wrap_control.className = "flex-side-by-side";
    type_control.appendChild(type_radio_wrap_control);

    let free_shape_radio_wrap_control = document.createElement("div");
    free_shape_radio_wrap_control.className = "radio-wrapper";
    type_radio_wrap_control.appendChild(free_shape_radio_wrap_control);

    let free_shape_radio = document.createElement("input");
    free_shape_radio.type = "radio";
    free_shape_radio.name = "radio-type";
    free_shape_radio.className = "radio-style";
    free_shape_radio.id = "free-shape";
    free_shape_radio.value = "free-shape";
    free_shape_radio.title = "Free shape";
    free_shape_radio.setAttribute("checked", true);
    free_shape_radio_wrap_control.appendChild(free_shape_radio);
    free_shape_radio.addEventListener("click", function (e) {
      is_circle = false;
      document.querySelector("#cicle-options").style = "display: none";
    });

    let free_shape_lbl = document.createElement("label");
    free_shape_lbl.htmlFor = "free-shape";
    free_shape_lbl.className = "radio-style-lbl";
    free_shape_lbl.id = "free-shape-lbl";
    free_shape_lbl.innerHTML = "Free shape";
    free_shape_radio_wrap_control.appendChild(free_shape_lbl);

    let circle_radio_wrap_control = document.createElement("div");
    circle_radio_wrap_control.className = "radio-wrapper";
    type_radio_wrap_control.appendChild(circle_radio_wrap_control);

    let circle_radio = document.createElement("input");
    circle_radio.type = "radio";
    circle_radio.name = "radio-type";
    circle_radio.className = "radio-style";
    circle_radio.id = "circle-shape";
    circle_radio.value = "circle-shape";
    circle_radio.title = "Circle";
    circle_radio_wrap_control.appendChild(circle_radio);
    circle_radio.addEventListener("click", function (e) {
      is_circle = true;
      document.querySelector("#cicle-options").style = "display: flex";
    });

    let circle_lbl = document.createElement("label");
    circle_lbl.htmlFor = "circle-shape";
    circle_lbl.className = "radio-style-lbl";
    circle_lbl.id = "circle-shape-lbl";
    circle_lbl.innerHTML = "Circle";
    circle_radio_wrap_control.appendChild(circle_lbl);

    // Circle Options Form Control
    let circle_options_control = document.createElement("div");
    circle_options_control.className =
      "each-wrapper flex-space-between__vertical-center";
    circle_options_control.id = "cicle-options";
    circle_options_control.style = "display: none";
    form_control.appendChild(circle_options_control);

    let radius_control = document.createElement("div");
    radius_control.className = "flex-side-by-side";
    circle_options_control.appendChild(radius_control);

    let input_raduis_lbl = document.createElement("div");
    input_raduis_lbl.innerHTML = "Radius";
    input_raduis_lbl.className = "polygon-lbl";
    radius_control.appendChild(input_raduis_lbl);

    let input_radius = document.createElement("input");
    input_radius.type = "text";
    input_radius.value = circle_radius;
    input_radius.className = "text-style w-80";
    input_radius.id = "circle-radius";
    input_radius.title = "Enter radius of the circle";
    radius_control.appendChild(input_radius);

    let kilometer_lbl = document.createElement("div");
    kilometer_lbl.innerHTML = "(kms)";
    kilometer_lbl.className = "sm-txt";
    radius_control.appendChild(kilometer_lbl);

    let steps_control = document.createElement("div");
    steps_control.className = "flex-side-by-side";
    circle_options_control.appendChild(steps_control);

    let input_steps_lbl = document.createElement("div");
    input_steps_lbl.innerHTML = "Steps";
    input_steps_lbl.className = "polygon-lbl text-right";
    steps_control.appendChild(input_steps_lbl);

    let input_steps = document.createElement("input");
    input_steps.type = "text";
    input_steps.value = circle_steps;
    input_steps.className = "text-style w-80";
    input_steps.id = "steps-radius";
    input_steps.title = "Enter circle steps";
    steps_control.appendChild(input_steps);

    // Name Form Control
    let name_control = document.createElement("div");
    name_control.className = "each-wrapper";
    form_control.appendChild(name_control);

    let input_name_lbl = document.createElement("div");
    input_name_lbl.innerHTML = "Name";
    input_name_lbl.className = "polygon-lbl";
    name_control.appendChild(input_name_lbl);

    let input_name = document.createElement("input");
    input_name.type = "text";
    input_name.className = "text-style";
    input_name.id = "polygon-name";
    input_name.title = "Enter polygon name";
    input_name.setAttribute("autocomplete", "off");
    name_control.appendChild(input_name);

    // Color Form Control
    let colorpicker_control = document.createElement("div");
    colorpicker_control.className = "each-wrapper";
    form_control.appendChild(colorpicker_control);

    let input_color_lbl = document.createElement("div");
    input_color_lbl.innerHTML = "Color";
    input_color_lbl.className = "polygon-lbl";
    colorpicker_control.appendChild(input_color_lbl);

    let input_color = document.createElement("input");
    input_color.type = "text";
    input_color.className = "text-style";
    input_color.id = "map-color";
    input_color.title = "Pick a color";
    input_color.setAttribute("data-coloris", "");
    colorpicker_control.appendChild(input_color);

    // Buttons Form Control
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
        circle_radius =
          document.querySelector("#circle-radius").value.trim() != ""
            ? document.querySelector("#circle-radius").value.trim()
            : 10;
        circle_steps =
          document.querySelector("#steps-radius").value.trim() != ""
            ? document.querySelector("#steps-radius").value.trim()
            : 10;

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
          if (is_circle) {
            // CIRCLE
            let map_clicked_listener = google.maps.event.addListener(
              map,
              "click",
              function (event) {
                let tpoint = [event.latLng.lat(), event.latLng.lng()];
                let new_shape_coords = makeCirclePolygonCoords(
                  tpoint,
                  circle_radius,
                  circle_steps,
                );
                let _new_polygon = new google.maps.Polygon(
                  getNewPolygonOptions(null, polygon_color, null, polygon_name),
                );
                _new_polygon.setOptions({ paths: new_shape_coords });
                _new_polygon.setMap(map);
                addNewPolygon(_new_polygon);
                document.querySelector("#add-btn").removeAttribute("disabled");
                editMode(true);
                map_clicked_listener.remove();
              },
            );
          } else {
            // FREE SHAPE
            drawingManager.setDrawingMode(
              google.maps.drawing.OverlayType.POLYGON,
            );
            drawingManager.setOptions({
              polygonOptions: getNewPolygonOptions(
                null,
                polygon_color,
                null,
                polygon_name,
              ),
            });
          }
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
   * Make a shape according to radius and steps
   *
   */
  function makeCirclePolygonCoords(pt, c_radius, c_steps) {
    var circle = turf.flip(
      turf.circle(pt.reverse(), c_radius, {
        steps: c_steps,
        units: "kilometers",
      }),
    );
    let new_shape_coords = turf.getCoords(circle)[0].map((item) => {
      return { lat: item[0], lng: item[1] };
    });

    return new_shape_coords;
  }

  /**
   * Clear the Add and Edit Polygon Form
   */
  function clearPolygonForm() {
    polygon_color = "#ffff00";
    polygon_name = "";
    circle_radius = 10;
    circle_steps = 20;
    // document.querySelector('#free-shape').setAttribute('checked', true);
    // document.querySelector('#circle-shape').removeAttribute('checked');
    document.querySelector("#map-color").value = "";
    document.querySelector("#polygon-name").value = "";
    document.querySelector("#circle-radius").value = circle_radius;
    document.querySelector("#steps-radius").value = circle_steps;
  }

  /**
   * Enable/Disable the Edit and Remove buttons based on the state given
   * @param state: Boolean set to true if Edit mode and false if Add mode
   */
  function editMode(state) {
    if (state) {
      document.querySelector("#type-control").style = "display: none";
      document.querySelector("#cicle-options").style = "display: none";
      document.querySelector("#edit-btn").removeAttribute("disabled");
      document.querySelector("#remove-btn").removeAttribute("disabled");
    } else {
      document.querySelector("#type-control").style = "display: flex";

      document.querySelector("#cicle-options").style = is_circle
        ? "display: flex"
        : "display: none";
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
    let is_center_in_polygon = turf.booleanPointInPolygon(
      center_coords,
      turf.polygon(checkLastCoords(cur_coords)),
    );
    if (!is_center_in_polygon) {
      center_coords = turf.getCoords(
        turf.pointOnFeature(turf.polygon(checkLastCoords(cur_coords))),
      );
      center_of_polygon = { lat: center_coords[0], lng: center_coords[1] };
    }

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
            if (intersection_area.length > 1) {
              for (let v = 0; v < intersection_area.length; v++) {
                reshapePolygon(
                  map,
                  intersection_area[v],
                  active_polygon.index,
                  i,
                );
              }
            } else {
              reshapePolygon(map, intersection_area, active_polygon.index, i);
            }
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
    // let newshape = turf.getCoords(
    //   turf.difference(affected_polygon, intersection_polygon),
    // );
    let newshape = turf.getCoords(
      turf.cleanCoords(turf.difference(affected_polygon, intersection_polygon)),
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
