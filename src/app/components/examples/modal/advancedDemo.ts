import {Component, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';
import {UniForm} from 'uniform-ng2/main';
import {FieldType} from '../../../unientities';
import {UniFieldLayout} from 'uniform-ng2/main';

@Component({
    selector: 'reusable-component',
    template: `
        <uni-form
            [config]='config'
            [fields]='fields'
            [model]='model'
        ></uni-form>
    `
})
export class ReusableComponent {
    @ViewChild(UniForm)
    form: UniForm;

    model: any = {};

    config: any =  {};

    fields: UniFieldLayout[] = [];

    ngOnInit() {

        var firstName = new UniFieldLayout();
        firstName.FieldSet = 0;
        firstName.Section = 0;
        firstName.Combo = 0;
        firstName.FieldType = FieldType.TEXT;
        firstName.Label = 'First Name';
        firstName.Property = 'FirstName';
        firstName.ReadOnly = false;

        var lastName = new UniFieldLayout();
        lastName.FieldSet = 0;
        lastName.Section = 0;
        lastName.Combo = 0;
        lastName.FieldType = FieldType.TEXT;
        lastName.Label = 'Last Name';
        lastName.Property = 'LastName';
        lastName.ReadOnly = false;

        this.fields = [firstName, lastName];
    }
}

@Component({
    selector: 'uni-modal-test',
    template: `
        <article class='modal-content'>
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <uni-component-loader [type]=""></uni-component-loader>
            <footer>
                <button *ngFor='let action of config.actions; let i=index' (click)='action.method()'>
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
    instance: Promise<ReusableComponent>;
    component: Type<any> = ReusableComponent;
}

@Component({
    selector: 'uni-modal-demo',
    template: `
        <button (click)='openModal()'>Open</button>
        {{valueFromModal}}
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `
})
export class UniModalAdvancedDemo {
    @ViewChild(UniModal)
    modal: UniModal;
    modalConfig: any = {};

    valueFromModal: string = '';
    type: Type<any> = UniModalTest;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: 'Modal 1',
            value: 'Initial value',
            actions: [
                {
                    text: 'Accept',
                    method: () => {
                        self.modal.getContent().then((content: UniModalTest) => {
                            content.instance.then((rc: ReusableComponent) => {
                                const firstName = rc.model.FirstName;
                                const lastName = rc.model.LastName;
                                console.log(firstName, lastName);
                                alert(`${firstName} ${lastName}`);
                            });
                        });
                    }
                },
                {
                    text: 'Cancel',
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
