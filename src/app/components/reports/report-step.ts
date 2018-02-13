export class ReportStep {
    private stepKeys: {[key: string]: boolean} = {
        'FETCHING_DATA': false,
        'DATA_FETCHED': false,
        'LOADING_LIBRARIES': false,
        'LIBRARIES_LOADED': false,
        'RENDERING_REPORT': false,
        'REPORT_RENDERED': false,
        'RENDERING_HTML': false,
        'HTML_RENDERED': false,
    };

    constructor(steps?) {
        if (!steps) {
            return;
        }
        this.stepKeys = Object.assign(this.stepKeys, steps);
    }

    get Steps() {
        return this.stepKeys;
    }
}
