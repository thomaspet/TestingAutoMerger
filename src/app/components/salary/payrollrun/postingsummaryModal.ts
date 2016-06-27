import { Component, AfterViewInit, QueryList, ViewChildren, Type } from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {PostingsummaryModalContent} from './postingsummaryModalContent';

@Component({
    selector: 'postingsummary-modal',
    templateUrl: 'app/components/salary/payrollrun/postingsummarymodal.html',
    directives: [UniModal]
})
export class PostingsummaryModal implements AfterViewInit {
    
    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    private modals: UniModal[];
    private modalConfig: any;
    private payrollrunID: number;
    private type: Type = PostingsummaryModalContent;
    
    constructor(private rootRouteParams: RootRouteParamsService) {
        if (!this.payrollrunID) {
            this.payrollrunID = +rootRouteParams.params.get('id');
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
            this.modals[0].open();
        });
    }
}
