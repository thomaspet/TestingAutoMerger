import { Component, AfterViewInit, QueryList, ViewChildren, Type, Output, EventEmitter } from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {ActivatedRoute} from '@angular/router';
import {PostingsummaryModalContent} from './postingsummaryModalContent';

@Component({
    selector: 'postingsummary-modal',
    templateUrl: 'app/components/salary/payrollrun/postingsummaryModal.html',
    directives: [UniModal]
})
export class PostingsummaryModal implements AfterViewInit {

    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    private modals: UniModal[];
    private modalConfig: any;
    public type: Type = PostingsummaryModalContent;

    constructor(private route: ActivatedRoute) {

        this.route.params.subscribe(params => {
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
                                content.busy = false;
                            }, error => {
                                content.busy = false;
                                content.log(error);
                            });
                        });
                    }
                }],
                payrollrunID: +params['id']
            };
        });

    }

    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }

    public openModal() {
        this.modals[0].getContent().then((modalContent: PostingsummaryModalContent) => {
            modalContent.openModal();
            this.modals[0].open();
        });
    }
}
