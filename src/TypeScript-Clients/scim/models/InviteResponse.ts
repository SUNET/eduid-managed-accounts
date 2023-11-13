/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Meta } from './Meta';
import type { NutidInviteExtensionV1 } from './NutidInviteExtensionV1';
import type { NutidUserExtensionV1 } from './NutidUserExtensionV1';
import type { SCIMSchema } from './SCIMSchema';

/**
 * This is basically the implementation of the common attributes defined in RFC7643 #3.1. (Common Attributes)
 */
export type InviteResponse = {
    id: string;
    meta: Meta;
    schemas: Array<SCIMSchema>;
    externalId?: string;
    'https://scim.eduid.se/schema/nutid/invite/v1'?: NutidInviteExtensionV1;
    'https://scim.eduid.se/schema/nutid/user/v1'?: NutidUserExtensionV1;
};

