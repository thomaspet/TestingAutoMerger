import {Component, AfterViewInit, QueryList, ViewChildren, Type, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {ActivatedRoute} from '@angular/router';
import {PostingsummaryModalContent} from './postingsummaryModalContent';
import {ErrorService} from '../../../services/services';

@Component({
    selector: 'postingsummary-modal',
    templateUrl: './postingsummaryModal.html'
})
export class PostingsummaryModal implements AfterViewInit {

    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    private modals: UniModal[];
    private modalConfig: any;
    public type: Type<any> = PostingsummaryModalContent;

    constructor(private route: ActivatedRoute, private errorService: ErrorService) {

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
                        content.postTransactions().subscribe((success) => {
                            if (success) {
                                this.updatePayrollRun.emit(true);
                                content.showResponseReceipt(success);
                            }
                        }, err => this.errorService.handle(err),
                        () => content.busy = false);
                    });
                }
            }]
        };

    }

    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
        this.modals[0].createContent();
    }

    public openModal() {
        this.modals[0].getContent().then((modalContent: PostingsummaryModalContent) => {
            modalContent.openModal();
            this.modals[0].open();
        });
    }
}
