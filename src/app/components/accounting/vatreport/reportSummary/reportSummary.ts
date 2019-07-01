import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {VatCodeGroup, VatReportSummaryPerPost, VatType, Period} from '../../../../unientities';
import {VatReportMessage, ValidationLevel} from '../../../../unientities';

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
    @Input() public isHistoricData: boolean = false;
    @Input() private vatReportID: number = 0;
    @Input() private vatReportMessages: VatReportMessage[];

    public vatReportMessagesImportant: VatReportMessage[];

    public ngOnChanges(changes: SimpleChanges) {
        this.postGroups = this.groupVatReportsByVatCodeGroupID(this.reportSummaryPerPost || []);

        if (changes['vatReportMessages'] && changes['vatReportMessages'].currentValue) {
            this.vatReportMessagesImportant = this.vatReportMessages.filter(x => x.Level === ValidationLevel.Error || x.Level === ValidationLevel.Warning);

            // remove specific message
            this.vatReportMessagesImportant = this.vatReportMessagesImportant.filter(x => {
                return !x.Message.includes('i regnskapet er periodisert før denne momsterminen')
                    && !x.Message.includes('kjør på nytt');
            });
        }
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

        const vatCodesAndAccountNos: Array<string> = [];
        if (vatTypes) {
            vatTypes.forEach(vt => {
                const vatReportReferences = vt.VatReportReferences.filter(
                    vatReport => vatReport.VatPostID === vatReportSummaryPerPost.VatPostID
                );
                vatReportReferences.forEach(
                    vrr => vatCodesAndAccountNos.push(`${vt.VatCode}|${vrr.Account.AccountNumber}`)
                );
            });
        }

        return vatCodesAndAccountNos.join(',');
    }

    public levelToClass(level: ValidationLevel) {
        switch (level) {
            case ValidationLevel.Info:
                return 'success';
            case ValidationLevel.Warning:
                return 'warn';
            case ValidationLevel.Error:
                return 'error';
        }
    }
}

class VatCodeGroupWithPosts extends VatCodeGroup {
    public Posts: VatReportSummaryPerPost[];
}
