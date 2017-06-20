import { Component } from '@angular/core';
import { ProjectService, ErrorService } from '../../../../services/services';
import { Project } from '../../../../unientities';
import { UniFieldLayout } from 'uniform-ng2/main';
import { FieldType } from 'uniform-ng2/main';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
    selector: 'project-editmode',
    templateUrl: './editmode.html'
})

export class ProjectEditmode {

    public config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private project$: BehaviorSubject<Project> = new BehaviorSubject(null);
    private actionLabel: string = '';
    private STATUS = [{ ID: 42201, Name: 'Registrert' }, { ID: 2, Name: 'Aktivt' }, { ID: 3, Name: 'Avsluttet'}];

    constructor(private projectService: ProjectService, private errorService: ErrorService) { }

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());
        this.projectService.currentProject.subscribe(
            (project) => {
                if (project.ID) {
                    this.project$.next(project);
                    this.actionLabel = 'Rediger prosjekt ' + project.Name + ':';
                } else {
                    this.project$.next(new Project);
                    this.projectService.currentProject.next(this.project$.getValue());
                    this.actionLabel = 'Nytt prosjekt:';
                }
                this.extendFormConfig();
            });
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();

        let status: UniFieldLayout = fields[2];
        status.Options = {
            source: this.STATUS,
            valueProperty: 'ID',
            displayProperty: 'Name',
            template: (obj: any) => obj ? obj.Name : '',
            debounceTime: 200
        }
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Prosjektnummer',
                Property: 'ProjectNumber',
                Placeholder: 'Autogenerert hvis blank',
                Classes: 'twentyfive-width-field',
                LineBreak: false,
                Section: 0

            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Property: 'Name',
                Classes: 'fifty-width-field',
                LineBreak: false,
                Section: 0
            },
            <any>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Status',
                Property: 'StatusCode',
                Classes: 'twentyfive-width-field',
                LineBreak: false,
                Section: 0
            },
            <any>{
                FieldType: FieldType.TEXTAREA,
                Label: 'Beskrivelse',
                Property: 'Description',
                Classes: 'max-width',
                LineBreak: true,
                Section: 0
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Prosjektleder',
                Property: 'ProjectLeadName',
                Classes: 'fifty-width-field',
                LineBreak: true,
                Section: 0
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Kunde',
                Property: 'ProjectCustomerID',
                Classes: 'fifty-width-field',
                LineBreak: false,
                Width: '100%',
                Section: 0
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Arbeidssted',
                Property: 'WorkPlaceAddressID',
                Classes: 'fifty-width-field',
                LineBreak: true,
                Width: '100%',
                Section: 0
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forventet startdato',
                Property: 'PlannedStartdate'
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forventet sluttdato',
                Property: 'PlannedEnddate',
                LineBreak: true
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Startdato',
                Property: 'Startdate',

            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Sluttdato',
                Property: 'Enddate'
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Opprettet',
                Property: 'CreatedAt',
                ReadOnly: true
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Price',
                Property: 'Price',
                Classes: 'third-width-field',
                LineBreak: false,
                Section: 1,
                Sectionheader: 'Budsjettstyring'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'CostPrice',
                Property: 'CostPrice',
                Classes: 'third-width-field',
                LineBreak: false,
                Section: 1,
                Sectionheader: 'Budsjettstyring'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Total',
                Property: 'Total',
                Classes: 'third-width-field',
                LineBreak: false,
                Section: 1,
                Sectionheader: 'Budsjettstyring'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Navn',
                Property: '',
                Classes: 'third-width-field',
                LineBreak: false,
                Section: 2,
                Sectionheader: 'Ressurser'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Ansvar',
                Property: '',
                Classes: 'third-width-field',
                LineBreak: false,
                Section: 2,
                Sectionheader: 'Ressurser'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Type',
                Property: '',
                Classes: 'third-width-field',
                LineBreak: false,
                Section: 2,
                Sectionheader: 'Ressurser'
            },
            
        ];
    }
}