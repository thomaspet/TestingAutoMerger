export class SendEmail {
    public EmailAddress: string;
    public CopyAddress: string;
    public Subject: string;
    public Format: string;
    public Message: string;
    public SendCopy: boolean;
    public EntityType: string;
    public EntityID: number;
    public CustomerID: number;

    public SendEmail() {
        this.EmailAddress = '';
        this.CopyAddress = '';
        this.Subject = '';
        this.Format = 'pdf';
        this.Message = '';
        this.SendCopy = false;
        this.EntityType = '';
        this.EntityID = 0;
        this.CustomerID = 0;
    }
}