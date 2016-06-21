import {Component, Input, Output} from '@angular/core';
import {UniModal} from "../../../../framework/modals/modal";

export enum confirmResult {
    cancel = 0,
    yes = 1,
    no = 2
}

@Component({
    selector: 'confirm-modal',
    template: `
        <dialog class="uniModal" *ngIf="isOpen">
            <article class="modal-content">
                {{message}}
            </article>
            <footer>
                <button *ngFor="let action of config.actions" (click)="action.method()">
                    {{action.text}}
                </button>
            </footer>
        </dialog>
    `
})
export class LoginModal {
    @Input('message')
    message:string;

    @Output('result')
    result:confirmResult;

    isOpen = false;

    actions = [
        { text: 'Ja', method: ()=>{ this.action(confirmResult.yes)} },
        { text: 'Nei', method: ()=> { this.action(confirmResult.no)} },
        { text: 'Avbryt', method: ()=> { this.action(confirmResult.cancel)}}
    ]

    constructor() {} 

    private action(result:confirmResult = 0) {
        this.result = result;
        this.isOpen = false;
    }
    
}