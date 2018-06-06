import { Injectable } from '@angular/core';

const FIELD_SEPARATOR = '\t';
const LINE_SEPARATOR = '\r\n';

@Injectable()
export class GdprFileWriter {
    createFileContent(model) {

        const contentLines = [];

        contentLines.push(['Kunde ' + model.Info.Name]);
        contentLines.push(['Adresse']);
        contentLines.push(['Adresse', 'Addresse2', 'Postnr', 'Poststed', 'Landkode', 'Land']);
        contentLines.push(...this.getAddresses(model));
        contentLines.push(['']);
        contentLines.push(['Epost']);
        contentLines.push(['E-post', 'Beskrivelse', 'Standard']);
        contentLines.push(...this.getEmails(model));
        contentLines.push(['']);
        contentLines.push(['Telefon']);
        contentLines.push(['Telefon', 'Beskrivelse', 'Type', 'Standard']);
        contentLines.push(...this.getPhones(model));
        return contentLines
            .map(line => line.join(FIELD_SEPARATOR))
            .join(LINE_SEPARATOR);
    }

    getAddresses(model) {
        const addresses = [];
        model.Info.Addresses.forEach(address => {
            addresses.push([
                address.AddressLine1,
                address.AddressLine2,
                address.PostalCode,
                address.Region,
                address.CountryCode,
                address.Country,
            ]);
        });
        if (model.Info.ShippingAddress
            && !this.isInList(model.Info.ShippingAddress, model.Info.Addresses)) {
            addresses.push([
                model.Info.ShippingAddress.AddressLine1,
                model.Info.ShippingAddress.AddressLine2,
                model.Info.ShippingAddress.PostalCode,
                model.Info.ShippingAddress.Region,
                model.Info.ShippingAddress.CountryCode,
                model.Info.ShippingAddress.Country,
            ]);
        }
        if (model.Info.InvoiceAddress
            && !this.isInList(model.Info.ShippingAddress, model.Info.Addresses)) {
            addresses.push([
                model.Info.InvoiceAddress.AddressLine1,
                model.Info.InvoiceAddress.AddressLine2,
                model.Info.InvoiceAddress.PostalCode,
                model.Info.InvoiceAddress.Region,
                model.Info.InvoiceAddress.CountryCode,
                model.Info.InvoiceAddress.Country,
            ]);
        }
        return addresses;
    }

    getEmails(model) {
        const emails = [];
        model.Info.Emails.forEach(email => {
            emails.push([
                email.EmailAddress,
                email.Description,
                (model.Info.DefaultEmail && model.Info.DefaultEmail.ID === email.ID) ? 1 : 0
            ]);
        });
        if (model.Info.DefaultEmail
            && !this.isInList(model.Info.DefaultEmail, model.Info.Emails)) {
            emails.push([
                model.Info.DefaultEmail.EmailAddress,
                model.Info.DefaultEmail.Description,
                1
            ]);
        }
        return emails;
    }

    getPhones(model) {
        const phones = [];
        model.Info.Phones.forEach(phone => {
            phones.push([
                phone.Number,
                phone.Description,
                phone.Type,
                (model.Info.DefaultPhone && model.Info.DefaultPhone.ID === phone.ID) ? 1 : 0
            ]);
        });
        if (model.Info.DefaultPhone
            && !this.isInList(model.Info.DefaultPhone, model.Info.Phones)) {
            phones.push([
                model.Info.DefaultPhone.Number,
                model.Info.DefaultPhone.Description,
                model.Info.Type,
                1
            ]);
        }
        return phones;
    }

    isInList(item, list) {
        return list.find(element => element.ID === item.ID);
    }
}
