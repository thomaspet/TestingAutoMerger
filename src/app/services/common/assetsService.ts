import {Injectable} from '@angular/core';
import {BizHttp, RequestMethod, UniHttp} from '@uni-framework/core/http';
import {forkJoin, Observable, of, Subject, throwError} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {Asset, AssetStatusCode, LocalDate, StatusCode, SupplierInvoice} from '@uni-entities';
import {StatisticsService} from '@app/services/common/statisticsService';
import {HttpParams} from '@angular/common/http';
import {ErrorService} from '@app/services/common/errorService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {RegisterAssetModal} from '@app/components/common/modals/register-asset-modal/register-asset-modal';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces.ts';
import {UniModalService} from '@uni-framework/uni-modal/modalService.ts';
import {Router} from '@angular/router';
import {FileService} from '@app/services/common/fileService';
import {AccountService} from '@app/services/accounting/accountService';

@Injectable()
export class AssetsService extends BizHttp<Asset>{
    relativeURL = 'assets';
    entityType = 'Asset';
    assetGroupCodes: any[] = null;
    constructor(
        public http: UniHttp,
        private accountService: AccountService,
        private statistics: StatisticsService,
        private errorService: ErrorService,
        private toast: ToastService,
        private router: Router,
        private modalService: UniModalService,
        private fileService: FileService
    ) {
        super(http);
    }

    createAsset(invoiceID?: number, accountID?: number, accountNumber?: number) {
        const query = [`invoiceID=${invoiceID}`];
        if (accountID) {
            query.push(`accountID=${accountID}`);
        }
        if (accountNumber) {
            query.push(`accountNumber=${accountNumber}`);
        }
        return this.PostAction(null, 'create', query.join('&'));
    }

    getAssets(assetType: string = '', urlParams: HttpParams) {
        let statusCodeFilter = '';
        switch (assetType.toLowerCase()) {
            case 'aktive': statusCodeFilter = 'asset.StatusCode eq ' + AssetStatusCode.Active;
                break;
            case 'solgte': statusCodeFilter = 'asset.StatusCode eq ' + AssetStatusCode.Sold;
                break;
            case 'avskrevet': statusCodeFilter = 'asset.StatusCode eq ' + AssetStatusCode.Depreciated;
                break;
            case 'tapte': statusCodeFilter = 'asset.StatusCode eq ' + AssetStatusCode.Lost;
                break;
            case 'kladd': statusCodeFilter = 'isnull(asset.StatusCode, 0) eq 0';
                break;
        }
        let params = urlParams;

        if (params === null) {
            params = new HttpParams();
        }

        if (!params.get('filter')) {
            if (statusCodeFilter) {
                params = params.set('filter', `${statusCodeFilter}`);
            }
        }  else if (params.get('filter')) {
            if (statusCodeFilter){
                params = params.set('filter', params.get('filter') + ` and (${statusCodeFilter})`);
            }
        }
        if (!params.get('orderby')) {
            params = params.set('orderby', 'ID desc');
        }
        params = params.set('model', 'asset');
        params = params.set('select',
            'Asset.ID as ID,Asset.Name as Name,Asset.AssetGroupCode as AssetGroupCode,Asset.PurchaseDate as PurchaseDate,Asset.PurchaseAmount as PurchaseAmount,' +
            'Asset.Lifetime as Lifetime,Asset.DepreciationStartDate as DepreciationStartDate,Asset.NetFinancialValue as NetFinancialValue,' +
            'Asset.StatusCode as StatusCode,sum(JournalEntryLine.Amount) as DepreciationAmount,' +
            'max(JournalEntryLine.FinancialDate) as DepreciatedTo,Asset.AutoDepreciation as AutoDepreciation,' +
            'Account.AccountName,Account.AccountNumber'
        );
        params = params.set('join', 'Asset.ID eq DepreciationLine.AssetID and DepreciationLine.DepreciationJELineID eq JournalEntryLine.ID' +
            ' and Asset.BalanceAccountID eq Account.ID');
        return this.statistics.GetAllByHttpParams(params).pipe(
            catchError((err, obs) => this.errorService.handleRxCatch(err, obs))
        );
    }

    getAssetCountersByType(code?: number | null) {
        let statusCode = '';
        if (code) {
            statusCode = `&filter=asset.StatusCode eq ${code}`;
        } else if (code === null) {
            statusCode = `&filter=isnull(asset.StatusCode, 0) eq 0`;
        }
        return this.statistics.GetAllUnwrapped(`model=Asset&select=count(asset.ID) as count${statusCode}`)
            .pipe(map(x => x[0].count));
    }

    getAsset(id: number) {
        return this.Get(id);
    }

    getDepreciationLines(id: number) {
        return this.statistics.GetAllUnwrapped([
            'model=depreciationline',
            'select=depreciationline.ID as ID,'
            + 'depreciationJELine.JournalEntryID as JournalEntryID,'
            + 'depreciationJELine.JournalEntryNumber as JournalEntryNumber,'
            + 'depreciationJELine.FinancialDate as FinancialDate,'
            + 'depreciationJELine.Description as Description,'
            + 'depreciationJELine.AmountCurrency as AmountCurrency,'
            + 'depreciationJELine.FinancialDate as FinancialDate,'
            + 'DepreciationJELine.Account.*',
            `filter=depreciationline.AssetID eq ${id}`,
            'expand=DepreciationJELine,DepreciationJELine.Account'
        ].join('&'));
    }

    getNewAsset() {
        const asset = new Asset();
        asset._createguid = this.getNewGuid();
        return of(asset).pipe(take(1));
    }

    haveAssetsWithDepreciationNotStarted() {
        return this.statistics.GetAllUnwrapped(
            `model=asset&select=count(ID) as NumberOfNotStartedAssets&filter=isnull(DepreciationStartDate,'') eq ''
            and asset.AutoDepreciation ne 1 and Asset.StatusCode eq ${AssetStatusCode.Active} and Asset.AssetGroupCode ne 'X'`
        ).pipe(map(result => result[0].NumberOfNotStartedAssets > 0));
    }

    getAssetGroups(filter?: string) {
        let source$;
        if (this.assetGroupCodes) {
            source$ = of(this.assetGroupCodes);
        } else {
            source$ = this.GetAction(null, 'get-asset-groups').pipe(
                tap((data) => this.assetGroupCodes = data)
            );
        }
        return source$.pipe(
            map((groups: any[]) => groups.filter(group => group.Name.toLowerCase().includes(filter.toLowerCase())))
        );
    }

    getAssetGroupByCode(code: string) {
        if (!code) {
            return of([]);
        }
        let source$;
        if (this.assetGroupCodes) {
            source$ = of(this.assetGroupCodes);
        } else {
            source$ = this.GetAction(null, 'get-asset-groups').pipe(
                tap((data) => this.assetGroupCodes = data)
            );
        }
        return source$.pipe(
            map((groups: any[]) => groups.find(group => group.Code === code)),
            map(group => group ? [group] : [])
        );
    }

    calculateMonthlyDepreciation(asset: Asset) {
        if (
            !asset?.NetFinancialValue
            || !asset?.Lifetime
            || !asset?.DepreciationStartDate
        ) {
            return of(0);
        }
        return this.ActionWithBody(null, asset, 'calculate-depreciation-amount', RequestMethod.Put)
            .pipe(catchError(() => of(0)));
    }

    caluculateLifetime(asset: Asset) {
        if (
            !asset?.AssetGroupCode
            || !asset?.PurchaseDate
            || !asset?.DepreciationStartDate
        ) {
            return of(null);
        }
        return this.ActionWithBody(null, asset, 'calculate-lifetime', RequestMethod.Put)
            .pipe(catchError(() => of(0)));
    }

    saveAsset(asset: Asset) {
        let source;
        if (asset.ID > 0) {
            source = this.Put(asset.ID, asset);
        } else {
            asset.ID = undefined;
            source = this.Post(asset);
        }
        return this.checkIfBalanceIsOk(asset).pipe(
            switchMap((isBalanceOk) => {
                if (!isBalanceOk) {
                    return this.accountService.getSaldoInfo(asset.BalanceAccountID).pipe(
                        tap(info => {
                            const message = `Saldo på balansekonto ${info.AccountNumber} er kr ${info.Saldo},- og dekker ikke verdien til eiendelen. ` +
                                `Husk at kjøpet må bokføres i regnskapet før man oppretter eiendelen.`;
                            this.toast.addToast(
                                'Saldo på balansekontoen dekker ikke verdien til eiendelen.', ToastType.warn, 5, message
                            );
                        }),
                        switchMap(() => source)
                    );
                }
                return source;
            }),
            switchMap((_asset: Asset) => {
                const calls = [];
                if (!asset.ID && _asset.ID !== 0 && asset['_files']?.length) {
                    asset['_files'].forEach(file => calls.push(this.linkFile(_asset.ID, file.ID)));
                    _asset = Object.assign({}, asset, _asset);
                    if (calls.length) {
                        return forkJoin(calls).pipe(
                            catchError((err) => of(_asset)),
                            take(1),
                            switchMap(() => of(_asset))
                        );
                    }
                    return of(_asset);
                }
                return of(_asset);
            }),
            switchMap( _asset => {
                if (!_asset['_files']?.length) {
                    return of(_asset);
                }
                const calls = [];
                _asset['_files'].forEach(file => calls.push(this.fileService.getStatistics(
                    'model=filetag&select=id,tagname as tagname&top=1&orderby=ID asc&filter=deleted eq 0 and fileid eq ' + file.ID
                ).pipe(switchMap(tags => {
                    let tagname;
                    if (tags.Data.length) {
                        tagname = tags.Data[0].tagname;
                    }
                    if (tagname) {
                        return this.fileService.tag(file.ID, tagname, StatusCode.Completed).pipe(
                            switchMap(() => of(_asset)),
                            catchError(err => {
                                this.errorService.handle(err);
                                return of(_asset);
                            })
                        );
                    } else {
                        return of(_asset);
                    }
                }))));
                if (calls.length) {
                    return forkJoin(calls).pipe(
                        catchError((err) => of(_asset)),
                        take(1),
                        switchMap(() => of(_asset))
                    );
                }
                return of(_asset);
            })
        );
    }

    deleteAsset(id: number) {
        return this.Remove(id);
    }

    setAssetAsLost(assetID: number, date: LocalDate, description: string) {
        return this.PutAction(null, 'set-asset-aslost', `id=${assetID}&date=${date}&description='${description}'`);
    }

    sellAsset(assetID: number, customerID: number, vatTypeID: number, invoiceDate: LocalDate, amount: number, createInvoice: boolean) {
        const _createInvoice = createInvoice ? 'true' : 'false';
        const query = `assetID=${assetID}&customerID=${customerID}&vatTypeID=${vatTypeID}&invoiceDate=${invoiceDate}&amount=${amount}&createInvoice=${_createInvoice}`;
        return this.PutAction(null, 'sell-asset', query);
    }

    depreciateAsset(assetID: number, date: LocalDate = null, amount: number = null, description= '') {
        return this.PutAction(null,  'write-off-asset', `id=${assetID}&date=${date}&amount=${amount}&description=${description}`);
    }

    getUseAsset() {
        return this.GetAction(null, 'get-use-asset')
            .pipe(map(useAsset => useAsset === false ? false : true));
    }

    setUseAsset(use: boolean) {
        const isUse = use ? 'true' : 'false';
        return this.PutAction(null, 'set-use-asset', `use=${isUse}`);
    }
    checkIfBalanceIsOk(asset: Asset) {
        if (asset.ID) {
            return of(true);
        }
        if (asset?.BalanceAccountID && asset?.NetFinancialValue) {
            return this.GetAction(null, 'is-balance-ok', `accountID=${asset?.BalanceAccountID}&amount=${asset?.NetFinancialValue}`);
        }
        return of(true);
    }
    openRegisterModal(supplierInvoice: SupplierInvoice): Observable<any> {
        return this.getUseAsset().pipe(switchMap((useAsset) => {
            if (useAsset) {
                const result$ = new Subject();
                this.modalService.open(RegisterAssetModal, {}).onClose.take(1).subscribe(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        result$.next(result);
                        this.router.navigateByUrl('/accounting/assets/0?supplierInvoiceID=' + supplierInvoice.ID);
                    } else {
                        if (result === ConfirmActions.REJECT) {
                            this.setUseAsset(false).subscribe(() => result$.next(result));
                        } else {
                            result$.next(result);
                        }
                    }

                });
                return result$.asObservable();
            } else {
                return of(false);
            }
        }));
    }

    linkFile(ID, fileID) {
        const route = `files/${fileID}?action=link&entitytype=Asset&entityid=${ID}`;
        return this.send(route);
    }

    getSupplierInvoiceFiles(supplierInvoiceID) {
        const route = `files/SupplierInvoice/${supplierInvoiceID}`;
        return this.send(route, null, 'GET');
    }

    getAssetFiles(assetID) {
        const route = `files/Asset/${assetID}`;
        return this.send(route, null, 'GET');
    }

    private send(route: string, httpParams?: HttpParams, method = 'POST', body?: any): Observable<any> {
        let ht = this.http.asPOST();
        if(!httpParams) {
            httpParams = new HttpParams();
        }
        switch (method.toUpperCase()) {
            case 'GET':
                ht = this.http.asGET();
                break;
            case 'PUT':
                ht = this.http.asPUT();
                break;
            case 'DELETE':
                ht = this.http.asDELETE();
                break;
        }
        return ht.usingBusinessDomain()
            .withEndPoint(route).send( body ? { body: body } : undefined, httpParams)
            .map(response => response.body);
    }
}
