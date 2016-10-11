import {Component, Type, ViewChild, Input, AfterViewInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {AltinnAuthenticationData} from '../../../../models/AltinnAuthenticationData';
import {AltinnCorrespondanceReader} from '../../../../../app/unientities';
import {AltinnIntegrationService} from '../../../../../app/services/services';

declare var _;
@Component({
    selector: 'altinn-response-modal-content',
    templateUrl: 'app/components/salary/employee/modals/altinnResponseModalContent.html',
    providers: [AltinnIntegrationService]
})
export class AltinnResponseModalContent {
    @Input()
    private config: { close: () => void, update: () => void };

    private responseMessage: string = '';

    public busy: boolean;

    constructor(private _altinnService: AltinnIntegrationService) {

    }

    public open(receiptID: number, authData: AltinnAuthenticationData) {
        let taxCardInfo: AltinnCorrespondanceReader = new AltinnCorrespondanceReader();
        taxCardInfo.UserID = authData.userID;
        taxCardInfo.PreferredLogin = authData.preferredLogin;
        taxCardInfo.UserPassword = authData.password;
        taxCardInfo.Pin = authData.pin;
        taxCardInfo.ReceiptID = receiptID;
        this._altinnService.readTaxCard(taxCardInfo).subscribe((responseMessage: string) => {
            this.responseMessage = responseMessage.replace('\r\n', '</br>');
            this.config.update();
        });
    }

    public close() {
        this.responseMessage = '';
    }

    public setResponseMessage(message) {
        this.responseMessage = message;
    }
}

@Component({
    selector: 'altinn-response-modal',
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class AltinnResponseModal implements OnChanges, AfterViewInit {
    public config: { close: () => void, update: () => void };
    public type: Type = AltinnResponseModalContent;
    private ready: boolean = false;

    @Input() private responseMessage: string = '';

    @Output() public updateTax: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor() {
        this.config = {
            close: () => {
                this.modal.close();
                this.modal.getContent().then((component: AltinnResponseModalContent) => {
                    component.close();
                });
            },
            update: () => {
                this.updateTax.emit(true);
            }
        };
    }

    public ngOnChanges() {
        if (this.ready) {
            this.modal.getContent().then((component: AltinnResponseModalContent) => {
                component.setResponseMessage(this.responseMessage);
            });
        }
    }

    public openModal(receiptID: number, auth: AltinnAuthenticationData) {
        this.modal.open();
        this.modal.getContent().then((component: AltinnResponseModalContent) => {
            component.open(receiptID, auth);
        });
    }

    public ngAfterViewInit() {
        this.ready = true;
    }
}
