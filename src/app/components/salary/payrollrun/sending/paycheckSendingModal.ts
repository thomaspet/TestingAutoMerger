import { Component, ViewChild, Type } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { ErrorService } from '../../../../services/services';
import { PaycheckSending } from './paycheckSending';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'paycheck-sending-modal-content',
    templateUrl: './paycheckSendingModal.html'
})
export class PaycheckSendingModalContent {
    @ViewChild(PaycheckSending) public paycheckSending: PaycheckSending;

    constructor(
        private errorService: ErrorService
    ) {

    }
}

@Component({
    selector: 'paycheck-sending-modal',
    template: `<uni-modal [type]='type' [config]='config'></uni-modal>`
})
export class PaycheckSendingModal {
    @ViewChild(UniModal) public modal: UniModal;

    private config: any;
    public type: Type<any> = PaycheckSendingModalContent;

    constructor(
        private router: ActivatedRoute,
        private errorService: ErrorService
    ) {
        this.router.params.subscribe((params) => {
            this.config = {
                actions: {
                    send: {
                        text: 'Send',
                        method: () => {
                            this.emailPaychecks();
                        }
                    },
                    print: {
                        text: 'Skriv ut valgte',
                        method: () => {
                            this.printPaychecks(false);
                        }
                    },
                    printall: {
                        text: 'Skriv ut alle',
                        method: () => {
                            this.printPaychecks(true);
                        }
                    },
                    cancel: {
                        text: 'Lukk',
                        method: () => {
                            this.modal.close();
                        }
                    }
                },
                runID: +params['id']
            };
        });
    }

    public openModal() {
        this.modal.open();
    }

    public printPaychecks(all: boolean) {
        this.modal.getContent().then((component: PaycheckSendingModalContent) => {
            component.paycheckSending.printPaychecks(all);
        });
    }

    public emailPaychecks() {
        this.modal.getContent().then((component: PaycheckSendingModalContent) => {
            component.paycheckSending.emailPaychecks();
        });
    }
}
