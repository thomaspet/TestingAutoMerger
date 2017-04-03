import {Component, Input, OnChanges} from '@angular/core';
import {VatCodeGroup, VatReportSummaryPerPost, VatType, Period} from '../../../../unientities';


@Component({
    selector: 'vat-summary-per-post',
    templateUrl: './reportSummary.html'
})
export class VatSummaryPerPost implements OnChanges {
    public postGroups: VatCodeGroupWithPosts[];

    public absolute: any = Math.abs;
    @Input() public period: Period;
    @Input() private vatTypes: VatType[] = [];
    @Input() private reportSummaryPerPost: VatReportSummaryPerPost[];
    @Input() private isHistoricData: boolean = false;

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
                Posts:
                    postList
                        .filter(p => p.VatCodeGroupID === post.VatCodeGroupID)
                        .sort((a, b) => (+a.VatPostNo) - (+b.VatPostNo))
            }));
    }

    private getObjectValues(obj: any): any[] {
        return Object.keys(obj).map(key => obj[key]);
    }

    public vatReportSummaryPerPostToVatCodeAndAccountNo(vatReportSummaryPerPost: VatReportSummaryPerPost): string {
        const vatTypes = this.vatTypes.filter(vt =>
            vt.VatReportReferences.some(vatReport =>
                vatReport.VatPostID === vatReportSummaryPerPost.VatPostID
            )
        );

        // build string containing combination of vatcode and accountnumber for this vatpost, the result
        // will e.g. be "1|2711,3|2710,5|2702,..."

        let vatCodesAndAccountNos: Array<string> = [];
        if (vatTypes) {
            vatTypes.forEach(vt => {
                let vatReportReferences = vt.VatReportReferences.filter(vatReport => vatReport.VatPostID === vatReportSummaryPerPost.VatPostID)
                vatReportReferences.forEach(vrr => vatCodesAndAccountNos.push(`${vt.VatCode}|${vrr.Account.AccountNumber}`));
            });
        }

        return vatCodesAndAccountNos.join(',');
    }
}

class VatCodeGroupWithPosts extends VatCodeGroup {
    public Posts: VatReportSummaryPerPost[];
}
