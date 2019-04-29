import {Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {TaxCardRequest} from './taxCardRequest';
import {ReadTaxCard} from './readTaxCard';
@Component({
    selector: 'tax-card-modal',
    templateUrl: './taxCardModal.html'
})

export class TaxCardModal implements OnInit, IUniModal, AfterViewInit {
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    @Input() public options: IModalOptions;
    @ViewChild(TaxCardRequest) private taxCardRequest: TaxCardRequest;
    @ViewChild(ReadTaxCard) private readTaxCard: ReadTaxCard;

    public changeEvent: EventEmitter<any>;
    public employeeID: number;
    public needsUpdate: boolean = false;
    constructor() { }

    public ngOnInit() {
        this.employeeID = this.options.data;
        this.changeEvent = this.options.modalConfig.changeEvent;
    }

    public ngAfterViewInit() {
        this.taxCardRequest.isActive = true;
        this.taxCardRequest.initialize();
    }

    public close() {
        this.taxCardRequest.isActive = false;
        this.taxCardRequest.close();
        this.onClose.next(this.needsUpdate);
    }

    public triggerUpdate() {
        this.options.modalConfig.update();
        this.getReceipts();
    }

    public getReceipts() {
        this.readTaxCard.getReceipts();
        this.needsUpdate = true;
    }
}
