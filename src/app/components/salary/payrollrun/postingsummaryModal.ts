import { Component, AfterViewInit, QueryList, ViewChildren, Type, Output, EventEmitter } from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
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
    private payrollrunID: number;
    private type: Type = PostingsummaryModalContent;
    
    constructor(private rootRouteParams: RootRouteParamsService) {
        if (!this.payrollrunID) {
            this.payrollrunID = +rootRouteParams.params['id'];
        }
        
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
                        content.postTransactions().subscribe((success) => {
                            if (success) {
                                this.updatePayrollRun.emit(true);
                                content.showResponseReceipt(success);
                            }
                        });
                    });
                }
            }],
            payrollrunID: this.payrollrunID
        };
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
