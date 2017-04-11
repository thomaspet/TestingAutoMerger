import {
    Component, Type, ViewChild, Input, AfterViewInit, OnChanges, Output, EventEmitter,
    OnInit
} from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { AltinnAuthenticationData } from '../../../../models/AltinnAuthenticationData';
import { AltinnIntegrationService, ErrorService } from '../../../../../app/services/services';


@Component({
    selector: 'altinn-response-modal-content',
    templateUrl: './altinnResponseModalContent.html',
    providers: [AltinnIntegrationService]
})
export class AltinnResponseModalContent implements OnInit {
    @Input()
    private config: AltinnResponseModalConfig;

    private responseMessage: string;

    public busy: boolean;

    constructor(private _altinnService: AltinnIntegrationService, private errorService: ErrorService) {

    }

    public ngOnInit() {
        let context = this.config.context();
        this._altinnService
            .readTaxCard(context.auth, context.receiptID)
            .subscribe((responseMessage: string) => {
                this.responseMessage = responseMessage;
                this.config.update();
            }, err => this.errorService.handle(err));
    }

    public setResponseMessage(message) {
        this.responseMessage = message;
    }
}

type AltinnModalContext = {
    receiptID: number,
    auth: AltinnAuthenticationData
};

type AltinnResponseModalConfig = {
    close: () => void,
    update: () => void,
    context: () => AltinnModalContext
};

@Component({
    selector: 'altinn-response-modal',
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class AltinnResponseModal implements OnChanges, AfterViewInit {
    public config: AltinnResponseModalConfig;
    public type: Type<any> = AltinnResponseModalContent;
    private ready: boolean = false;
    private context: AltinnModalContext;

    @Input() private responseMessage: string = '';

    @Output() public updateTax: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor() {
        this.config = {
            close: () => {
                this.modal.close();
            },
            update: () => {
                this.updateTax.emit(true);
            },
            context: () => this.context
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
        this.context = {
            receiptID: receiptID,
            auth: auth
        };
        this.modal.open();
    }

    public ngAfterViewInit() {
        this.ready = true;
    }
}
