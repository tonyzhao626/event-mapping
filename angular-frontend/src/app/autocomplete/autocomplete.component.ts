import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppStateService } from 'src/app/app-state.service';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
})
export class AutocompleteComponent implements OnInit {
  @Input() label: string;
  @Input() options: Array<string> = [];

  @Output() select: EventEmitter<string> = new EventEmitter<string>();

  control = new FormControl();
  filteredOptions: Observable<Array<string>>;

  constructor(private appState: AppStateService) {}

  ngOnInit() {
    this.filteredOptions = this.control.valueChanges.pipe(
      map((input) => {
        input = input.toLowerCase();

        // If the input exactly matches one of the options, emit it
        const exactMatch = this.options.find(
          (option) => input === option.toLowerCase()
        );

        // Note that this emits undefined when there is not an exact match
        this.select.emit(exactMatch);

        // In the autocomplete dropdown, display all options that have the
        // input as a prefix
        return this.options
          .filter((option) => option.toLowerCase().startsWith(input))
          .sort();
      })
    );
  }
}
