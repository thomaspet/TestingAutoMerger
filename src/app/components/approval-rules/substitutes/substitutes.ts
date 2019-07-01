import {Component} from '@angular/core';
import {UniModalService} from '@uni-framework/uni-modal';
import {ApprovalSubstitute} from '@uni-entities';
import {SubstituteModal} from '../modals/substitute-modal/substitute-modal';
import {ErrorService, ApprovalSubstituteService} from '@app/services/services';
import * as moment from 'moment';

@Component({
    selector: 'substitutes',
    templateUrl: './substitutes.html',
    styleUrls: ['./substitutes.sass'],
    host: {class: 'uni-redesign'}
})
export class Substitutes {
    activeSubs: ApprovalSubstitute[];
    futureSubs: ApprovalSubstitute[];

    constructor(
        private errorService: ErrorService,
        private modalService: UniModalService,
        private substituteService: ApprovalSubstituteService,
    ) {
        this.loadData();
    }

    private loadData() {
        const dateFilter = `filter=ToDate ge '${moment().format('YYYY-MM-DD')}'`;

        this.substituteService.GetAll(dateFilter).subscribe(
            res => {
                const subs: ApprovalSubstitute[] = res || [];

                this.activeSubs = subs.filter(sub => moment(sub.FromDate).isBefore(moment()));
                this.futureSubs = subs.filter(sub => moment(sub.FromDate).isAfter(moment()));
            },
            err => console.error(err)
        );
    }

    openSubstituteModal(substitute?: ApprovalSubstitute) {
        this.modalService.open(SubstituteModal, {data: substitute}).onClose.subscribe(updatedSub => {
            if (updatedSub) {
                this.loadData();
            }
        });
    }

    delete(substitute) {
        this.substituteService.Remove(substitute.ID).subscribe(
            () => this.loadData(),
            err => this.errorService.handle(err)
        );
    }
}
