/**
 * Geofencing test
 * TASK:
 * where stretching on side will move the other side
 */

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

/**
 * START: DeleteMenu;
 * A menu that lets a user delete a selected vertex of a path.
 * From google maps api
 * https://developers.google.com/maps/documentation/javascript/examples/delete-vertex-menu#maps_delete_vertex_menu-typescript
 */
class DeleteMenu extends google.maps.OverlayView {
  div_;
  divListener_;
  constructor() {
    super();
    this.div_ = document.createElement('div');
    this.div_.className = 'delete-menu';
    this.div_.innerHTML = 'Delete';

    const menu = this;
    this.div_.addEventListener('click', () => {
      menu.removeVertex();
    });
  }
  onAdd() {
    const deleteMenu = this;
    const map = this.getMap();

    this.getPanes().floatPane.appendChild(this.div_);
    // mousedown anywhere on the map except on the menu div will close the
    // menu.
    this.divListener_ = map.getDiv().addEventListener(
      'mousedown',
      (e) => {
        if (e.target != deleteMenu.div_) {
          deleteMenu.close();
        }
      },
      true,
    );
  }
  onRemove() {
    if (this.divListener_) {
      google.maps.event.removeListener(this.divListener_);
    }

    this.div_.parentNode.removeChild(this.div_);
    // clean up
    this.set('position', null);
    this.set('path', null);
    this.set('vertex', null);
  }
  close() {
    this.setMap(null);
  }
  draw() {
    const position = this.get('position');
    const projection = this.getProjection();

    if (!position || !projection) {
      return;
    }

    const point = projection.fromLatLngToDivPixel(position);

    this.div_.style.top = point.y + 'px';
    this.div_.style.left = point.x + 'px';
  }
  /**
   * Opens the menu at a vertex of a given path.
   */
  open(map, path, vertex) {
    this.set('position', path.getAt(vertex));
    this.set('path', path);
    this.set('vertex', vertex);
    this.setMap(map);
    this.draw();
  }
  /**
   * Deletes the vertex from the path.
   */
  removeVertex() {
    const path = this.get('path');
    const vertex = this.get('vertex');

    if (!path || vertex == undefined) {
      this.close();
      return;
    }

    path.removeAt(vertex);
    this.close();
  }
}
/**
 * END: DeleteMenu;
 */

function initMap() {
  let location = new google.maps.LatLng(24.886, -70.268);
  mapOptions = {
    zoom: 4,
    center: location,
    mapTypeId: google.maps.MapTypeId.RoadMap,
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  /**
   * =================================================================================
   * Start: Adding new Polygon
   */
  let all_overlays = [];
  let selectedShape;
  var drawingManager = new google.maps.drawing.DrawingManager({
    // drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON],
    },
    polygonOptions: {
      clickable: true,
      draggable: false,
      editable: true,
      fillColor: '#ffff00',
      fillOpacity: 0.5,
      geodesic: true,
    },
  });
  drawingManager.setMap(map);

  var getPolygonCoords = function (newShape) {
    // coordinates.splice(0, coordinates.length);
    var len = newShape.getPath().getLength();

    let shapesCoords = [];
    for (var i = 0; i < len; i++) {
      console.log(getCoords(newShape));
      shapesCoords.push(newShape.getPath().getAt(i).toUrlValue(6));
      //   coordinates.push(newShape.getPath().getAt(i).toUrlValue(6));
    }
    console.log(shapesCoords);
    // coordinates[newShape.zIndex] = shapesCoords;
    // document.getElementById('info').innerHTML = coordinates;
  };

  google.maps.event.addListener(drawingManager, 'polygoncomplete', function (event) {
    console.log('polygoncomplete');
    event.getPath().getLength();
    google.maps.event.addListener(event, 'dragend', getPolygonCoords(event));

    google.maps.event.addListener(event.getPath(), 'insert_at', function () {
      console.log('insert at');
      getPolygonCoords(event);
      // $('img[src$="undo_poly.png"]').parent().parent().hide();
    });

    google.maps.event.addListener(event.getPath(), 'set_at', function () {
      console.log('set at');
      getPolygonCoords(event);
      // $('img[src$="undo_poly.png"]').parent().parent().hide();
    });
  });

  /**
   * End: Adding new Polygon
   * =================================================================================
   */

  function CenterControl(controlDiv, map) {
    //START: ADD BUTTON CONTORL
    let add_ui_control = document.createElement('div');
    add_ui_control.className = 'custom-control-btn-wrapper';
    add_ui_control.title = 'Add';
    controlDiv.appendChild(add_ui_control);

    let add_ui_text = document.createElement('div');
    add_ui_text.className = 'custom-control-btn';
    add_ui_text.innerHTML = 'Add';
    add_ui_control.appendChild(add_ui_text);

    //to request update
    add_ui_control.addEventListener('click', function () {
      clearAllSelection();
    });
    //END: ADD BUTTON CONTORL

    //START: DONE BUTTON CONTORL
    // Set CSS for the control border.
    let done_ui_control = document.createElement('div');
    done_ui_control.className = 'custom-control-btn-wrapper';
    done_ui_control.title = 'Done';
    controlDiv.appendChild(done_ui_control);

    // Set CSS for the control interior.
    let done_ui_text = document.createElement('div');
    done_ui_text.className = 'custom-control-btn';
    done_ui_text.innerHTML = 'Done';
    done_ui_control.appendChild(done_ui_text);

    //to request update
    done_ui_control.addEventListener('click', function () {
      if (active_polygon) {
        setActiveEditable(false); // set editable to false to active polygon
        active_polygon.setOptions({ strokeWeight: 2, fillOpacity: 0.8 });
      }
      updateDatabase(all_polygons);
    });
    //END: DONE BUTTON CONTORL
  }

  /**
   * SAMPLE LIST OF POLYGONS TO DRAW
   */
  let polygon_data = [
    {
      id: 1,
      coords: [
        { lat: 25.774, lng: -79.760187 },
        { lat: 25.774, lng: -61.303156 },
        { lat: 13.674484725552164, lng: -60.55608599999999 },
        { lat: 14.646903, lng: -75.277766 },
        { lat: 14.356673100005045, lng: -85.16546087499998 },
      ],
      color: '#FF0000',
    },
    {
      id: 2,
      coords: [
        { lat: 25.774, lng: -85.101 },
        { lat: 35.406, lng: -85.101 },
        { lat: 35.406, lng: -54.127 },
        { lat: 31.008491575012982, lng: -55.79534337499999 },
        { lat: 25.774, lng: -60.01 },
      ],
      color: '#0000FF',
    },
    {
      id: 3,
      coords: [
        { lat: 25.759886, lng: -61.303156 },
        { lat: 26.155006, lng: -43.109797 },
        { lat: 12.425378, lng: -41.967219 },
        { lat: 13.709568, lng: -60.600031 },
      ],
      color: '#ADFF2F',
    },
  ];

  /**
   * Drawing all the polygon to the map from the the polygon_data Object
   * Creating polygon Object from each polygon_data and
   * Draw it to the map.
   */
  for (let p = 0; p < polygon_data.length; p++) {
    window['gmap_polygon' + p] = new google.maps.Polygon({
      paths: polygon_data[p].coords,
      strokeColor: polygon_data[p].color,
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: polygon_data[p].color,
      fillOpacity: 0.6,
      clickable: true,
      draggable: false,
      editable: false,
      index: p,
      id: polygon_data[p].id,
    });
    window['gmap_polygon' + p].setMap(map);
    all_polygons.push(window['gmap_polygon' + p]);
    // attachPolygonInfoWindow(window['gmap_polygon' + p]);
  }

  function attachPolygonInfoWindow(polygon) {
    // var infoWindow = new google.maps.InfoWindow();
    // google.maps.event.addListener(polygon, 'mouseover', function (e) {
    //   infoWindow.setContent('Polygon Name');
    //   var latLng = e.latLng;
    //   infoWindow.setPosition(latLng);
    //   infoWindow.open(map);
    // });
  }

  /**
   * Initialize all the polygons
   * Add Listeners etc.
   */
  function initPolygons() {
    for (let j = 0; j < all_polygons.length; j++) {
      let cur_polygon = all_polygons[j];

      cur_polygon.addListener('click', function (event) {
        // Set editable state to the current polygon clicked.
        clearAllSelection();
        this.setEditable(true);

        // Assign the clicked polygon to active_polygon
        active_polygon = this;

        console.log(active_polygon);
        active_polygon.setOptions({ strokeWeight: 2, fillOpacity: 0.3 });
      });

      addRemoveListener(cur_polygon); // Add right-click listener to display Delete button to remove a vertex

      let paths = cur_polygon.getPaths();
      for (let p = 0; p < paths.getLength(); p++) {
        google.maps.event.addListener(paths.getAt(p), 'insert_at', (index) => {
          // console.log('We inserted a point', paths.getAt(p));
          last_index = index;
          _previous = null;
          updatePolygons();
        });

        google.maps.event.addListener(paths.getAt(p), 'remove_at', () => {
          // console.log('We removed a point', paths.getAt(p));
          updatePolygons();
        });

        google.maps.event.addListener(paths.getAt(p), 'set_at', (index, previous) => {
          // console.log('We set a point', paths.getAt(p));
          last_index = index;
          _previous = previous;
          updatePolygons();
        });
      }
    }
  }

  /**
   * addListener contextmenu to the active polygon.
   * right-click to the vertex/point will display the delete button to
   * capability to delete/remove a vertex/point
   * @param polygon: (Object) maps polygon object
   */
  function addRemoveListener(polygon) {
    const deleteMenu = new DeleteMenu();
    google.maps.event.addListener(polygon, 'contextmenu', (e) => {
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
    for (let i = 0; i < all_polygons.length; i++) {
      if (i !== active_polygon.index) {
        let intersection_area = calcPolygonIntersection(active_polygon.index, i);
        if (intersection_area) {
          reshapePolygon(map, intersection_area, active_polygon.index, i);
        }
      }
    }
    // $('img[src$="undo_poly.png"]').parent().parent().hide();
  }

  /**
   * Set All polygon editable state to false
   */
  function clearAllSelection() {
    for (let i = 0; i < all_polygons.length; i++) {
      all_polygons[i].setEditable(false);
      all_polygons[i].setOptions({ strokeWeight: 2, fillOpacity: 0.6, strokeOpacity: 0.8 });
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
  function reshapePolygon(map, intersection_area, active_polygon_index, affected_polygon_index) {
    let affected_coords = [
      getCoords(all_polygons[affected_polygon_index]).map((coord) => {
        return [coord.lat, coord.lng];
      }),
    ];

    let affected_polygon = turf.polygon(checkLastCoords(affected_coords));
    let intersection_polygon = turf.polygon(intersection_area);
    let newshape = turf.getCoords(turf.difference(affected_polygon, intersection_polygon));
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
      console.log('Error: Not possible! Will cause to divide the affected polygon causing setting map error');
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
    if (JSON.stringify(coords[0][0]) !== JSON.stringify(coords[0][coords[0].length - 1])) {
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
      };
      return new_pol_data;
    });
    console.log(new_data);
    //Script to update backend here (api request)
  }

  initPolygons();

  let center_control_div = document.createElement('div');
  center_control_div.className = 'map-custom-controls-wrapper';

  // center_control_div.style.columnGap = '5px';
  // center_control_div.style.fontFamily = 'Roboto,Arial,sans-serif';
  // center_control_div.style.fontSize = '16px';
  // center_control_div.style.lineHeight = '38px';
  // center_control_div.style.paddingLeft = '5px';
  // center_control_div.style.paddingRight = '5px';
  let center_control = new CenterControl(center_control_div, map);

  center_control_div.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(center_control_div);
}

initMap();
