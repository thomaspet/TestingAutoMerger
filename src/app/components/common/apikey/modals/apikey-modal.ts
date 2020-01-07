import {Component, OnInit, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {ApiKey} from '@uni-entities';
import {ApikeyLine} from '@app/components/common/apikey/apikeyLine';

@Component({
    selector: 'apikey-line-modal',
    templateUrl: './apikey-modal.html'
})

export class ApikeyLineModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild(ApikeyLine, { static: true }) public apikey: ApikeyLine;

    constructor() { }

    public ngOnInit() { }

    public close(needsUpdate = false) {
        this.onClose.next(needsUpdate);
    }

    public saveApikeyLine() {
        this.apikey.saveApikeyLine();
    }
}
