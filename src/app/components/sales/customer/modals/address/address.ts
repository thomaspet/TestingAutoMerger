import {Component, ViewChildren, Type, Input, QueryList, ViewChild, ComponentRef} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType} from "../../../../../unientities";

// Reusable address form
@Component({
    selector: 'address-form',
    directives: [UniForm],
    template: `
        <uni-form [config]="config">
        </uni-form>
    `
})
export class AddressForm {
    config: UniFormBuilder;

    @ViewChild(UniForm)
    form: UniForm;

    ngOnInit() {
        this.config = new UniFormBuilder();
        this.config.hideSubmitButton();

        var field1 = new UniFieldBuilder();
        field1
            .setLabel("First Name")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])
            .setModelField("FirstName");

        var field2 = new UniFieldBuilder();
        field2
            .setLabel("Last Name")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])
            .setModelField("LastName");

        this.config.addUniElements(field1, field2);
    }
}

// address modal type
@Component({
    selector: "address-modal-type",
    directives: [NgIf, NgModel, NgFor, UniComponentLoader],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AddressModalType {
    @Input('config')
    config;
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    instance: Promise<AddressForm>;
    
    ngAfterViewInit() {
        var self = this;
        this.ucl.load(AddressForm).then((cmp: ComponentRef)=> {
            self.instance = new Promise((resolve)=> {
                resolve(cmp.instance);
            });
        });
    }
}

// address modal
@Component({
    selector: "address-modal",
    template: `
        <button (click)="openModal()">Open</button>
        {{valueFromModal}}
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class AddressModal {
    @ViewChild(UniModal)
    modal: UniModal;
    modalConfig: any = {};

    valueFromModal: string = "";
    type: Type = AddressModalType;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Modal 1",
            value: "Initial value",
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modal.getContent().then((content: AddressModalType)=> {
                            content.instance.then((rc: AddressForm)=> {
                                console.log(rc.form.form);
                                console.log(rc.form.form.value.FirstName+" "+rc.form.form.value.LastName);
                                alert(rc.form.form.value.FirstName+" "+rc.form.form.value.LastName);
                            });
                        });
                    }
                },
                {
                    text: "Cancel",
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                        });
                    }
                }
            ]
        };
    }

    openModal() {
        this.modal.open();
    }

    openModal2() {
        this.modal.open();
    }
}