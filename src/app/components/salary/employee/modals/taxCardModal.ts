import {Component, Type, ViewChild, Input, Output, OnChanges, AfterViewInit, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {TaxCardRequest} from './taxCardRequest';
import {ReadTaxCard} from './readTaxCard';


@Component({
    selector: 'tax-card-modal-content',
    templateUrl: './taxCardModalContent.html'
})
export class TaxCardModalContent {
    public title: string = '';
    public exitButton: string = '';
    public busy: boolean;
    public sendAltinnVisible: boolean;
    public error: string = '';
    private employeeID: number;

    @Input('config')
    private config: { hasCancelButton: boolean, cancel: () => void, update: () => void };

    @ViewChild(UniForm)
    public uniform: UniForm;

    @ViewChild(TaxCardRequest)
    private taxCardRequest: TaxCardRequest;

    @ViewChild(ReadTaxCard)
    private readTaxCard: ReadTaxCard;

    constructor() {

    }

    public triggerUpdate() {
        this.config.update();
    }

    public updateReceipts() {
        this.readTaxCard.updateReceipts();
    }

    public close() {
        this.taxCardRequest.isActive = false;
        this.taxCardRequest.close();
        this.config.cancel();
    }

    public open() {
        this.taxCardRequest.isActive = true;
        this.readTaxCard.getReceipts();
    }

    public setEmployeeID(empID) {
        this.employeeID = empID;
        if (this.taxCardRequest) {
            this.taxCardRequest.initialize();
        }
    }

}

@Component({
    selector: 'tax-card-modal',
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
    `
})
export class TaxCardModal implements OnChanges, AfterViewInit {
    public type: Type<any> = TaxCardModalContent;
    public config: any = {};

    @Output()
    public updateEvent: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    @ViewChild(UniModal)
    private modal: UniModal;

    @Input() private employeeID: number;

    constructor() {
        this.config = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            },
            update: () => {
                this.triggerUpdate();
            }
        };
    }

    public ngAfterViewInit() {
        this.modal.createContent();
        this.updateEmployeeID();
    }

    public ngOnChanges() {
        if (this.modal && this.modal.component) {
            this.updateEmployeeID();
        }
    }

    private updateEmployeeID() {
        this.modal.getContent().then((modalContent: TaxCardModalContent) => {
            modalContent.setEmployeeID(this.employeeID);
        });
    }

    public triggerUpdate() {
        this.updateEvent.emit(true);
    }

    public openModal() {
        this.modal.open();
        this.modal.getContent().then((modalContent: TaxCardModalContent) => {
            modalContent.open();
        });
    }

}
