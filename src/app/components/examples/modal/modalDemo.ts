import {Component, ViewChildren, Type, Input, QueryList} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../framework/modals/modal";

@Component({
    selector: "uni-modal-test",
    directives: [NgIf, NgModel, NgFor],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <input [(ngModel)]="tempValue"/>
            <footer>
                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()">
                    {{action.text}}
                </button>
                <button *ngIf="config.hasCancelButton" (click)="config.cancel()">Cancel</button>
            </footer>
        </article>
    `
})
export class UniModalTest {
    @Input('config')
    config;
    tempValue;
}

@Component({
    selector: "uni-modal-demo",
    template: `
        <button (click)="openModal()">Open 1</button>
        <button (click)="openModal2()">Open 2</button>
        {{valueFromModal}}
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
        <uni-modal [type]="type" [config]="modalConfig2"></uni-modal>
    `,
    directives: [UniModal]
})
export class UniModalDemo {
    @ViewChildren(UniModal)
    modalElements: QueryList<UniModal>;

    modals: UniModal[];

    modalConfig: any = {};
    modalConfig2: any = {};

    valueFromModal: string = "";

    modalInstance: UniModalTest;
    modalInstance2: UniModalTest;
    type: Type = UniModalTest;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Modal 1",
            value: "Initial value",
            hasCancelButton: true,
            cancel: () => {
                self.modals[0].close();
            },
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        var content = self.modals[0].getContent();
                        self.valueFromModal = content.tempValue;
                        content.tempValue = "";
                        self.modals[0].close();
                    }
                }
            ]
        };

        this.modalConfig2 = {
            title: "Modal 2",
            value: "Initial value 2",
            hasCancelButton: false,
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        var content = self.modals[1].getContent();
                        self.valueFromModal = content.tempValue;
                        content.tempValue = "";
                        self.modals[1].close();
                    }
                }
            ]
        };
    }

    ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }

    openModal() {
        this.modals[0].open();
    }

    openModal2() {
        this.modals[1].open();
    }
}
