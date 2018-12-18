import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'after-activation-modal',
    templateUrl: './after-activation-modal.html',
    styleUrls: ['./after-activation-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class AfterActivationModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router) {}

    navigate(url: string) {
        this.router.navigateByUrl(url).then(() => {
            this.onClose.emit();
        });
    }
}
