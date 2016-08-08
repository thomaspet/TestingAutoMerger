import {Component, Input, OnChanges} from '@angular/core';
import {VatCodeGroup, VatReportSummaryPerPost, VatType, Period} from '../../../../unientities';
import {UniCurrencyPipe} from '../../../../pipes/UniCurrencyPipe';
import {ROUTER_DIRECTIVES} from '@angular/router';


@Component({
    selector: 'vat-summary-per-post',
    templateUrl: 'app/components/accounting/vatreport/reportSummary/reportSummary.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [],
    pipes: [UniCurrencyPipe]
})
export class VatSummaryPerPost implements OnChanges {
    public postGroups: VatCodeGroupWithPosts[];

    public absolute: any = Math.abs;
    @Input() public period: Period;
    @Input() private vatTypes: VatType[] = [];
    @Input() private reportSummaryPerPost: VatReportSummaryPerPost[];

    public ngOnChanges() {
        this.postGroups = this.groupVatReportsByVatCodeGroupID(this.reportSummaryPerPost || []);
    }

    private groupVatReportsByVatCodeGroupID(postList: VatReportSummaryPerPost[]): VatCodeGroupWithPosts[] {
        const distinctGroupIDs = this.getObjectValues(
            postList.reduce(
                function(groupList, post) {
                    groupList[post.VatCodeGroupID] = post;
                    return groupList;
                },
                {}
            )
        );
        return distinctGroupIDs
            .map(post => (<VatCodeGroupWithPosts>{
                ID: post.VatCodeGroupID,
                Name: post.VatCodeGroupName,
                No: post.VatCodeGroupNo,
                Posts: postList.filter(p => p.VatCodeGroupID === post.VatCodeGroupID)
            }));
    }

    private getObjectValues(obj: any): any[] {
        return Object.keys(obj).map(key => obj[key]);
    }

    public vatReportSummaryPerPostToVatCode(vatReportSummaryPerPost: VatReportSummaryPerPost): string {
        const vatType = this.vatTypes.find(vt =>
            vt.VatReportReferences.some(vatReport =>
                vatReport.VatPostID === vatReportSummaryPerPost.VatPostID
            )
        );
        if (vatType) {
            return vatType.VatCode;
        }
    }
}

class VatCodeGroupWithPosts extends VatCodeGroup {
    public Posts: VatReportSummaryPerPost[];
}
