//import {Component, Type, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import { Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, Type } from '@angular/core';
import {UniModal} from '../../../../../../../framework/modals/modal';


@Component({
    selector: 'test-modal-content',
    template: '<H2>hello</H2>'
})
export class TestModalContent {
    
    
};


@Component({
    selector: 'uni-modal-test',
    template: `<uni-modal [type]="type" [config]="modalConfig" close="close()"></uni-modal>`
})
export class TestModal {
    @ViewChild(UniModal) private modal: UniModal;
    private modalConfig: {
        hasCancelButton: boolean,
        cancel: () => void,
        submit: () => void
    };

    public type: Type<any> = TestModalContent;
    

    constructor(){
        this.modalConfig = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            },
            submit: () => {
                this.modal.close();
            }
        }
    }

    public openModal(){
        this.modal.open();
    }
}
