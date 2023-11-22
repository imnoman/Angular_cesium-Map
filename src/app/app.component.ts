import { Component } from '@angular/core';
import { Resource } from 'cesium';
import OLCesium from 'olcs/OLCesium';
import * as Cesium from 'cesium';
import TileWMS from 'ol/source/TileWMS';
import * as ol from 'ol';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { get as getProjection } from 'ol/proj';
import { getTopLeft, getWidth } from 'ol/extent';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'testing_v1';
  ol3d: any;

  ngOnInit() {
    const projection = getProjection('EPSG:3857');
    if (projection) {
      const projectionExtent = projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      const resolutions = new Array(14);
      const matrixIds = new Array(14);
      for (let z = 0; z < 14; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
    }

    const franeWMSSource = new TileWMS({
      url: 'https://idrogeo.isprambiente.it/geoserver/wms',
      params: { LAYERS: 'idrogeo:frane', TILED: true },
      serverType: 'geoserver',
      transition: 0,
    });

    const map = new ol.Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
              '?apikey=d0e7a9bd1a044caf82fc228e67d09f36',
          }),
        }),
        new TileLayer({
          opacity: 0.7,
          source: franeWMSSource,
        }),
      ],
      target: 'map',
      view: new ol.View({
        center: [-472202, 7530279],
        zoom: 12,
      }),
    });

    const ol2d = map;
    this.ol3d = new OLCesium({ map: ol2d });
    const scene = this.ol3d.getCesiumScene();

    // Load Cesium terrain
    this.loadCesiumTerrain(scene);
    this.ol3d.setEnabled(true); // Commented out to avoid automatic enabling of 3D


  }


  async loadCesiumTerrain(scene: any) {
    try {
      const terrainProvider = await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl("https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer", {
        token: "KED1aF_I4UzXOHy3BnhwyBHU4l5oY6rO6walkmHoYqGp4XyIWUd5YZUC1ZrLAzvV40pR6gBXQayh0eFA8m6vPg.."
      });
      scene.terrainProvider = terrainProvider;
    } catch (error) {
      window.alert(`Failed to load terrain. ${error}`);
    }
  }


  toggle3D() {
    console.log('Before Toggle:', this.ol3d.getEnabled());
    this.ol3d.setEnabled(!this.ol3d.getEnabled());
    console.log('After Toggle:', this.ol3d.getEnabled());
  }
}
