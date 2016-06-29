﻿import {Component, OnInit} from '@angular/core';
import {RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {UniAutocompleteConfig} from '../../../../framework/controls/autocomplete/autocomplete';
import {
    UniFieldBuilder, UniFormBuilder, UniForm, UniSectionBuilder, UniComboFieldBuilder
} from '../../../../framework/forms';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {UniHttp} from '../../../../framework/core/http/http';
import {
    SubEntity,
    AGAZone,
    Municipal,
    FieldType,
    AGARate,
    CompanySalary
} from '../../../unientities';
import {
    AgaZoneService,
    SubEntityService,
    MunicipalService,
    CompanySalaryService
} from '../../../services/services';

declare var _; // lodash

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/agaAndSubEntitySettings.html',
    providers: [
        AgaZoneService,
        SubEntityService,
        MunicipalService,
        CompanySalaryService,
    ],
    directives: [ROUTER_DIRECTIVES, UniForm, UniSave]
})

export class AgaAndSubEntitySettings implements OnInit {
    private id: any;
    private form: any;
    private subEntities: SubEntity[] = [];
    private agaZones: AGAZone[] = [];
    private agaRules: AGARate[] = [];
    private municipals: Municipal[] = [];
    private companySalary: CompanySalary[] = [];
    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre AGA og virksomheter',
            action: this.saveAgaAndSubEntities.bind(this),
            main: true,
            disabled: false
        }
    ];

    // TODO Use service instead of Http, Use interfaces!!
    constructor(private routeParams: RouteParams,
        private http: UniHttp,
        private agaZoneService: AgaZoneService,
        private subentityService: SubEntityService,
        private municipalService: MunicipalService,
        private companySalaryService: CompanySalaryService
        ) {

    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    private getDataAndSetupForm() {
        Observable.forkJoin(
            this.subentityService.GetAll(null, ['BusinessRelationInfo', 'BusinessRelationInfo.InvoiceAddress']),
            this.agaZoneService.GetAll(null),
            this.agaZoneService.getAgaRules(),
            this.companySalaryService.getCompanySalary()
        ).subscribe(
            (dataset) => {
                let filter: string = '';

                dataset[0].forEach((element) => {
                    filter += 'MunicipalityNo eq ' + element.MunicipalityNo + ' or ';
                });
                filter = filter.slice(0, filter.length - 3);
                console.log('dataset: ', dataset);

                this.municipalService.GetAll(filter).subscribe(
                    (response) => {
                        this.subEntities = dataset[0];
                        this.agaZones = dataset[1];
                        this.agaRules = dataset[2];
                        this.companySalary = dataset[3];
                        this.municipals = response;
                        console.log('companySalary: ', this.companySalary);
                        if (!this.companySalary[0]) {
                            this.companySalary[0] = new CompanySalary();
                        }
                        this.buildForm();
                    },
                    error => console.log(error)
                );
            },
            error => console.log(error)
            );
    }

    private buildForm() {

        var formBuilder = new UniFormBuilder();

        // *********************  Virksomhet og aga  ***************************/
        //var subEntitiesSection = new UniSectionBuilder('Virksomhet og arbeidsgiveravgift(aga)');

        var mainAccountAlocatedAga = new UniFieldBuilder();
        mainAccountAlocatedAga
            .setLabel('Konto avsatt aga')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountAllocatedAGA')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var mainAccountCostAga = new UniFieldBuilder();
        mainAccountCostAga
            .setLabel('Konto kostnad aga')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountCostAGA')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var mainAccountAllocatedAgaVacation = new UniFieldBuilder();
        mainAccountAllocatedAgaVacation
            .setLabel('Avsatt aga av feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountAllocatedAGAVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])

        var mainAccountCostAgaVacation = new UniFieldBuilder();
        mainAccountCostAgaVacation
            .setLabel('Kostnad aga feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountCostAGAVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var freeAmount = new UniFieldBuilder();
        freeAmount
            .setLabel('Fribeløp')
            .setModel(this.companySalary[0])
            .setModelField('FreeAmount')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        formBuilder.addUniElements(mainAccountAlocatedAga, mainAccountCostAga, mainAccountAllocatedAgaVacation, mainAccountCostAgaVacation, freeAmount);

        this.subEntities.forEach(subEntity => {
            var municipal = this.getMunicipality(subEntity.MunicipalityNo);
            var agaZone: AGAZone = this.getAgaZone(subEntity.AgaZone);
            var agaRule = _.find(this.agaRules, x => x.sectorID === subEntity.AgaRule);
            var agaZoneName = '';
            var agaRuleName = '';
            if (agaZone) { agaZoneName = ', Sone ' + agaZone.ZoneName; }
            if (agaRule) { agaRuleName = ', ' + agaRule.sector; }
            var subEntitySection = new UniSectionBuilder(subEntity.BusinessRelationInfo.Name +
                ', ' + subEntity.OrgNumber +
                ', ' + subEntity.MunicipalityNo + '-' + municipal.MunicipalityName +
                agaZoneName +
                agaRuleName);

            var subEntityName = new UniFieldBuilder();
            subEntityName.setLabel('Virksomhet navn')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.Name')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var subEntityOrgNumber = new UniFieldBuilder();
            subEntityOrgNumber.setLabel('Orgnr for virksomheten')
                .setModel(subEntity)
                .setModelField('OrgNumber')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var subEntityAddress = new UniFieldBuilder();
            subEntityAddress.setLabel('Gateadr')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.AddressLine1')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var subEntityPostnr = new UniFieldBuilder();
            subEntityPostnr.setLabel('Postnr/Sted')
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.PostalCode')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            var subEntityCity = new UniFieldBuilder();
            subEntityCity
                .setModel(subEntity)
                .setModelField('BusinessRelationInfo.InvoiceAddress.City')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            var subEntityLocation = new UniComboFieldBuilder();
            subEntityLocation.addUniElements(subEntityPostnr, subEntityCity);

            var subEntityMunicipalNumber = new UniFieldBuilder();
            subEntityMunicipalNumber.setModel(subEntity)
                .setLabel('Kommunenr/Navn')
                .setModelField('MunicipalityNo')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var subEntityMunicipalName = new UniFieldBuilder();
            subEntityMunicipalName.setModel(municipal)
                .setModelField('MunicipalityName')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var subEntityMunicipality = new UniComboFieldBuilder();
            subEntityMunicipality.addUniElements(subEntityMunicipalNumber, subEntityMunicipalName);


            var subEntityAgaZone = new UniFieldBuilder();
            subEntityAgaZone.setLabel('Sone')
                .setModel(subEntity)
                .setModelField('AgaZone')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
                .setKendoOptions({
                    dataSource: this.agaZones,
                    dataTextField: 'ZoneName',
                    dataValueField: 'ID',
                });

            var subEntityAgaRule = new UniFieldBuilder();
            subEntityAgaRule.setLabel('Beregningsregel AGA')
                .setModel(subEntity)
                .setModelField('AgaRule')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
                .setKendoOptions({
                    dataSource: this.agaRules,
                    dataTextField: 'Sector',
                    dataValueField: 'SectorID',
                });

            subEntitySection.addUniElements(subEntityName,
                subEntityOrgNumber,
                subEntityAddress,
                subEntityLocation,
                subEntityMunicipality,
                subEntityAgaZone,
                subEntityAgaRule);

            formBuilder.addUniElement(subEntitySection);
        });

        // *********************  Instillinger lønn  ***************************/

        var salarySettings = new UniSectionBuilder('Innstillinger spesifikke for lønn');

        var interrimRemit = new UniFieldBuilder();
        interrimRemit
            .setLabel('Mellomkonto remittering')
            .setModel(this.companySalary[0])
            .setModelField('InterrimRemitAccount')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var mainAccountAllocatedVacation = new UniFieldBuilder();
        mainAccountAllocatedVacation
            .setLabel('Balanse feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountAllocatedVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var mainAccountCostVacation = new UniFieldBuilder();
        mainAccountCostVacation
            .setLabel('Resultat feriepenger')
            .setModel(this.companySalary[0])
            .setModelField('MainAccountCostVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        salarySettings.addUniElements(interrimRemit, mainAccountAllocatedVacation, mainAccountCostVacation);


        formBuilder.addUniElements(salarySettings);

        this.form = formBuilder;
    }

    /********************************************************************/
    /*********************  Form Builder    *******************/

    private getAgaZone(id: number) {
        return _.find(this.agaZones, object => object.ID === id);
    }

    private getMunicipality(municipalityNumber) {
        return _.find(this.municipals, object => object.MunicipalityNo === municipalityNumber);
    }

    public saveAgaAndSubEntities(done) {
        console.log('onSubmit called');
        done('lagrer kontoer');
        if (this.companySalary[0].ID) {
            console.log('saving');
            this.companySalaryService.Put(this.companySalary[0].ID, this.companySalary[0]).subscribe((response: CompanySalary) => {
                this.companySalary[0] = response;
                done('Sist lagret: ');
            });
        } else {
            this.companySalaryService.Post(this.companySalary[0]).subscribe((response: CompanySalary) => {
                done('Sist lagret: ');
            });
        }
    }

    //#endregion Test data
}
