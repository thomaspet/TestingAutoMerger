import {
    Component,
    Input,
    ChangeDetectionStrategy,
    Output,
    EventEmitter
} from '@angular/core';
import {Observable} from 'rxjs';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';

export interface IToolbarSearchConfig {
    lookupFunction: (input: string) => Observable<any[]>;
    itemTemplate: (item) => string;
    initValue: string;
    onSelect: (item) => void;
}

@Component({
    selector: 'uni-toolbar-search',
    template: `
        <autocomplete [options]="autocompleteOptions" (valueChange)="onSelect($event)"></autocomplete>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarSearch {
    @Input() config: IToolbarSearchConfig;
    @Output() close = new EventEmitter();

    autocompleteOptions: AutocompleteOptions;

    ngOnChanges() {
        if (this.config) {
            this.autocompleteOptions = {
                lookup: this.config.lookupFunction,
                displayFunction: this.config.itemTemplate,
                placeholder: this.config.initValue,
                autofocus: true
            };
        }
    }

    onSelect(item) {
        if (item) {
            this.config.onSelect(item);
            this.close.emit();
        }
    }
}
