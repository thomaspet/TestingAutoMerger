import {Component, AfterViewInit, QueryList, ViewChildren, Type, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {ActivatedRoute} from '@angular/router';
import {PostingsummaryModalContent, IPostingSummaryModalConfig} from './postingsummaryModalContent';
import {ErrorService} from '../../../services/services';

@Component({
    selector: 'postingsummary-modal',
    templateUrl: './postingsummaryModal.html'
})
export class PostingsummaryModal implements AfterViewInit {

    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    private modals: UniModal[];
    private modalConfig: IPostingSummaryModalConfig;
    public type: Type<any> = PostingsummaryModalContent;

    constructor(
        private route: ActivatedRoute, 
        private errorService: ErrorService) {

        this.modalConfig = {
            title: 'Konteringssammendrag',
            hasCancelButton: true,
            cancel: () => {
                this.modals[0].close();
            },
            actions: [{
                text: 'Bokfør',
                method: () => {
                    this.modals[0].getContent().then((content: PostingsummaryModalContent) => {
                        content.busy = true;
                        content
                            .postTransactions()
                            .finally(() => content.busy = false)
                            .subscribe((success) => {
                            if (success) {
                                this.updatePayrollRun.emit(true);
                                content.showResponseReceipt(success);
                            }
                        }, err => this.errorService.handle(err));
                    });
                }
            }]
        };

    }

    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }

    public openModal() {
        this.modals[0].open();
    }
}
