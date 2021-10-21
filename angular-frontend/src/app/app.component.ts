import { Component, OnInit } from '@angular/core';
import { DjangoApiService, GhanaGeometry } from './django-api.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'angular-frontend';

  /**
   * Some example options. Replace as needed.
   */
  options: Array<string> = ['A Region', 'S Region', 'D Region', 'F Region'];

  ghanaGeometry: GhanaGeometry
  eventsSubject: Subject<string> = new Subject<string>();

  constructor(
    private api: DjangoApiService
  ) {}

  ngOnInit() {
    this.api.ghanaGeometry$.subscribe((ghanaGeometry) => {
      this.options = ghanaGeometry.regions.map(region => region.name
      );
    });
  }

  onSelect(selection) {
    if (typeof selection != 'object') {
      this.eventsSubject.next(selection);
    }
    console.log('Got selection', selection);
  }
}
