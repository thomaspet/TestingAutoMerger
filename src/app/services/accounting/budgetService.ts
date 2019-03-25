import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Budget} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {ResponseContentType} from '@angular/http';

@Injectable()
export class BudgetService extends BizHttp<Budget> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Budget.RelativeUrl;
        this.entityType = Budget.EntityType;
    }

    public getBudgetDetails(id: number, departmentNumber?: number) {
        return super.GetAction(id, 'details', departmentNumber ? `department='${departmentNumber}'-'${departmentNumber}'` : null);
    }

    public getProfitAndLossGrouped(year: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('accounts?action=profit-and-loss-grouped&FinancialYear=' + year)
            .send()
            .map(res => res.json());
    }

    public getExcelTemplate(id) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(`budgets/${id}?action=getexcelbudget`)
            .send({responseType: ResponseContentType.Blob})
            .map(res => new Blob([res._body], { type: 'text/csv' }));
    }

    public importExcelTemplate(id, fileid, departmentID: number = 0) {
        const endpoint = `budgets/${id}?action=excelbudget&fileid=${fileid}&departmentID=${departmentID}`;

        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.json());
    }

    public getEntriesFromBudgetIDAndAccountID(budgetID: number, accountID: number, departmentID?: number) {
        let filter = `BudgetID eq ${budgetID} and accountID eq ${accountID}`;
        if (departmentID) {
            filter += ' and Dimensions.DepartmentID eq ' + departmentID;
        }

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('budgetentries?filter=' + filter  + '&expand=account' + (departmentID ? ',dimensions' : ''))
            .send()
            .map(res => res.json());
    }

    public getEntriesFromBudgetIDAndAccount(budgetID: number, accoutnNumber: number, departmentID?: number) {
        let filter = `BudgetID eq ${budgetID} and Account.AccountNumber eq ${accoutnNumber}`;
        if (departmentID) {
            filter += ' and Dimensions.DepartmentID eq ' + departmentID;
        }

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('budgetentries?filter=' + filter + '&expand=account' + (departmentID ? ',dimensions' : ''))
            .send()
            .map(res => res.json());
    }

    public transitionAction(id: number, action: string) {
        return super.PostAction(id, action);
    }

    public formatbudgetData(data: any[]): any[] {
        const formattedBudget = [];

        data.forEach((line) => {

            const index = formattedBudget.findIndex(f => f.GroupNumber === line.GroupNumber);
            if (index > -1) {

                // Sum for group
                for (let i = 1; i <= 12; i++) {
                    formattedBudget[index]['BudPeriod' + i] += line['BudPeriod' + i];
                    formattedBudget[index]['Period' + i] += line['Period' + i];
                }

                const subIndex = formattedBudget[index].children.findIndex(c => c.GroupNumber === line.SubGroupNumber);

                if (subIndex > -1) {
                    formattedBudget[index].children[subIndex].data.push(line);

                    // Sum for subgroup
                    for (let i = 1; i <= 12; i++) {
                        formattedBudget[index].children[subIndex]['BudPeriod' + i] += line['BudPeriod' + i];
                        formattedBudget[index].children[subIndex]['Period' + i] += line['Period' + i];
                    }
                } else {
                    formattedBudget[index].children.push(this.getNewSubGroupItem(line));
                }

            } else {
                formattedBudget.push(this.getNewGroupItem(line));
            }
        });

        const groupSumLine: any = {
            GroupNumber: 999,
            GroupName: 'SUM',
            BudgetSum: 0,
            isSumCol: true
        };

        // Needs sums
        formattedBudget.forEach(group => {
            for (let i = 1; i <= 12; i++) {
                group.BudgetSum += group['BudPeriod' + i];
                group.PeriodTotal += group['Period' + i];
                groupSumLine['BudPeriod' + i] = groupSumLine['BudPeriod' + i] || 0;
                groupSumLine['BudPeriod' + i] += group['BudPeriod' + i];
                groupSumLine['cls' + i] = groupSumLine['BudPeriod' + i] < 0 ? 'good' : 'bad';
                group['cls' + i] = ((group.GroupNumber === 3 && group['BudPeriod' + i] < 0)
                || (group.GroupNumber !== 3 && group['BudPeriod' + i] < 0)) ? 'good' : 'bad';
            }
            group['cls13'] = ((group.GroupNumber === 3 && group.BudgetSum < 0)
                || (group.GroupNumber !== 3 && group.BudgetSum < 0)) ? 'good' : 'bad';

            groupSumLine.BudgetSum += group.BudgetSum;

            // Add profit/loss text to last line text + correct class to numbers
            if (groupSumLine.BudgetSum < 0) {
                groupSumLine.GroupName = 'RESULTAT    (Overskudd)';
                groupSumLine['cls13'] = 'good';
            } else {
                groupSumLine.GroupName = 'RESULTAT    (Underskudd)';
                groupSumLine['cls13'] = 'bad';
            }

            group.children.forEach(child => {
                for (let i = 1; i <= 12; i++) {
                    child.BudgetSum += child['BudPeriod' + i];
                    child.PeriodTotal += child['Period' + i];
                    child['cls' + i] = ((child.GroupNumber === 3 && child['BudPeriod' + i] < 0)
                        || (child.GroupNumber !== 3 && child['BudPeriod' + i] < 0)) ? 'good' : 'bad';
                }
                child['cls13'] = ((child.GroupNumber === 3 && child.BudgetSum < 0)
                            || (child.GroupNumber !== 3 && child.BudgetSum < 0)) ? 'good' : 'bad';

                child.data.forEach((item) => {
                    for (let i = 1; i <= 12; i++) {
                        item['cls' + i] = ((item.GroupNumber === 3 && item['BudPeriod' + i] < 0)
                            || (item.GroupNumber !== 3 && item['BudPeriod' + i] < 0)) ? 'good' : 'bad';
                    }
                    item['cls13'] = ((item.GroupNumber === 3 && item.BudgetSum < 0)
                            || (item.GroupNumber !== 3 && item.BudgetSum < 0)) ? 'good' : 'bad';
                });
            });
        });
        formattedBudget.push(groupSumLine);

        return formattedBudget;
    }

    // Dummy functions to avoid noise in formatbudgetData function
    public getNewGroupItem(line) {
        const obj: any = {
            GroupNumber: line.GroupNumber,
            GroupName: line.GroupName,
            showSubGroup: false,
            BudgetSum: 0,
            PeriodTotal: 0
        };

        for (let i = 1; i <= 12; i++) {
            obj['BudPeriod' + i] = line['BudPeriod' + i];
            obj['Period' + i] = line['Period' + i];
        }

        obj.children = [ this.getNewSubGroupItem(line) ];

        return obj;
    }

    // Dummy functions to avoid noise in formatbudgetData function
    public getNewSubGroupItem(line) {
        const obj: any = {
            GroupNumber: line.SubGroupNumber,
            GroupName: line.GroupName,
            SubGroupName: line.SubGroupName,
            BudgetSum: 0,
            PeriodTotal: 0,
            showData: false
        };
        for (let i = 1; i <= 12; i++) {
            obj['BudPeriod' + i] = line['BudPeriod' + i];
            obj['Period' + i] = line['Period' + i];
        }

        obj.data = [line];
        return obj;
    }

    public saveEntry(entry) {
        let query;
        if (!entry.ID) {
            query = this.http
                .asPOST()
                .withEndPoint('budgetentries')
                .withBody(entry)
                .send()
                .map(res => res.json());
        } else {
            query = this.http
                .asPUT()
                .withEndPoint('budgetentries/' + entry.ID)
                .withBody(entry)
                .send()
                .map(res => res.json());
        }
        return query;
    }
}
