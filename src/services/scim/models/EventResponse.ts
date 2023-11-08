/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Meta } from './Meta';
import type { NutidEventExtensionV1 } from './NutidEventExtensionV1';
import type { SCIMSchema } from './SCIMSchema';

/**
 * This is basically the implementation of the common attributes defined in RFC7643 #3.1. (Common Attributes)
 */
export type EventResponse = {
    'https://scim.eduid.se/schema/nutid/event/v1': NutidEventExtensionV1;
    id: string;
    meta: Meta;
    schemas: Array<SCIMSchema>;
    externalId?: string;
};

