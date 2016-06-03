import {Component, Type, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';

@Component({
    selector: 'get-tax-card-modal-content',
    directives: [],
    providers: [],
    templateUrl: 'app/components/salary/employee/modals/gettaxcardmodalcontent.html'
})
export class GetTaxCardModalContent {
    
}

@Component({
    selector: 'get-tax-card-modal',
    directives: [UniModal],
    providers: [],
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
        <button (click)="openModal()"></button>
    `
})
export class GetTaxCardModal {
    
    @ViewChild(UniModal)
    public modal: UniModal;
    
    constructor() {
        
    }
    
    public openModal() {
        
    }
}
