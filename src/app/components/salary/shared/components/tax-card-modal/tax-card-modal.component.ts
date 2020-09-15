import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import { Employee } from '@uni-entities';
import { IUniTab } from '@uni-framework/uni-tabs';
import { UniTranslationService } from '@app/services/services';

@Component({
    selector: 'tax-card-modal',
    templateUrl: './tax-card-modal.component.html',
    styleUrls: ['./tax-card-modal.component.sass']
})

export class TaxCardModal implements OnInit, IUniModal {
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    @Input() public options: IModalOptions;
    activeTab = 0;
    needsUpdate: boolean;

    public employee: Employee;
    tabs: IUniTab[] = [
        {
            name: this.translationService.translate('SALARY.TAX_CARD_REQUEST.HEADER'),
            onClick: () => this.activeTab = 0,
        },
        {
            name: this.translationService.translate('SALARY.READ_TAX_CARD.HEADER'),
            onClick: () => this.activeTab = 1,
        }
    ];
    constructor(private translationService: UniTranslationService) { }

    public ngOnInit() {
        this.employee = this.options.data;
    }

    public close(needsUpdate: boolean = this.needsUpdate) {
        this.onClose.next(needsUpdate);
    }
}
