import {Injectable, SimpleChange} from '@angular/core';
import {BizHttp, UniHttp, RequestMethod} from '@uni-framework/core/http';
import {BusinessRelation, CompanySettings, CompanyType} from '../../unientities';
import {Observable} from 'rxjs';
import {BankAccountService} from '../accounting/bankAccountService';
import {ErrorService} from '../common/errorService';
import {IBrRegCompanyInfo} from '@uni-framework/uni-modal';

@Injectable()
export class BusinessRelationService extends BizHttp<BusinessRelation> {

    constructor(
        http: UniHttp,
        private bankaccountService: BankAccountService,
        private errorService: ErrorService,
    ) {
        super(http);
        this.relativeURL = BusinessRelation.RelativeUrl;
        this.entityType = BusinessRelation.EntityType;
        this.DefaultOrderBy = null;
    }

    public search(searchText: string): Observable<IBrRegCompanyInfo[]> {
        return this.Action(null, 'search-data-hotel', 'searchText=' + searchText, RequestMethod.Get)
            .map(res => {
                if (res && res.Data) {
                    return res.Data.entries || [];
                }
                return [];
            });
    }

    public deleteRemovedBankAccounts(bc: SimpleChange, brInfo: BusinessRelation) {
        if (bc && Array.isArray(bc.previousValue)) {
            bc.previousValue.filter(ba => bc.currentValue.indexOf(ba) === -1).map(ba => {
                if (ba === brInfo.DefaultBankAccount) {
                    brInfo.DefaultBankAccount = null;
                    brInfo.DefaultBankAccountID = null;
                    // Update brInfo first because of delete restriction
                    this.Put(brInfo.ID, brInfo).subscribe(() => {
                        this.bankaccountService.Remove(ba.ID, 'BankAccount').subscribe(() => {}, (err) => {
                            this.errorService.handle(err);
                        });
                    });
                } else if (ba.ID > 0) {
                    this.bankaccountService.Remove(ba.ID, 'BankAccount').subscribe(() => {}, (err) => {
                        this.errorService.handle(err);
                    });
                }
            });
        }
    }

    public updateCompanySettingsWithBrreg(
        companySetting: CompanySettings,
        brregInfo: IBrRegCompanyInfo,
        companyTypes: CompanyType[],
    ) {
        companySetting.CompanyName = brregInfo.navn;
        companySetting.OrganizationNumber = brregInfo.orgnr;
        companySetting.OfficeMunicipalityNo = brregInfo.forradrkommnr;
        companySetting.WebAddress = brregInfo.url;

        const companyType = companyTypes.find(type => {
            return type && type.Name === brregInfo.organisasjonsform;
        });

        if (companyType) {
            companySetting.CompanyTypeID = companyType.ID;
        }

        if (!companySetting.DefaultAddress) {
            companySetting.DefaultAddress = <any> {
                ID: 0,
                _createguid: this.getNewGuid(),
            };
        }

        companySetting.DefaultAddress.AddressLine1 = brregInfo.forretningsadr;
        companySetting.DefaultAddress.PostalCode = brregInfo.forradrpostnr;
        companySetting.DefaultAddress.City = brregInfo.forradrpoststed;
        companySetting.DefaultAddress.Country = brregInfo.forradrland;

        if (brregInfo.tlf) {
            if (!companySetting.DefaultPhone) {
                companySetting.DefaultPhone = <any> {
                    ID: 0,
                    _createguid: this.getNewGuid()
                };
            }

            companySetting.DefaultPhone.Number = brregInfo.tlf;
        }
        return companySetting;
    }
}
