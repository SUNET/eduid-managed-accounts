/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Email } from './Email';
import type { Name } from './Name';
import type { PhoneNumber } from './PhoneNumber';

export type NutidInviteExtensionV1 = {
    name?: Name;
    emails?: Array<Email>;
    phoneNumbers?: Array<PhoneNumber>;
    nationalIdentityNumber?: string;
    preferredLanguage?: string;
    groups?: Array<string>;
    inviterName?: string;
    sendEmail?: boolean;
    finishURL?: string;
    inviteURL?: string;
    enableMfaStepup?: boolean;
    completed?: string;
    expiresAt?: string;
};

