import {ChangeDetectorRef, Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService, ErrorService, StatisticsService } from '@app/services/services';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AnnualSettlementService } from '../../annual-settlement.service';

@Component({
    selector: 'writeof-difference-enk',
    templateUrl: './difference-enk.html',
    styleUrls: ['../annual-settlement-writeof-difference.sass']
})

export class AnnualSettlementWriteofDifferenceEnkStep {

    stepContentArray = [
		{
			title: 'Eiendeler',
			text: ` <p>
                For at vi skal kunne fylle ut korrekte opplysninger til Skatteetaten må du registrere alle dine anleggsmidler i Eiendeler i systemet. Under får du en oversikt over dine eiendeler.
                Eiendeler i saldogruppe A-D summeres per gruppe. Avskrivninger på dine eiendeler må bokføres før du kan gå videre til neste steg. </p> `,
			diff: 0,
            step: 0,
            buttonText: 'Gå videre'
		},
		{
			title: 'Fast eiendom',
			text: ` <p>
				Her finner du en oversikt over dine faste eiendommer som er registrert i systemet. Fyll inn riktig kommunenummer, gårdsnummer og bruksnummer, disse opplysningene innrapporteres via årsavslutning til Skatteetaten. </p> `,
			diff: 0,
            step: 1,
            buttonText: 'Lagre og gå videre'
		},
		{
			title: 'Foretningsbygg anskaffet før 01.01.1984',
			text: ` <p>
                Her finner du en oversikt over dine foretningsbygg som er anskaffet før 01.01.1984. Du må fylle ut historisk kostpris, nedskrevet verdi pr. 01.01.1984 og nedre grense for avskrivning på disse
                foretningsbyggene. Du finner tallene i RF-1084 (post 113, 114 og 115) som du leverte ifjor. </p> `,
			diff: 0,
            step: 2,
            buttonText: 'Lagre og gå videre'
		},
		{
			title: 'Transportmiddel næring',
			text: ` <p>
                Du må velge "Ja" og fylle ut informasjon i feltene på dette trinnet dersom du har transportmidler (bil, lastebil, buss og lignende) i firmaet. Dersom du eide transportmiddelet i fjor, kan du 
                finne opplysninger i fjorårets innsendte skjema RF-1125. </p> `,
			diff: 0,
			step: 3,
            summaryTitle: 'Sum inngående balanse gevinst og tap',
            buttonText: 'Lagre og gå videre'
		},
		{
			title: 'Elektronisk kommunikasjon',
			text: ` <p> Privat bruk av telefon og bredbånd til eier av firmaet. </p> `,
			diff: 0,
            step: 4,
            buttonText: 'Lagre og fullfør'
		},
	];

    infoContent: any = this.stepContentArray[0];
    showInfo = true;
    busy = false;
    step = 0;
    onDestroy$ = new Subject();
    buildingTableConfig: any = {};
    realEstateTableConfig: any = {};
    annualSettlement: any;

    realEstates = [];
    assetsDetails = [];
    oldAssets = [];
    sumLine: any = {};

    constructor (
        private router: Router,
        private route: ActivatedRoute,
		private statisticsService: StatisticsService,
        private annualSettlementService: AnnualSettlementService,
        private changeDetector: ChangeDetectorRef,
		private errorService: ErrorService,
        private toastService: ToastService,
        private assetsService: AssetsService
    ) { }

    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            Observable.forkJoin([
                this.annualSettlementService.getAnnualSettlement(id),
                // this.assetsService.getENKAssetsList(2020, false),
                // this.assetsService.getENKAssetsList(2020, true),
                this.assetsService.GetAll()
            ]).subscribe(([settlement, assets = [], oldAssets = []]) => {
                this.annualSettlement =  settlement;
                this.realEstates = assets;
                this.oldAssets = oldAssets;
                this.assetsDetails = [];

                // Dont show locked real estate if none
                if (!this.realEstates.length) {
                    const index = this.stepContentArray.findIndex(step => step.step === 1);
                    this.stepContentArray.splice(index, 1);
                } else {
                    this.setupAssetsTable();
                }

                // Dont show old company builds step if none
                if (!this.oldAssets.length) {
                    const index = this.stepContentArray.findIndex(step => step.step === 2);
                    this.stepContentArray.splice(index, 1);
                } else {
                    this.setupBuildingsTable();
                }
                
            }, err => {
                this.errorService.handle(err);
                this.goBack();
            });
            
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
    }

    onStep(direction: number) {
		if (direction > 0) {
			this.busy = true;
			this.checkSaveAndContinue(direction)
		} else {
			this.step += direction;
			this.setStepInfoContent();
		}
    }
    
    checkSaveAndContinue(direction: number) {

        if (this.infoContent.step === 4 && direction > 0) {
            this.goBack();
			// this.annualSettlementService.moveFromStep3ToStep4(this.annualSettlement).subscribe(() => {
			// 	this.toastService.addToast('Informasjon lagret', ToastType.good, 6, 'Oppdatert informasjon på avskrivninger og forskjeller er lagret');
			// 	this.goBack();
			// 	return;
			// }, err => {
			// 	this.toastService.addToast('Informasjon lagret, men noe gikk galt', ToastType.bad, 6, 'Klarte ikke fullføre steg 3. Se gjennom data og prøv igjen');
			// 	this.goBack();
			// 	return;
			// });
        } else if (direction > 0 && false) { 
            if (this.infoContent.step === 1) {

                this.assetsService.updateRealEstatesAssetsList(this.realEstates).subscribe((l) => {
                    this.realEstates = l;
                    this.step += direction;
                    this.setStepInfoContent();
                    this.busy = false;
                })
            } else if (this.infoContent.step === 2) {
                this.assetsService.updateRealEstatesAssetsList(this.oldAssets).subscribe((l) => {
                    this.oldAssets = l;
                    this.step += direction;
                    this.setStepInfoContent();
                    this.busy = false;
                })
            } else if (this.infoContent.step === 3) {
                this.step += direction;
                this.setStepInfoContent();
                this.busy = false;
            } else {
                this.annualSettlementService.updateAnnualSettlement(this.annualSettlement).subscribe(() => {
                    this.step += direction;
                    this.setStepInfoContent();
                    this.busy = false;
                }, err => {
                    this.busy = false;
                });
            }
        } else {
            this.step += direction;
            this.setStepInfoContent();
            this.busy = false;
            // Continue here
        }
    }

    bookWriteOf() {
        this.busy = true;
        this.assetsService.bookWriteOf(2020).subscribe(() => {
            this.busy = false;
            this.toastService.addToast('Avskrivninger bokført', ToastType.good, 5);
        }, err => {
            this.busy = false;
            this.errorService.handle(err);
        })
    }
    
    getFormattedDetailsData(data: any[]): any[] {
		if (!data.length) {
			return [];
		}

		this.sumLine = {
			Value: data.map(a => a.Value || 0).reduce((a, b) => (a || 0) + (b || 0)),
			Movement: data.map(a => a.Movement || 0).reduce((a, b) => (a || 0) + (b || 0)),
			TaxbasedDepreciation: data.map(a => a.TaxbasedDepreciation || 0).reduce((a, b) => (a || 0) + (b || 0)),
			TaxBasedUB: data.map(a => a.TaxBasedUB || 0).reduce((a, b) => (a || 0) + (b || 0))
		}

		return data.sort((a, b) => { return a.GroupCode > b.GroupCode ? 1 : -1 });
	}

    setupBuildingsTable() {
        this.buildingTableConfig = new UniTableConfig('acconting.annualsettlement.editbuildings', true, false, 20)
        .setAutoAddNewRow(false)
        .setColumns([
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Text).setEditable(false).setAlignment('center'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setEditable(false),
			new UniTableColumn('PurchaseDate', 'Kjøpsdato', UniTableColumnType.DateTime).setEditable(false),
			new UniTableColumn('HistoricalCostPrice', 'Historisk kostpris', UniTableColumnType.Money),
			new UniTableColumn('IBValue1984', 'Verdi pr 01.01.1984', UniTableColumnType.Money),
			new UniTableColumn('LowerDepreciationValue', 'Nedre grense for avskr.', UniTableColumnType.Money)]);
    }

    setupAssetsTable() {
        this.realEstateTableConfig = new UniTableConfig('acconting.annualsettlement.editenkassets', true, false, 20)
        .setAutoAddNewRow(false)
        .setColumns([
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Text).setEditable(false).setAlignment('center'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setEditable(false),
			new UniTableColumn('PurchaseDate', 'Kjøpsdato', UniTableColumnType.DateTime).setEditable(false),
			new UniTableColumn('Knr', 'Kommunenummer', UniTableColumnType.Number),
			new UniTableColumn('Gnr', 'Gårdsnummer', UniTableColumnType.Number),
			new UniTableColumn('Bnr', 'Bruksnummer', UniTableColumnType.Number)]);
    }

    setStepInfoContent() {
		this.infoContent = this.stepContentArray[this.step];
	}

    goBack() {
		this.router.navigateByUrl('/accounting/annual-settlement');
	}
}