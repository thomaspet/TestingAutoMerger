declare const moment;

export class AltinnAuthenticationData {
    public userID: string;
    public password: string;
    public preferredLogin: string;
    public pin: string;
    public validTo: Date;
    public validFrom: Date;

    public static fromObject(obj: any): AltinnAuthenticationData {
        const instance = new AltinnAuthenticationData();
        Object.assign(instance, obj);
        return instance;
    }

    public isValid(): boolean {
        const now = moment().add(1, 'minutes');
        return !!this.pin && moment(this.validTo).isAfter(now);
    }
}
