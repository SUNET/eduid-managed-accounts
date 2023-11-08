/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventLevel } from './EventLevel';
import type { NutidEventResource } from './NutidEventResource';

/**
 * All of these will be present in Events resource responses, but only some of them are required
 * when creating an event: user_id, (external_id), level, data
 */
export type NutidEventExtensionV1 = {
    resource: NutidEventResource;
    level?: EventLevel;
    data?: Record<string, any>;
    expiresAt?: string;
    timestamp?: string;
    source?: string;
};

