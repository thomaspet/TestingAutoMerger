import {Component, ViewChild, Type} from "angular2/core";
import {UniModal} from "../../../../framework/modals/modal";

@Component({
    selector: "uni-modal-test",
    template: `
        <article class="modal-content">
            <h1>Title</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
            in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
            sunt in culpa qui officia deserunt mollit anim id est laborum tempor incididunt.</p>


            <footer>
                 <button type=“button”>Action!</button>
                 <button type=“button” class="bad">Reak havoc</button>
            </footer>
        </article>
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
