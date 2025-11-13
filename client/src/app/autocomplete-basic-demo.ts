import { Component } from '@angular/core';
import { ImportsModule } from './imports';
import { AutoComplete } from 'primeng/autocomplete';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
    selector: 'autocomplete-basic-demo',
    templateUrl: './autocomplete-basic-demo.html',
    imports: [ImportsModule],
    standalone: true,
})
export class AutocompleteBasicDemo {
    items: any[] = [];

    value: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map(item => event.query + '-' + item);
    }
}