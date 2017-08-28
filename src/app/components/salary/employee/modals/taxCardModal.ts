import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { IUniModal, IModalOptions } from '../../../../../framework/uniModal/barrel';
import { TaxCardRequest } from './taxCardRequest';
import {AltinnAuthenticationDataModal} from '../../../common/modals/AltinnAuthenticationDataModal';
@Component({
    selector: 'tax-card-modal',
    templateUrl: './taxCardModal.html'
})

export class TaxCardModal implements OnInit, IUniModal, AfterViewInit {
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    @Input() public options: IModalOptions;
    @ViewChild(TaxCardRequest) private taxCardRequest: TaxCardRequest;
    @ViewChild(AltinnAuthenticationDataModal) public altinnModal: AltinnAuthenticationDataModal;
    private changeEvent: EventEmitter<any>;
    private employeeID: number;
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
        this.onClose.next();
    }
}
