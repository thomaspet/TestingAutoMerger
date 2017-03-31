import { Component, ViewChildren, ChangeDetectorRef, Type, Input, ViewChild, OnInit, EventEmitter, Output } from '@angular/core';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UniModal } from '../../../../../../../framework/modals/modal';


@Component({
    selector: 'select-year-modal-content',
    templateUrl: './yearModal.html'
})
 export class YearModalContent implements OnInit {
     @Input() public config: any;

     private lay$: BehaviorSubject<any>; // fields
     private config$: BehaviorSubject<any>; // config
     private yearModel$: BehaviorSubject<any>; // model
     private model: any = {};
     

     constructor() {
               
     }

     public ngOnInit() {        
        

        this.config$ = new BehaviorSubject({});
        this.config$.next(this.config);

        this.yearModel$ = new BehaviorSubject(this.config);        
        this.lay$ = new BehaviorSubject<any>(this.config$.getValue);
        
        this.createModalConfig();
        
     }

     private createModalConfig()
    {      
        
        let inputYear = new UniFieldLayout();
        inputYear.Label = 'År';        
        inputYear.FieldType = FieldType.TEXT;
        inputYear.ReadOnly = false;
        inputYear.Property = 'chosen';        
        inputYear.EntityType = 'config';
        
        let fieldcheck = new UniFieldLayout();
        fieldcheck.EntityType =  'config';
        fieldcheck.Label = 'Standard for klient';         
        fieldcheck.FieldType = FieldType.CHECKBOX;
        fieldcheck.ReadOnly = false;
        fieldcheck.LookupField = false;
        fieldcheck.Property = 'checkStandard';
    
        this.lay$.next([inputYear, fieldcheck]);
    }

}

export interface ChangeYear {
    year: number;
    checkStandard: boolean;
}

@Component({
    selector: 'select-year-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig" (close)="onClose()" ></uni-modal>`
})
export class YearModal implements OnInit {
    public modalConfig: any = {};
    public type:  Type<any> = YearModalContent;

    @ViewChild(UniModal)
    private modal: UniModal;
    
    @Output() public changeYear: EventEmitter<any> = new EventEmitter<ChangeYear>();
    
    public onClose: () => void = () =>  {
        this.Emit(null); this.close(); 
    }

    public ngOnInit() {
        
    }

    constructor()
    {
        this.modalConfig = {
            title: 'Velg År',            
            chosen: new Date().getFullYear(),
            checkStandard: false,
            cancel: () => {                
                this.Emit(null);                
                this.modal.close();                                
            },            
            disabled: true,
            actions: [{
                text: 'Endre',
                class: 'good',
                enabled: false,
                method: () => {
                    this.modal.getContent().then((ct) => {                         
                         let yr:  ChangeYear = {
                             checkStandard: this.modalConfig.checkStandard,
                             year: parseInt(this.modalConfig.chosen)
                         };
                         this.Emit(yr);
                         this.modal.close();
                         this.close();
                    } );           
                }
            },
            {
                text: 'Avbryt',
                class: 'bad',
                enabled: true,
                method: () => {
                    this.modal.getContent().then((ct) => {                                                  
                         this.Emit(null);
                         this.modal.close();
                    } );           
                }
            }
            ]          
        };
    }


    public Emit(chYr: ChangeYear){
        this.changeYear.emit(chYr);        
    }


    public close(): void {
        this.modal.close();    
    }

    public openModal(){
        this.modal.open();
    }

    public getContent() {
        return this.modalConfig;
    }

}
