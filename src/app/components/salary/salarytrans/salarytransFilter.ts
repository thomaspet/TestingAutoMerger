import {Component, Type, ViewChildren, QueryList, Input, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../framework/forms';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {FieldType} from '../../../../app/unientities';
declare var jQuery;

@Component({
    selector: 'salarytrans-filter-content',
    directives: [UniForm],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form [config]="formConfig"></uni-form>
            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()">
                    {{action.text}}
                </button>
                <button *ngIf="config.hasCancelButton" (click)="config.cancel()">Avbryt</button>
            </footer>
        </article>
    `
})

export class SalarytransFilterContent {
    @Input('config') public config: any;
    private filters: any[] = [];
    private activeFieldFilters: any = [];
    private formConfig: UniFormBuilder;
    
    constructor() {
        this.buildFilterConfig();
    }
    
    private buildFilterConfig() {
        var formBuild = new UniFormBuilder();
        formBuild.hideSubmitButton();
        
        var activeField = new UniFieldBuilder()
        .setLabel('Aktiv')
        .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
        .setKendoOptions({
            dataSource: [
                {name: 'Alle', filter: ''},
                {name: 'Ikke aktiv', filter: 'Active eq 0'},
                {name: 'Aktiv', filter: 'Active eq 1'}
            ],
            dataValueField: 'filter', // blir egentlig ikke brukt, vi setter verdien i select event istedenfor
            dataTextField: 'name',
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var selectedItem = event.sender.dataItem(jQuery(event.item).index());
                this.removeOldFilters();
                this.activeFieldFilters = [];
                this.activeFieldFilters.push(selectedItem);
                this.filters.push(selectedItem);
            }
        });
        
        formBuild.addUniElements(activeField);
        this.formConfig = formBuild;
    }
    
    // Remove old filterparts
    private removeOldFilters() {
        for (var j = 0; j < this.filters.length; j++) {
            var filter = this.filters[j];
            // When more filterfields in uniform, just add for-loop-section here
            for (var i = 0; i < this.activeFieldFilters.length; i++) {
                var activeFilter = this.activeFieldFilters[i];
                if (activeFilter.name === filter.name) {
                    this.filters.splice(j, 1);
                }
            }
        }
    }
}

@Component({
    selector: 'salarytrans-filter',
    directives: [UniModal],
    template: `
        <article class="buttonlist_component">
            <p id="button-list-label-id">Utvalg av ansatte, filtrert etter </p>
            <ul class="filter_buttonlist" aria-labelledby="button-list-label-id">
                <li *ngFor="let filter of filters">
                <button (click)="removeFilter(filter)">{{ filter.name }}</button>
                </li>
            </ul>
            <button [disabled] = "isDisabled" (click)="openModalFilter()">Legg til</button>
            <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
        </article>
    `
})

export class SalarytransFilter {
    @Input() public isDisabled: boolean;
    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    private modals: UniModal[];
    private modalConfig: any = {};
    private filters: any[] = [];
    public type: Type = SalarytransFilterContent;
    private filterResultString: string;
    @Output() private filtStringChange: EventEmitter<string> = new EventEmitter<string>();
    
    constructor() {
        var self = this;
        this.modalConfig = {
            title: 'Lønnsavregning utvalg',
            value: 'No value',
            hasCancelButton: true,
            cancel: () => {
                self.modals[0].close();
            },
            actions: [
                {
                    text: 'OK',
                    method: () => {
                        self.modals[0].getContent().then((content) => {
                            self.filters = content.filters;
                            self.createResultFilterString();
                            self.modals[0].close();
                        });
                    }
                }
            ]
        };
    }
    
    public removeFilter(filter) {
        for (var i = 0; i < this.filters.length; i++) {
            if (filter.name === this.filters[i].name) {
                this.filters.splice(i, 1);
            }
        }
        this.updateFilterString();
    }
    
    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }
    
    public openModalFilter() {
        this.modals[0].open();
    }
    
    // called when arriving from modal-component
    private createResultFilterString() {
        this.filterResultString = '';
        this.filters.forEach((filter) => {
            if (filter.filter !== '') {
                this.filterResultString += filter.filter + ' and ';
            }
        });
        this.sliceAndEmit();
    }
    
    // called when part of filter is removed
    private updateFilterString() {
        this.filterResultString = '';
        for (var i = 0; i < this.filters.length; i++) {
            var element = this.filters[i];
            this.filterResultString += element.filter + ' and ';
        }
        this.sliceAndEmit();
    }
    
    // Remove last 'and' from filter and fires event
    private sliceAndEmit() {
        if (this.filterResultString !== '') {
            this.filterResultString = this.filterResultString.slice(0, this.filterResultString.length - 5);
        }
        this.filtStringChange.emit(this.filterResultString);
    }
}
