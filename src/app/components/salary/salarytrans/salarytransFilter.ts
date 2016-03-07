import {Component, Type, ViewChildren, QueryList, Input, Output, EventEmitter} from "angular2/core";
import {UniModal} from "../../../../framework/modals/modal";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniForm, UniFormBuilder, UniFieldBuilder} from "../../../../framework/forms";
import {UNI_CONTROL_DIRECTIVES} from "../../../../framework/controls";
import {FieldType} from "../../../../framework/interfaces/interfaces";

@Component({
    selector: "salarytrans-filter-content",
    directives: [NgIf, NgModel, NgFor, UniForm],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form [config]="formConfig"></uni-form>
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
    filters: any[];
    formConfig: UniFormBuilder;
    
    constructor() {
        this.buildFilterConfig();
    }
    
    buildFilterConfig() {
        var formBuild = new UniFormBuilder();
        var activeField = new UniFieldBuilder()
        .setLabel("Aktiv")
        .setType(UNI_CONTROL_DIRECTIVES[FieldType.COMBOBOX])
        .setKendoOptions({
            dataSource: [{ID:0, Name:"Alle", Value:"0|"}, {ID:1, Name:"Ikke aktiv", Value:"1|Active eq 0"}, {ID:2, Name:"Aktiv", Value:"2|Active eq 1"}],
            dataTextField: "Name",
            dataValueField: "Value"
        })
        
        formBuild.addUniElements(activeField);
        formBuild.hideSubmitButton();
        this.formConfig = formBuild;
    }
}

@Component({
    selector: "salarytrans-filter",
    directives: [UniModal],
    template: `
        <article class="salarytrans-filter">
            <label>Utvalg av ansatte, filtrert etter </label>
            <ul class="horizontal-buttonlist">
                <li *ngFor="#filter of filterValues">
                <button (click)="removeFilter(filter)">{{ filter.Ledger }}</button>
                </li>
            </ul>
            <button (click)="openModalFilter()">Legg til</button>
            <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
        </article>
    `
})

export class SalarytransFilter {
    @ViewChildren(UniModal)
    modalElements: QueryList<UniModal>;
    modals: UniModal[];
    modalConfig: any = {};
    filterValues: any[] = [];
    filterContent;
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
                            self.filterContent = content;
                            self.createResultFilterString();
                            self.modals[0].close();
                        });
                    }
                }
            ]
        };
    }
    
    removeFilter(filter) {
        for (var i = 0; i < this.filterValues.length; i++) {
            if(filter.Ledger === this.filterValues[i].Ledger) {
                this.filterValues.splice(i,1);
            }
            
        }
        this.updateFilterString();
    }
    
    ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }
    
    openModalFilter() {
        this.modals[0].open();
    }
    
    //called when arriving from modal-component
    createResultFilterString() {
        this.filterResultString = "";
        this.filterValues = [];
        for (var index = 0; index < this.filterContent.formConfig.fields.length; index++) {
            var element = this.filterContent.formConfig.fields[index];
            if(element.control._value !== undefined) {
                var splitted = element.control._value.split("|");
                if(splitted[1] !== "") {
                    this.filterResultString += splitted[1] + " and ";
                }
                this.filterValues.push({Ledger: element.kOptions.dataSource[splitted[0]].Name, FilterValue: element.control._value});
            }
        }
        this.sliceAndEmit();
    }
    
    //called when part of filter is removed
    updateFilterString() {
        this.filterResultString = "";
        for (var i = 0; i < this.filterValues.length; i++) {
            var element = this.filterValues[i];
            this.filterResultString += element.FilterValue + " and ";
        }
        this.sliceAndEmit();
    }
    
    //Remove last "and" from filter and fires event
    sliceAndEmit() {
        if(this.filterResultString !== "") {
            this.filterResultString = this.filterResultString.slice(0,this.filterResultString.length -5);
        }
        this.filtStringChange.emit(this.filterResultString);
    }
}