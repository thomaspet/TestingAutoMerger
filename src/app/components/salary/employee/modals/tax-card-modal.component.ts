import {Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {TaxCardRequestComponent} from './tax-card-request.component';
import {ReadTaxCardComponent} from './read-tax-card.component';
import { Employee } from '@uni-entities';

@Component({
    selector: 'tax-card-modal',
    templateUrl: './tax-card-modal.component.html'
})

export class TaxCardModal implements OnInit, IUniModal, AfterViewInit {
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    @Input() public options: IModalOptions;
    @ViewChild(TaxCardRequestComponent, { static: true }) private taxCardRequest: TaxCardRequestComponent;
    @ViewChild(ReadTaxCardComponent, { static: true }) private readTaxCard: ReadTaxCardComponent;

    public changeEvent: EventEmitter<any>;
    public employee: Employee;
    public needsUpdate: boolean = false;
    constructor() { }

    public ngOnInit() {
        this.employee = this.options.data;
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
        if (this.options.modalConfig.update) {
            this.options.modalConfig.update();
        }
        this.getReceipts();
    }

    public getReceipts() {
        this.readTaxCard.getReceipts();
        this.needsUpdate = true;
    }
}
