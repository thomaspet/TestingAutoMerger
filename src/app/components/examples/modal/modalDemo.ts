import {Component, ViewChild, Type} from "angular2/core";
import {UniModal} from "../../../../framework/modals/modal";

@Component({
    selector: "uni-modal-test",
    template: `
        <p>hi modal</p>
    `
})
export class UniModalTest {
}

@Component({
    selector: "uni-modal-demo",
    template: `
        <button (click)="openModal()"></button>
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class UniModalDemo {
    @ViewChild(UniModal)
    modal: UniModal;

    modalConfig: any = {};
    modalInstance: UniModalTest;
    type: Type = UniModalTest;

    ngAfterViewInit() {
        this.modalInstance = this.modal.getModal();
    }

    openModal() {
        this.modal.open();
    }
}
