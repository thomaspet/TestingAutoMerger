import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniModalService} from './modalService';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-modal-v2',
    templateUrl: './modal.html'
})
export class UniModalV2 implements IUniModal {
    @Input()
    public contentComponent: any;

    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public ok() {
        this.onClose.emit(true);
    }

    public cancel() {
        this.onClose.emit(false);
    }

    public openModal() {
        const modal = this.modalService.open(null, {});
        modal.onClose.subscribe(value => {
            console.log('Modalception: ' + value);
        });
    }
}
