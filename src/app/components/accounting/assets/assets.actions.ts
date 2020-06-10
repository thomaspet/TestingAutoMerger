import {Injectable, SimpleChanges} from '@angular/core';
import {AssetsStore} from '@app/components/accounting/assets/assets.store';
import {catchError, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {AssetsService} from '@app/services/common/assetsService';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, of, throwError} from 'rxjs';
import {ConfirmActions, IModalOptions, UniConfirmModalV2, UniModalService} from '@uni-framework/uni-modal';
import {RegisterAssetAsSoldModal} from '@app/components/accounting/assets/register-asset-as-sold-modal/register-asset-as-sold-modal';
import {RegisterDepreciationModal} from '@app/components/accounting/assets/register-depreciation-modal/register-depreciation-modal';
import {DeleteAssetModal} from '@app/components/accounting/assets/delete-asset-modal/delete-asset-modal';
import {RegisterAssetAsLostModal} from '@app/components/accounting/assets/register-asset-as-lost-modal/register-asset-as-lost-modal';
import {Asset, AssetStatusCode, LocalDate, SupplierInvoice} from '@uni-entities';
import {AccountService} from '@app/services/accounting/accountService';
import {HttpParams} from '@angular/common/http';
import * as lodash from 'lodash';
import * as moment from 'moment';
import {SupplierInvoiceService} from '@app/services/accounting/supplierInvoiceService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class AssetsActions {

    constructor(
        private store: AssetsStore,
        private assetsService: AssetsService,
        private accountService: AccountService,
        private supplierInvoiceService: SupplierInvoiceService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private browserStorageService: BrowserStorageService
    ) {

    }

    loadAssets(assetType = '', params: HttpParams) {
        return this.assetsService.getAssets(assetType, params).pipe(
            take(1)
        );
    }

    navigateToNewAsset() {
        return this.router.navigateByUrl('/accounting/assets/0');
    }

    getNewAsset() {
        return this.assetsService.getNewAsset();
    }

    getAsset(id: number) {
        return (id ?
            this.assetsService.getAsset(id).pipe(
                take(1),
                switchMap(asset => this.addMonthlyDepreciation(asset)),
                switchMap(asset => this.addTaxDepreciationRateFromGroupCode(asset)),
                switchMap( asset => this.attachFiles(asset)),
                map((asset: Asset) => {
                    asset['_DepreciationStartYear'] = this.calculateDepreciationStartYear(asset);
                    asset['_DepreciationEndDate'] = this.calculateDepreciationEndDate(asset);
                    if (asset.AssetGroupCode === 'X') {
                        asset.AutoDepreciation = false;
                        asset.DepreciationStartDate = null;
                    }
                    return {...asset};
                })
            )
            : this.assetsService.getNewAsset());
    }

    getDepreciationLines(id: number) {
        return this.assetsService.getDepreciationLines(id).pipe(take(1));
    }

    haveAssetsWithDepreciationNotStarted() {
        return this.assetsService.haveAssetsWithDepreciationNotStarted();
    }

    createAsset(supplierInvoiceID: number) {
        return this.assetsService.createAsset(supplierInvoiceID).pipe(
            take(1),
            tap((asset) => {
                asset._createguid = this.assetsService.getNewGuid();
                this.store.currentAsset = asset;
            }),
            switchMap((asset) => this.supplierInvoiceService.Get(supplierInvoiceID, ['JournalEntry', 'JournalEntry.DraftLines'])),
            map((supplierInvoice: SupplierInvoice) => {
                const currentAsset = this.store.currentAsset;
                currentAsset.Name = supplierInvoice.JournalEntry.DraftLines[0].Description;
                currentAsset['_DepreciationStartYear'] = this.calculateDepreciationStartYear(currentAsset);
                currentAsset['_DepreciationEndDate'] = this.calculateDepreciationEndDate(currentAsset);
                currentAsset['_supplierInvoiceID'] = supplierInvoiceID;
                if (currentAsset.AssetGroupCode === 'X') {
                    currentAsset.AutoDepreciation = false;
                    currentAsset.DepreciationStartDate = null;
                }
                return {...currentAsset};
            }),
            switchMap(asset => this.addMonthlyDepreciation(asset)),
            switchMap(asset => this.addTaxDepreciationRateFromGroupCode(asset)),
            switchMap( asset => this.attachFiles(asset, supplierInvoiceID))
        );
    }
    createAssetFromAccountID(accountID: number) {
        return this.assetsService.createAsset(null, accountID).pipe(
            take(1),
            map((asset: Asset) => {
                asset['_DepreciationStartYear'] = this.calculateDepreciationStartYear(asset);
                asset['_DepreciationEndDate'] = this.calculateDepreciationEndDate(asset);
                if (asset.AssetGroupCode === 'X') {
                    asset.AutoDepreciation = false;
                }
                return {...asset};
            }),
            switchMap(asset => this.addMonthlyDepreciation(asset)),
            switchMap(asset => this.addTaxDepreciationRateFromGroupCode(asset))
        );
    }
    setCurrentAsset(asset: Asset) {
        this.store.currentAsset = asset;
        return of(this.store.state.currentAsset);
    }

    markAssetAsDirty() {
        this.store.assetIsDirty = true;
    }

    markAssetAsClean() {
        this.store.assetIsDirty = false;
    }

    getAssetsTypeCounters() {
        return forkJoin([
            this.assetsService.getAssetCountersByType(AssetStatusCode.Active),
            this.assetsService.getAssetCountersByType(AssetStatusCode.Lost),
            this.assetsService.getAssetCountersByType(AssetStatusCode.Sold),
            this.assetsService.getAssetCountersByType(AssetStatusCode.Depreciated),
            this.assetsService.getAssetCountersByType(null),
            this.assetsService.getAssetCountersByType()
        ]).pipe(take(1));
    }

    startDepreciation(asset: Asset) {
        const assetsDoNotShowModalIDs: number[] = this.browserStorageService.getItemFromCompany('assetsDoNotShowModalIDs') || [];
        if (asset.AssetGroupCode === 'X' || assetsDoNotShowModalIDs.includes(asset.ID)) {
            return of(ConfirmActions.CANCEL);
        }
        let source = of(ConfirmActions.ACCEPT);
        if (asset.ID === 0 || !assetsDoNotShowModalIDs.includes(asset.ID)) {
            const modalOptions = {
                header: asset.AutoDepreciation ? 'Automatiske avskrivninger' : 'Start automatiske avskrivninger',
                message: asset.AutoDepreciation ? 'Automatiske avskrivninger er aktivert på denne eiendelen. Avskrivninger frem til ' +
                    'dagens dato vil bli bokført automatisk nå. Fremtidige avskrivninger blir så gjennomført fortløpende'
                    : 'Vil du starte automatiske avskrivninger for denne eiendelen? Avskrivninger frem til dagens dato vil bli bokført' +
                    ' automatisk nå. Fremtidige avskrivninger blir så gjennomført fortløpende.',
                buttonLabels: {
                    accept: asset.AutoDepreciation ? 'Ok' : 'Start med avskrivninger nå',
                    reject: asset.AutoDepreciation ? null : 'Nei',
                    cancel: asset.AutoDepreciation ? null : 'Avbryt'
                }
            };
            source = this.modalService.confirm(modalOptions).onClose;
        }
        if (assetsDoNotShowModalIDs.includes(asset.ID)) {
            source = of(ConfirmActions.CANCEL);
        }
        return source;
    }

    save(asset?: Asset) {
        if (!asset) {
            asset = this.store.currentAsset;
        }
        let source = of(asset);
        if (asset['AccountAccountName']) { // save from table
            source = this.getAsset(asset.ID);
        }
        return source.pipe(
            take(1),
            switchMap(_asset => {
                asset = _asset;
                if(asset.Dimensions) { // save dimensions from object, not from ID.
                    asset.DimensionsID = undefined;
                }
                return this.startDepreciation(_asset);
            }),
            switchMap(result => {
                if (result === ConfirmActions.ACCEPT) {
                    asset.AutoDepreciation = true;
                } else if (result === ConfirmActions.REJECT) {
                    asset.AutoDepreciation = false;
                }
                return this.assetsService.saveAsset(asset).pipe(
                    catchError(err => throwError(err)),
                    take(1),
                    switchMap(_asset => this.addMonthlyDepreciation(_asset)),
                    switchMap(_asset => this.addTaxDepreciationRateFromGroupCode(_asset)),
                    map((_asset: Asset) => {
                        _asset['_DepreciationStartYear'] = this.calculateDepreciationStartYear(_asset);
                        _asset['_DepreciationEndDate'] = this.calculateDepreciationEndDate(_asset);
                        return {..._asset};
                    }),
                    tap(_asset => {
                        if (result !== ConfirmActions.CANCEL) {
                            const assetsDoNotShowModalIDs: number[] = this.browserStorageService
                                .getItemFromCompany('assetsDoNotShowModalIDs') || [];
                            if (!assetsDoNotShowModalIDs.includes(_asset.ID)) {
                                assetsDoNotShowModalIDs.push(_asset.ID);
                            }
                            this.browserStorageService.setItemOnCompany('assetsDoNotShowModalIDs', assetsDoNotShowModalIDs);
                        }
                    }),
                    tap(_asset => this.markAssetAsClean()),
                    tap(_asset => this.store.currentAsset = _asset)
                );
            })
        );
    }

    updateCurrentAssetFromChanges(changes: SimpleChanges) {
        const keys = Object.keys(changes);
        const partialAsset = {};
        keys.forEach(key => lodash.set(partialAsset, key, changes[key].currentValue));
        const currentAsset = this.store.state.currentAsset;
        if (currentAsset.Dimensions && !currentAsset.Dimensions.ID) {
            currentAsset.Dimensions['_createguid'] = this.assetsService.getNewGuid();
        }
        this.store.currentAsset = lodash.merge(currentAsset, partialAsset);
        if (changes['AssetGroupCode']) {
            if (this.store.currentAsset.AssetGroupCode === 'X') {
                const asset = this.store.currentAsset;
                asset.AutoDepreciation = false;
                this.store.currentAsset = <any>{
                    ...asset,
                    DepreciationStartDate: null,
                    _MonthlyDepreciationAmount: 0,
                    _DepreciationEndDate: null,
                    _DepreciationStartYear: null,
                    _TaxDepreciationRate: null
                };
            } else {
                let asset = this.store.currentAsset;
                asset.DepreciationStartDate =  asset.PurchaseDate;
                asset = <any>{
                    ...asset,
                    _DepreciationEndDate: this.calculateDepreciationEndDate(asset),
                    _DepreciationStartYear: this.calculateDepreciationStartYear(asset)
                };
                this.assetsService.calculateMonthlyDepreciation(asset).subscribe(amount => {
                    asset['_MonthlyDepreciationAmount'] = amount;
                    this.store.currentAsset = {...asset};
                    this.addTaxDepreciationRateFromGroupCode(asset)
                        .subscribe(newAsset => this.store.currentAsset = newAsset);
                });
            }
        }
        if (changes['BalanceAccountID'] && changes['BalanceAccountID'].currentValue) {
            const options: IModalOptions = {
                header: 'Oppdatere balansekonto',
                message: 'Vil du oppdatere saldogruppe, avskrivningskonto og levetid også? Noen felt blir beregnet på nytt.'
            };
            this.modalService.open(UniConfirmModalV2, options).onClose.pipe(
                filter(response => response === ConfirmActions.ACCEPT),
                switchMap(response => this.createAssetFromAccountID(changes.BalanceAccountID.currentValue))
            ).subscribe((asset: Asset) => {
                this.store.currentAsset = {
                    ...currentAsset,
                    ...{
                        AssetGroupCode: asset.AssetGroupCode,
                        Lifetime: asset.Lifetime,
                        DepreciationAccountID: asset.DepreciationAccountID,
                        _TaxDepreciationRate: asset['_TaxDepreciationRate'],
                        _DepreciationStartYear: asset['_DepreciationStartYear'],
                        DepreciationStartDate: asset.DepreciationStartDate,
                        _DepreciationEndDate: asset['_DepreciationEndDate'],
                        _MonthlyDepreciationAmount: asset['_MonthlyDepreciationAmount']
                    }
                };
            });
        }
        if (changes['DepreciationStartDate'] || changes['Lifetime'] || changes['NetFinancialValue']) {
            this.assetsService.calculateMonthlyDepreciation(this.store.currentAsset).pipe(
                map(amount => {
                    const asset = this.store.currentAsset;
                    const depreciationEndDate = this.calculateDepreciationEndDate(asset);
                    return {...asset, _MonthlyDepreciationAmount: amount, _DepreciationEndDate: depreciationEndDate};
                })
            ).subscribe(asset => {
                this.store.currentAsset = asset;
            });
        }
        if (changes['ScrapValue']) {
            const asset = this.store.currentAsset;
            this.assetsService.calculateMonthlyDepreciation(asset).subscribe(amount => {
                asset['_MonthlyDepreciationAmount'] = amount;
                this.store.currentAsset = {...asset};
                this.addTaxDepreciationRateFromGroupCode(asset)
                    .subscribe(newAsset => this.store.currentAsset = newAsset);
            });
        }
        return of(null);
    }

    linkFile(ID, fileID) {
        return this.assetsService.linkFile(ID, fileID);
    }

    openRegisterAsSoldModal(asset?: Asset) {
        return this.getAsset(asset.ID).pipe(
            switchMap(_asset => {
                return this.modalService.open(RegisterAssetAsSoldModal, {
                    data: {
                        AssetID: asset.ID,
                        SoldDate: new LocalDate(new Date()),
                        NetFinancialValue: asset.NetFinancialValue,
                        SoldAmount: asset.NetFinancialValue,
                        TaxPercent: null,
                        CustomerID: null
                    }
                }).onClose;
            }),
            switchMap(() => this.getAsset(asset.ID)),
            tap((_asset) => this.store.currentAsset = _asset)
        );
    }
    openRegisterDepreciationModal(asset?: Asset) {
        return this.getAsset(asset.ID).pipe(
            switchMap(_asset => {
                return this.modalService.open(RegisterDepreciationModal, {
                    data: {
                        AssetID: _asset.ID,
                        CurrentNetFinancialValue: _asset.CurrentNetFinancialValue || _asset.NetFinancialValue,
                        DepreciationValue: 0,
                        NewNetFinancialValue: _asset.CurrentNetFinancialValue || _asset.NetFinancialValue,
                        Description: '',
                    }
                }).onClose;
            }),
            switchMap(() => this.getAsset(asset.ID)),
            tap((_asset) => this.store.currentAsset = _asset)
        );
    }
    openDeleteModal(asset?: Asset) {
        return this.modalService.open(DeleteAssetModal, {
            data: { assetID: asset.ID }
        }).onClose.pipe(tap(x => ''));
    }
    openRegisterAsLostModal(asset?: Asset) {
        return this.getAsset(asset.ID).pipe(
            switchMap(_asset => {
                return this.modalService.open(RegisterAssetAsLostModal, {
                    data: {
                        AssetID: asset.ID,
                        DepreciationDate: new LocalDate(new Date()),
                        NetFinancialValue: asset.NetFinancialValue,
                    }
                }).onClose;
            }),
            switchMap(() => this.getAsset(asset.ID)),
            tap((_asset) => this.store.currentAsset = _asset)
        );
    }
    openAskForSaveAssetModal() {
        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer i innstillingene som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.pipe(switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.save().pipe(
                    catchError(err => of(false)),
                    map( val => true)
                );
            }
            return of(confirm !== ConfirmActions.CANCEL);
        }));
    }

    getSupplierInvoiceFiles(supplierInvoiceID) {
        return this.assetsService.getSupplierInvoiceFiles(supplierInvoiceID);
    }

    attachFiles(asset, supplierInvoiceID?) {
        if (!supplierInvoiceID) {
            return this.assetsService.getAssetFiles(asset.ID).pipe(
                map(files => {
                    asset['_files'] = files;
                    return asset;
                })
            );
        } else {
            return this.assetsService.getSupplierInvoiceFiles(supplierInvoiceID).pipe(
                map(files => {
                    asset['_files'] = files;
                    return asset;
                })
            );
        }
    }

    private addMonthlyDepreciation(asset: Asset) {
        if (asset.AssetGroupCode === 'X') {
            return of({...asset, _MonthlyDepreciationAmount: 0});
        }
        return this.assetsService.calculateMonthlyDepreciation(asset).pipe(
            map(amount => {
                return {...asset, _MonthlyDepreciationAmount: amount};
            })
        );
    }

    private addTaxDepreciationRateFromGroupCode(asset: Asset) {
        if (asset.AssetGroupCode === 'X') {
            return of({...asset, _TaxDepreciationRate: 0});
        }
        return this.assetsService.getAssetGroupByCode(asset.AssetGroupCode)
            .pipe(map((group) => {
                return {
                    ...asset,
                    _TaxDepreciationRate: group ? group[0]?.DepreciationRate : 0
                };
            }));
    }

    private calculateDepreciationEndDate(asset: Asset) {
        if (asset.AssetGroupCode === 'X') {
            return null;
        }
        if (!asset.DepreciationStartDate) {
            return null;
        }
        let date = moment(asset.DepreciationStartDate, 'YYYY-MM-DD');
        date = date.add({years: asset.Lifetime / 12}).subtract({month: 1});
        return new LocalDate(date.toDate());
    }

    private calculateDepreciationStartYear(asset: Asset) {
        if (asset.AssetGroupCode === 'X') {
            return null;
        }
        if (!asset.PurchaseDate) {
            return null;
        }
        const date = moment(asset.PurchaseDate, 'YYYY-MM-DD');
        return date.year();
    }
}
