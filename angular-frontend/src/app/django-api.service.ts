import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface NamedGeometry {
  name: string;
  geometry: any;
}

export interface GhanaGeometry {
  country: NamedGeometry;
  regions: Array<NamedGeometry>;
}

export interface Coordinate {
  lat: number
  lng: number
}

@Injectable({
  providedIn: 'root',
})
export class DjangoApiService {
  // An Observable for the geometry of Ghana. Observables are a tool for async
  // programming in Angular. See the docs here if you need more info:
  //   https://angular.io/guide/observables
  ghanaGeometry$: Observable<GhanaGeometry> = this.http
    // Issue a GET request to the Django server
    .get(environment.djangoUrl + '/ghana-geometry')
    .pipe(
      // Use `response` as if it had type `GhanaGeometry`
      map((response) => response as GhanaGeometry),

      // `shareReplay(1)` is a way of caching the response
      shareReplay(1)
    );

  // The HttpClient is automatically supplied through dependency injection
  constructor(private http: HttpClient) {}

  /*********************************************************************
   *                                                                   *
   *   **************************!!!!!!!****************************   *
   *   **                                                         **   *
   *   **  HINT: This is a good place for you to define more      **   *
   *   **    requests to the Django server.                       **   *
   *   **                                                         **   *
   *   *************************************************************   *
   *                                                                   *
   *********************************************************************/

  /**
   * Implement this method, which should return a list of locations of flood
   * events from the backend.
   */
  getMarkers(region) {
    // // You'll likely need to use this function to query the Django backend.
    if (region) {
      const params = new HttpParams().set("region", region);
      return this.http.get(environment.djangoUrl + '/events', {params: params})
        .pipe(map((response) => response as Array<Coordinate>))
    }
    return this.http.get(environment.djangoUrl + '/events')
        .pipe(map((response) => response as Array<Coordinate>))
  }

  /**
   * Implement this method, which should submit a new flood event location to
   * the backend
   */
  addMarker(coordinate: Coordinate): Observable<Coordinate> {
    return this.http.post<Coordinate>(environment.djangoUrl + '/events', coordinate)
      .pipe(map((response) => response as Coordinate))
  }
}
