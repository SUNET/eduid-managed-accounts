/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Email } from './Email';
import type { Group } from './Group';
import type { Meta } from './Meta';
import type { Name } from './Name';
import type { NutidUserExtensionV1 } from './NutidUserExtensionV1';
import type { PhoneNumber } from './PhoneNumber';
import type { SCIMSchema } from './SCIMSchema';

/**
 * This is basically the implementation of the common attributes defined in RFC7643 #3.1. (Common Attributes)
 */
export type UserResponse = {
    id: string;
    meta: Meta;
    schemas: Array<SCIMSchema>;
    externalId?: string;
    name?: Name;
    emails?: Array<Email>;
    phoneNumbers?: Array<PhoneNumber>;
    preferredLanguage?: string;
    groups?: Array<Group>;
    'https://scim.eduid.se/schema/nutid/user/v1'?: NutidUserExtensionV1;
};

