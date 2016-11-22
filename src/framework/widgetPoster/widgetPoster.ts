import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { UniHttp } from '../core/http/http';
import { UserService, NumberFormat } from '../../app/services/services';
import {ErrorService} from '../../app/services/common/ErrorService';
declare var Chart;

@Component({
    selector: 'uni-widget-poster',
    templateUrl: 'framework/widgetPoster/widgetPoster.html',
})
export class WidgetPoster {
    @Input() public model: any;
    @Input() public datachecks: any;

    private rngIteration: number = 0;
    public randomNumber: string = '42%';
    private cdr: any;
    private defaultEmailAddress: string;
    private defaultPhoneNumber: string;
    private netPaidThisYear: string = '0';
    private defaultEmployment: any = {};
    private defaultSettings: any = {}
    private currentUser: any = {};
    private numberOfBusinesses: number = 0;
    private numberOfActiveUsers: number = 0;
    private hasImage: boolean = true;

    constructor(
        cdr: ChangeDetectorRef,
        private userService: UserService,
        private http: UniHttp,
        private numberFormatter: NumberFormat,
        private errorService: ErrorService
    ) {
        this.cdr = cdr;
    }

    public ngAfterViewInit() {
        if (!this.model.employee && !this.model.settings) {
            let chartElem = document.getElementById('widgetGraph0');
            this.lineChartGenerator(chartElem);
            this.randomNumberGenerator();
        }
    }

    public ngOnChanges(changes: any) {
        if (this.model.employee) {
            this.setDefaults();
        } else if (this.model.settings) {
            this.setSettingsDefaults();
        }
    }

    private okOrMissing(has: boolean): string {
        if (has) {
            return 'OK';
        } else {
            return 'MANGLER';
        }
    }

    //Dummy function for EMPLOYEE ONLY
    private setDefaults() {
        if (this.model.employee.BusinessRelationInfo.Emails && this.model.employee.BusinessRelationInfo.Emails[0]) {
            this.defaultEmailAddress = this.model.employee.BusinessRelationInfo.Emails[0].EmailAddress;
        } else {
            this.defaultEmailAddress = 'Epostadresse mangler';
        }

        if (this.model.employee.BusinessRelationInfo.Phones && this.model.employee.BusinessRelationInfo.Phones[0]) {
            this.defaultPhoneNumber = this.model.employee.BusinessRelationInfo.Phones[0].Number;
        } else {
            this.defaultPhoneNumber = 'Mangler';
        }

        if (this.model.employments && this.model.employments.length > 0) {
            var standarIndex = 0;
            var actives = 0;
            for (var i = 0; i < this.model.employments.length; i++) {
                if (!this.model.employments[i].EndDate) {
                    actives++;
                }
                if(this.model.employments[i].Standard) {
                    standarIndex = i;
                }
            }

            //this.defaultEmployment.workPercent = this.model.employments[standarIndex].WorkPercent
            this.defaultEmployment.jobName = this.model.employments[standarIndex].JobName;
            this.defaultEmployment.numberOfActives = actives;

            if (!this.defaultEmployment.workPercent) {

                this.defaultEmployment.workPercent = this.model.employments[standarIndex].WorkPercent;
                //Counts up to workpercent (Recounts every time something is changed)
            }
        } else {
            this.defaultEmployment = {};
        }
        /*OBS!! HARD CODED YEAR*/
        if (this.model.employee.ID) {
            this.http
                .asGET()
                .usingBusinessDomain()
                .withEndPoint('/salarytrans?action=yearly-sums&year=2016&empID=' + this.model.employee.ID)
                .send()
                .map(response => response.json())
                .subscribe((data) => {
                    if (data.netPayment) {
                        var add = Math.floor(data.netPayment / 80);
                        let netPaidThisYear: number = 0;
                        var interval = setInterval(() => {
                            netPaidThisYear += add;
                            this.netPaidThisYear = netPaidThisYear.toString();
                            if (this.netPaidThisYear >= data.netPayment) {
                                clearInterval(interval);
                                this.netPaidThisYear = this.numberFormatter.asMoney(data.netPayment);
                            }
                        }, 10);
                    } else {
                        this.netPaidThisYear = this.numberFormatter.asMoney(data.netPayment);
                    }
                }, this.errorService.handle);
        }
    }

    private setSettingsDefaults() {
        //Settings data fetching??
        var settings: any = localStorage.getItem('companySettings');
        settings = JSON.parse(settings);

        this.defaultSettings.orgNumber = this.formatOrgnumber(settings.OrganizationNumber, 3).join(' ');

        this.userService.getCurrentUser().subscribe((data) => {
            this.currentUser = data;
        }, this.errorService.handle);

        /*  THESE SHOULD NOT BE HERE.. SHOULD BE REMOVED
            GETS THE NUMBER OF SUBENTITIES AND NUMBER OF ACTIVE USERS   */
        this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=SubEntity&filter=deleted eq 0 and SuperiorOrganizationID gt 0')
            .send()
            .map(response => response.json())
            .subscribe((data) => {
                this.numberOfBusinesses = data.Data[0].countid;
            }, this.errorService.handle);

        this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=User&filter=StatusCode eq 110001')
            .send()
            .map(response => response.json())
            .subscribe((data) => {
                this.numberOfActiveUsers = data.Data[0].countid;
            }, this.errorService.handle)
        setTimeout(() => {
            this.hasImage = document.querySelectorAll('.poster_tease_widget_2 uni-image article picture').length !== 0;
        }, 1200)
    }

    private formatOrgnumber(str, n) {
        var ret = [];
        var len;

        for (var i = 0, len = str.length; i < len; i += n) {
            ret.push(str.substr(i, n))
        }

        return ret
    }

    private randomNumberGenerator() {

        let iterations = 50;

        if (this.rngIteration < iterations) {

            this.rngIteration++;
            let rando = Math.floor((Math.random() * 94) + 5);
            this.randomNumber = rando.toString() + '%';
            this.cdr.detectChanges();

            window.requestAnimationFrame(() => {
                this.randomNumberGenerator();
            });

        } else if (this.rngIteration === iterations) {
            let rando = Math.floor((Math.random() * 50) + 50);
            this.randomNumber = rando.toString() + '%';
            this.cdr.detectChanges();
        }

    }

    private lineChartGenerator(elem: any) {
        let chart = new Chart(elem, {
            type: 'line',
            data: {
                labels: this.labelGenerator(10),
                datasets: [{
                    data: this.generateRandomGraphData(10, 175000, 10000, 750),
                    backgroundColor: 'rgba(0,130,192,.05)',
                    borderColor: 'rgba(0,130,192,.1)',
                    borderWidth: 5
                }]
            },
            options: {
                maintainAspectRatio: false,
                scaleShowLabels: false,
                tooltips: {
                    enabled: false
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        display: false
                    }],
                    xAxes: [{
                        display: false
                    }]
                }
            }
        });
    }

    public labelGenerator(numberOfDataPoints) {
        let _data = [];
        for (var index = 0; index < numberOfDataPoints; index++) {
            _data.push('');
        }
        return _data;
    }

    public generateRandomGraphData(
        numberOfDataPoints = 10,
        startValue = 175000,
        maxValueVariance = 1000,
        trend = 0
    ) {

        let _data = [];
        for (var index = 0; index < numberOfDataPoints; index++) {
            let _currentMin = startValue - maxValueVariance + (trend * index);
            let _currentMax = startValue + maxValueVariance + (trend * index);
            let _currentVal = Math.floor(Math.random() * (_currentMax - _currentMin + 1)) + _currentMin;

            _data.push(_currentVal);

        }
        return _data;
    }
}
