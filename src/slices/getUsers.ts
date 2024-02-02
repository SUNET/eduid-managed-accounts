import { createSlice } from "@reduxjs/toolkit";
import { Group } from "typescript-clients/scim/models/Group";
import { Name } from "typescript-clients/scim/models/Name";
import { NutidUserExtensionV1 } from "typescript-clients/scim/models/NutidUserExtensionV1";
import { UserResponse } from "typescript-clients/scim/models/UserResponse";
import { deleteUser, getUserDetails, postUser } from "../apis/scim/usersRequest";

// connectIdp: { attributes: { eduPersonPrincipalName: string } }
type ExternalProfileWithScope = {
  profiles: { connectIdp: { attributes: { eduPersonPrincipalName: string } } } & NutidUserExtensionV1;
};

// Managed Accounts required data format
export type ExtendedUserResponse = UserResponse & {
  externalId: string;
  name: {
    familyName: string;
    givenName: string;
  } & Name;
  groups: Array<Group>;
  "https://scim.eduid.se/schema/nutid/user/v1"?: ExternalProfileWithScope;
  password?: string;
};

export interface GetUsersState {
  members: ExtendedUserResponse[];
}

export const initialState: GetUsersState = {
  members: [],
};

export const getUsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    initialize: (state) => {
      state.members = [];
    },
    sortByLatest: (state) => {
      state.members?.sort(function (a, b) {
        return new Date(b.meta.created).valueOf() - new Date(a.meta.created).valueOf();
      });
    },
    // generatedNewPassword: (state, action) => {
    //   state.members = action.payload;
    // },
    addPassword: (state, action) => {
      // find externalId and add password to that object
      const index = state.members.findIndex((member) => member.externalId === action.payload.externalId);
      // add space between every 4 characters
      const passwordSpaced = action.payload.password.match(/.{1,4}/g).join(" ");
      state.members[index].password = passwordSpaced;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
    // builder.addCase(createUser.fulfilled, (state, action) => {
    //   const payloadWithExternalId = {
    //     // ...action.payload,
    //     externalId: `${action.payload.user.eppn}@${action.payload.scope} `,
    //     password: action.payload.user.password,
    //   };
    //   state.members.unshift(payloadWithExternalId);
    // });
    builder.addCase(postUser.fulfilled, (state, action) => {
      //const payloadWithPassword = { ...action.payload, password: fakePassword() };
      state.members.unshift(action.payload);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.members = state.members?.filter((user) => user.id !== action.payload.id);
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
