import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorSource } from 'ol/source';
import OSM from 'ol/source/OSM';
import * as ol from 'ol';
import Point from 'ol/geom/Point';
import * as olProj from 'ol/proj';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

import { DjangoApiService, GhanaGeometry } from 'src/app/django-api.service';
import { AppStateService } from '../app-state.service';

function convertGeoJsonToFeature(geojson) {
  const regionFeatures = new GeoJSON().readFeatures(geojson, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  });

  if (!regionFeatures?.length) {
    console.warn("Couldn't parse GeoJSON", geojson);
    return;
  }

  return regionFeatures[0];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  /**
   * The events that region is selected or deselected.
   */
  @Input() events: Observable<string>;
  private eventsSubscription: Subscription;
  /**
   * The OpenLayers map object.
   */
  map: Map;

  /**
   * The coordinates that the mouse is currently hovering over.
   * As longitude, latitude.
   */
  hoveredCoordinates: [number, number];

  /**
   * An array of coordinates of ongoing flood events. Each value is a
   * pair of a longitude and latitude.
   */
  floodEventCoordinates: Array<[number, number]> = [];

  /**
   * The string of the selected region
   */
  selectedRegion: string = null;
  /**
   * The map layer used by OpenLayers to render the icons.
   */
  floodEventIconLayer: VectorLayer;

  /**
   * An object containing geometry describing the regions of Ghana.
   * See django-api.service.ts for details.
   */
  ghanaGeometry: GhanaGeometry;

  /**
   * The map layer used by OpenLayers to render the currently selected region.
   */
  regionSelectionLayer: VectorLayer;

  constructor(
    private api: DjangoApiService,
    private appState: AppStateService
  ) {}

  /**
   * ngOnInit is called when an Angular component is initialized. It's a
   * lot like a constructor in that way. Full docs here:
   *   https://angular.io/api/core/OnInit#ngoninit
   */
  ngOnInit(): void {
    this.map = new Map({
      // When the map component is initialized, create a map in the div with
      // id="map" (See ./map.component.html)
      target: 'map',

      // Add the OpenStreetMap basemap
      layers: [
        new TileLayer({
          source: new OSM(),
          // Set it to have the lowest Z index so that it displays below other
          // layers
          zIndex: 0,
        }),
      ],

      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Show the latitude and longitude of the point the cursor is hovering over
    this.map.on('pointermove', (event) => {
      this.hoveredCoordinates = olProj.toLonLat(event.coordinate);
    });

    // Print the longitude and latitude to the console when the map is clicked
    this.map.on('click', (event) => {
      const coordinate = olProj.toLonLat(event.coordinate);
      this.api.addMarker({lat: coordinate[0], lng: coordinate[1]})
        .subscribe((result)=> {
          this.updateEventIconLayersByMarkers();
        })
      console.log('Clicked on coordinate', coordinate);
    });

    // Draw an outline around Ghana
    this.addGhanaOutlineLayer();

    // Display the icons indicating a flood
    this.api.getMarkers(this.selectedRegion)
      .subscribe((result)=> {
        this.floodEventCoordinates = result.map((item) => [item.lat, item.lng]);
        this.updateFloodEventIconLayer();
      });

    // Draw an outline around a specific region within Ghana.
    this.eventsSubscription = this.events.subscribe((selected_region) => {
      if (typeof selected_region == 'string') {
        this.selectedRegion = selected_region;
        this.api.ghanaGeometry$.subscribe((ghanaGeometry) => {
          const accraRegion = ghanaGeometry.regions.find(
            (region) => region.name == selected_region
          );
    
          const accraRegionFeature = convertGeoJsonToFeature(accraRegion.geometry);
    
          this.updateRegionSelectionLayer(accraRegionFeature);
          this.updateEventIconLayersByMarkers();
        });
      } else {
        this.selectedRegion = null;
        this.updateRegionSelectionLayer(null);
        this.updateEventIconLayersByMarkers();
      }
    });
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  /**
   * Get markers from API with selected region string and update flood event icon layer
   */
  updateEventIconLayersByMarkers(): void {
    this.api.getMarkers(this.selectedRegion)
      .subscribe((result)=> {
        this.floodEventCoordinates = result.map((item) => [item.lat, item.lng]);
        this.updateFloodEventIconLayer();
      });
  }
  /**
   * Updates the flood event icon layer to reflect the coordinates in
   * `this.floodEventCoordinates`.
   */
  updateFloodEventIconLayer(): void {
    // Remove existing layer if there is one
    if (this.floodEventIconLayer != null) {
      this.map.removeLayer(this.floodEventIconLayer);
    }

    let coordinates = this.floodEventCoordinates;

    // Convert coordinates to icons
    const iconFeatures = coordinates.map(
      ([longitude, latitude]) =>
        new ol.Feature({
          geometry: new Point(
            olProj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')
          ),
        })
    );

    // Add the new layer
    this.floodEventIconLayer = new VectorLayer({
      source: new VectorSource({
        features: iconFeatures,
      }),

      style: new Style({
        image: new Icon({
          opacity: 0.8,
          src: 'assets/flood-icon.svg',
        }),
      }),

      // Set it to have the highest Z index of all the layers so that the icons
      // are displayed above the other layers
      zIndex: 2,
    });

    this.map.addLayer(this.floodEventIconLayer);
  }

  /**
   * Highlights the passed region on the map. Pass `null` to deselect.
   */
  updateRegionSelectionLayer(regionFeature) {
    // Remove existing layer if there is one
    if (this.regionSelectionLayer != null) {
      this.map.removeLayer(this.regionSelectionLayer);
    }

    if (regionFeature == null) {
      return;
    }

    // Add the new layer
    this.regionSelectionLayer = new VectorLayer({
      source: new VectorSource({
        features: [regionFeature],
      }),

      // Set it to have a higher Z index than the basemap
      zIndex: 1,
    });

    this.map.addLayer(this.regionSelectionLayer);
  }

  /**
   * Load the Ghana geometry and add it to the map.
   *
   * Hint: It's unlikely that you'll need to modify this code.
   */
  addGhanaOutlineLayer() {
    this.api.ghanaGeometry$.subscribe((ghanaGeometry) => {
      this.ghanaGeometry = ghanaGeometry;

      const ghanaFeature = {
        type: 'Feature',
        geometry: ghanaGeometry.country.geometry,
      };

      const ghanaGeoJSON = {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:4326',
          },
        },
        features: [ghanaFeature],
      };

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(ghanaGeoJSON, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          }),
        }),
      });

      // Add the layer containing the Ghana geometry to the map
      this.map.addLayer(vectorLayer);

      // Pan and zoom the map to display the full extent of Ghana
      this.map.getView().fit(vectorLayer.getSource().getExtent(), {
        // From the documentation for View.fit:
        //   "The size is pixel dimensions of the box to fit the extent into.
        //    In most cases you will want to use the map size, that is
        //    map.getSize()."
        // https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
        size: this.map.getSize(),

        // Add some padding around Ghana so it doesn't touch the boarders
        padding: [15, 15, 15, 15],
      });
    });
  }
}
