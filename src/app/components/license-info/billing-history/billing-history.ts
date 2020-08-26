import {Component} from '@angular/core';
import {ElsaContractService} from '@app/services/services';
import * as moment from 'moment';
import {LicenseInfo} from '../license-info';
import {UniModalService} from '@uni-framework/uni-modal';
import {ElsaContractTypePipe} from '@uni-framework/pipes/elsaContractTypePipe';
import {theme} from 'src/themes/theme';
import {BillingData} from '@app/models/elsa-models';
import {SettlementsModal} from '../settlements-modal/settlements-modal';

@Component({
    selector: 'license-billing-history',
    templateUrl: './billing-history.html',
    styleUrls: ['./billing-history.sass']
})
export class BillingHistory {
    contractID: number;

    billingHistory: BillingData[];
    filteredHistory: BillingData[];
    searchStr: string;
    hasPermission: boolean;

    constructor(
        private contractService: ElsaContractService,
        private licenseInfo: LicenseInfo,
        private modalService: UniModalService,
        private elsaContractTypePipe: ElsaContractTypePipe,
    ) {
        this.licenseInfo.selectedContractID$.subscribe(id => {
            this.contractID = id;
            this.loadHistory();
        });
    }

    loadHistory() {
        this.contractService.getBillingHistory(this.contractID).subscribe(
            res => {
                this.hasPermission = true;
                this.billingHistory = res;
                this.billingHistory.forEach(history => {
                    history['_period'] = this.setPeriodText(history);
                    history['_plan'] = this.setPlanText(history);
                    history['_order'] = this.setOrderText(history);
                });
                this.filteredHistory = this.billingHistory;
            },
            err => {
                console.error(err);
                if (err.status === 403) {
                    this.hasPermission = false;
                }
            }
        );
    }

    filterHistory() {
        if (this.searchStr) {
            const search = this.searchStr.toLowerCase();
            this.filteredHistory = this.billingHistory.filter(history => {
                return (
                    history['_period'].includes(search)
                    || history['_plan'].toLowerCase().includes(search)
                    || history['_order'].toLowerCase().includes(search)
                    || history.Total.toString().includes(search)
                );
            });
        } else {
            this.filteredHistory = this.billingHistory;
        }
    }

    openSettlements(history: BillingData) {
        this.modalService.open(SettlementsModal, {
            data: {
                settlement: history,
                header: 'Avregning'
            }
        });
    }

    setPeriodText(history: BillingData): string {
        return moment(history.FromDate).format('DD.MM') + ' - ' + moment(history.ToDate).format('DD.MM YYYY');
    }

    setPlanText(history: BillingData): string {
        return theme.appName + ' ' + this.elsaContractTypePipe.transform(history.ContractType);
    }

    setOrderText(history: BillingData): string {
        return 'Avregning ' + moment(history.FromDate).format('MMMM YYYY');
    }
}
