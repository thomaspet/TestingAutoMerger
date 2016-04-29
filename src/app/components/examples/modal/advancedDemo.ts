import {Component, ViewChild, ViewChildren, Type, Input, QueryList, ComponentRef} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../framework/core/componentLoader";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder} from "../../../../framework/forms/builders/uniFormBuilder";
import {UniFieldBuilder} from "../../../../framework/forms/builders/uniFieldBuilder";
import {UNI_CONTROL_DIRECTIVES} from "../../../../framework/controls";
import {FieldType} from "../../../unientities";

@Component({
    selector: 'reusable-component',
    directives: [UniForm],
    template: `
        <uni-form [config]="config">
        </uni-form>
    `
})
export class ReusableComponent {
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

@Component({
    selector: "uni-modal-test",
    directives: [NgIf, NgModel, NgFor, UniComponentLoader],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor="let action of config.actions; #i=index" (click)="action.method()">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class UniModalTest {
    @Input('config')
    config;
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    instance: Promise<ReusableComponent>;

    ngAfterViewInit() {
        var self = this;
        this.ucl.load(ReusableComponent).then((cmp: ComponentRef)=> {
            self.instance = new Promise((resolve)=> {
                resolve(cmp.instance);
            });
        });
    }
}

@Component({
    selector: "uni-modal-demo",
    template: `
        <button (click)="openModal()">Open</button>
        {{valueFromModal}}
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class UniModalAdvancedDemo {
    @ViewChild(UniModal)
    modal: UniModal;
    modalConfig: any = {};

    valueFromModal: string = "";
    type: Type = UniModalTest;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Modal 1",
            value: "Initial value",
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modal.getContent().then((content: UniModalTest)=> {
                            content.instance.then((rc: ReusableComponent)=> {
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
