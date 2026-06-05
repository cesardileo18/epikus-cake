// src/interfaces/Contact.ts

export interface ContactHeader {
    title_prefix: string;
    title_highlight: string;
}

export interface ContactFieldBase {
    label: string;
    placeholder: string;
    autocomplete?: string;
}

export interface ContactNameField extends ContactFieldBase { }

export interface ContactEmailField extends ContactFieldBase {
    type?: 'email';
}

export interface ContactPhoneField extends ContactFieldBase {
    optional?: boolean;
}

export interface ContactMessageField extends ContactFieldBase {
    rows: number;
}

export interface ContactFormButtons {
    submit: string;
    submitting: string;
    whatsapp: string;
}

export interface ContactFormText {
    title: string;
    fields: {
        name: ContactNameField;
        email: ContactEmailField;
        phone: ContactPhoneField;
        message: ContactMessageField;
    };
    buttons: ContactFormButtons;
}

export interface ContactMapSection {
    title: string;
    iframe_src: string;
    disclaimer: string;
}

export interface LabeledValue {
    label: string;
    value: string;
    note?: string;
}

export interface ContactQuickInfo {
    email: LabeledValue;
    schedule: LabeledValue;
    pickup_delivery: LabeledValue;
}

export interface ContactContent {
    header: ContactHeader;
    form: ContactFormText;
    map_section: ContactMapSection;
    quick_info: ContactQuickInfo;
}
