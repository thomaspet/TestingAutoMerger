import {Component, Input, ChangeDetectorRef} from '@angular/core';
import {UserService} from '../../app/services/common/UserService';
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
    private defaultEmployment: any = {};
    private defaultSettings: any = {}
    private currentUser: any = {};

    constructor(cdr: ChangeDetectorRef, private userService: UserService) {
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
            return 'OK'
        } else {
            return 'MANGLER';
        }
    }

    //Dummy function for EMPLOYEE ONLY
    private setDefaults() {
        if (this.model.employee.BusinessRelationInfo.Emails && this.model.employee.BusinessRelationInfo.Emails[0]) {
            this.defaultEmailAddress = this.model.employee.BusinessRelationInfo.Emails[0].EmailAddress;
        } else {
            this.defaultEmailAddress = 'Epostaddresse mangler'
        }

        if (this.model.employee.BusinessRelationInfo.Phones && this.model.employee.BusinessRelationInfo.Phones[0]) {
            this.defaultPhoneNumber = this.model.employee.BusinessRelationInfo.Phones[0].Number;
        } else {
            this.defaultPhoneNumber = 'Telefonnummer';
        }

        if (this.model.employments && this.model.employments.length > 0) {
            var standarIndex = 0;
            var actives = 0;
            for (var i = 0; i < this.model.employments.length; i++) {
                if (this.model.employments[i].Standard) {
                    actives++;
                }
            }

            //this.defaultEmployment.workPercent = this.model.employments[standarIndex].WorkPercent
            this.defaultEmployment.jobName = this.model.employments[standarIndex].JobName;
            this.defaultEmployment.numberOfActives = actives;

            if (!this.defaultEmployment.workPercent) {

                this.defaultEmployment.workPercent = 0;
                //Counts up to workpercent (Recounts every time something is changed)
                var interval = setInterval(() => {
                    this.defaultEmployment.workPercent++;
                    if (this.defaultEmployment.workPercent === this.model.employments[standarIndex].WorkPercent) {
                        clearInterval(interval);
                    }
                }, 10);
            }
        }
    }

    private setSettingsDefaults() {
        //Settings data fetching??
        var settings: any = localStorage.getItem('companySettings');
        settings = JSON.parse(settings);

        this.defaultSettings.orgNumber = this.formatOrgnumber(settings.OrganizationNumber, 3).join(' ');

        this.userService.getCurrentUser().subscribe((data) => {
            this.currentUser = data;
        })
        
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
