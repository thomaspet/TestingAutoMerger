import {Component, ViewChild, ViewChildren, Type, Input, QueryList} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {EmailModal, PhoneModal, AddressModal} from '../../common/modals/modals';
import {Email, Address, Phone} from '../../../unientities';

@Component({
    selector: 'uni-modal-test',
    template: `
        <article class='modal-content'>
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <input type='text' [(ngModel)]='tempValue'/>
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
    tempValue;

    ngAfterViewInit() {

    }
}

@Component({
    selector: 'uni-modal-demo',
    template: `
        <button (click)='openModal()'>Open 1</button>
        <button (click)='openModal2()'>Open 2</button>
        <button (click)='openEmailModal()'>Open email</button>
        <button (click)='openPhoneModal()'>Open phone</button>
        <button (click)='openAddressModal()'>Open address</button>
        {{valueFromModal}}
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
        <uni-modal [type]='type' [config]='modalConfig2'></uni-modal>
        <email-modal></email-modal>
        <phone-modal></phone-modal>
        <address-modal></address-modal>
    `
})
export class UniModalDemo {
    @ViewChildren(UniModal)
    modalElements: QueryList<UniModal>;
    
    @ViewChild(EmailModal)
    email: EmailModal;
    
    @ViewChild(PhoneModal)
    phone: PhoneModal;
    
    @ViewChild(AddressModal)
    address: AddressModal;

    modals: UniModal[];

    modalConfig: any = {};
    modalConfig2: any = {};

    valueFromModal: string = '';
    type: Type = UniModalTest;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: 'Modal 1',
            value: 'Initial value',
            actions: [
                {
                    text: 'Accept',
                    method: () => {
                        self.modals[0].getContent().then((content)=>{
                            self.valueFromModal = content.tempValue;
                            content.tempValue = '';
                            self.modals[0].close();
                        });
                    }
                },
                {
                    text: 'Cancel',
                    method: () => {
                        self.modals[0].getContent().then((content)=>{
                            content.tempValue = '';
                            self.modals[0].close();
                        });
                    }
                }
            ]
        };

        this.modalConfig2 = {
            title: 'Modal 2',
            value: 'Initial value 2',
            hasCancelButton: false,
            actions: [
                {
                    text: 'Accept',
                    method: () => {
                        self.modals[1].getContent().then((content)=>{
                            self.valueFromModal = content.tempValue;
                            content.tempValue = '';
                            self.modals[1].close();
                        });
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
    
    private openEmailModal() {
        let email: Email = new Email();
        this.email.openModal(email);
    }
    
    private openPhoneModal() {
        let phone: Phone = new Phone();
        this.phone.openModal(phone);
    }
    
    private openAddressModal() {
        let address: Address = new Address();
        this.address.openModal(address);
    }
}
