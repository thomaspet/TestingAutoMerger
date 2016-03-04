import {Component, Type, ViewChildren, QueryList, Input, Output, EventEmitter} from "angular2/core";
import {UniModal} from "../../../../framework/modals/modal";
import {NgIf, NgModel, NgFor} from "angular2/common";

@Component({
    selector: "salarytrans-filter-content",
    directives: [NgIf, NgModel, NgFor],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <input type="text" [(ngModel)]="tempValue"/>
            <footer>
                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()">
                    {{action.text}}
                </button>
                <button *ngIf="config.hasCancelButton" (click)="config.cancel()">Cancel</button>
            </footer>
        </article>
    `
})

export class SalarytransFilterContent {
    @Input('config')
    config;
    tempValue;
    filters: any[];
    
    constructor() {
        this.filters = [
            {Ledger: "Aktiv", FilterValue: "Active eq 1"}
            //,{Ledger: "Lønnstype", FilterValue: "PaymentInterval eq 0"}
        ];
    }
}



@Component({
    selector: "salarytrans-filter",
    directives: [UniModal],
    template: `
        <article class="salarytrans-filter">
            <label>Utvalg av ansatte, filtrert etter </label>
            <ul>
                <li *ngFor="#filter of filterValues">
                <button (click)="removeFilter()">{{ filter.Ledger }} X</button>
                </li>
            </ul>
            <button (click)="openModalFilter()">Legg til</button>
            <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
            {{filterResultString}}
        </article>
    `
})

export class SalarytransFilter {
    @ViewChildren(UniModal)
    modalElements: QueryList<UniModal>;
    modals: UniModal[];
    modalConfig: any = {};
    filterValues;
    type: Type = SalarytransFilterContent;
    filterResultString: string;
    @Output() filtStringChange = new EventEmitter<string>();
    
    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Lønnspost filter",
            value: "No value",
            hasCancelButton: true,
            cancel: () => {
                self.modals[0].close();
            },
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modals[0].getContent().then((content) => {
                            self.filterValues = content.filters;
                            self.createResultFilterString();
                            content.tempValue = "";
                            self.filtStringChange.emit(self.filterResultString);
                            self.modals[0].close();
                        });
                    }
                }
            ]
        };
    }
    
    ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }
    
    openModalFilter() {
        this.modals[0].open();
    }
    
    createResultFilterString() {
        this.filterResultString = "";
        for (var index = 0; index < this.filterValues.length; index++) {
            var element = this.filterValues[index];
            this.filterResultString += element.FilterValue + " and ";
        }
        this.filterResultString = this.filterResultString.slice(0,this.filterResultString.length -5);
    }
}