import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { createGroup, getGroupDetails, getGroupsSearch } from "../apis/scim/groupsRequest";
import { getUserDetails } from "../apis/scim/usersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import { managedAccountsStore } from "../init-app";
import { showNotification } from "../slices/Notifications";
import appSlice from "../slices/appReducers";
import getGroupsSlice from "../slices/getGroups";
import getLoggedInUserInfoSlice from "../slices/getLoggedInUserInfo";
import getUsersSlice, { AccountState } from "../slices/getUsers";
import { GroupMember } from "../typescript-clients/scim/models/GroupMember";
import CreateAccounts from "./CreateAccounts";
import MembersList, { DEFAULT_POST_PER_PAGE } from "./MembersList";
import MembersListIntro from "./MembersListIntro";

const GROUP_NAME = "Managed Accounts";

export default function GroupManagement(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const isLoaded = useAppSelector((state) => state.app.isLoaded);
  const forcedLogout = useAppSelector((state) => state.app.forcedLogout);
  const membersDetails = useAppSelector((state) => state.members.members);
  const locationState = location.state;
  const value = locationState?.subject?.assertions[0].value;
  const parsedUserInfo = value ? JSON.parse(value) : null;
  const eduPersonPrincipalName: string = parsedUserInfo?.attributes?.eduPersonPrincipalName;
  const scope = eduPersonPrincipalName?.split("@")[1];

  useEffect(() => {
    if (parsedUserInfo && !isLoaded) {
      dispatch(appSlice.actions.updateAccessToken(locationState?.access_token?.value));
      dispatch(getLoggedInUserInfoSlice.actions.updateUserInfo({ user: parsedUserInfo }));
    }
  }, [parsedUserInfo, locationState]);

  useEffect(() => {
    if (forcedLogout || !locationState) {
      navigate("/", { replace: true, state: null });
    }
  }, [forcedLogout, locationState]);

  function checkAllMembersDetailsAreLoaded(groupResponseMembers: any): any {
    const state = managedAccountsStore.getState();

    if (groupResponseMembers.length !== state.members.members.length) {
      dispatch(showNotification({ message: "Could not load all members details. Try again" }));
      // TODO: here disable all the buttons to avoid working on a partially loaded list of members (or simply logout)
      navigate("/", { replace: true, state: null });
    }
  }

  async function reloadMembersDetails(members: GroupMember[]) {
    dispatch(getUsersSlice.actions.initialize());
    const chunkSize = DEFAULT_POST_PER_PAGE * 3; // empirical value
    for (let i = 0; i < members.length; i += chunkSize) {
      // run in chunks to avoid server overload
      const chunk = members.slice(i, i + chunkSize);
      if (chunk) {
        await Promise.all(
          chunk?.map(async (member: GroupMember) => {
            await dispatch(getUserDetails({ id: member.value }));
          })
        );
      }
    }
    checkAllMembersDetailsAreLoaded(members);
    dispatch(getUsersSlice.actions.sortByLatest());
  }

  async function handleGroupVersion() {
    const response = await dispatch(getGroupDetails({ id: managedAccountsDetails.id }));
    if (getGroupDetails.fulfilled.match(response)) {
      if (response.payload.meta.version !== managedAccountsDetails.meta.version) {
        // to protect the "state" in the current session we should copy the "password" and "selected"

        // 1 - create an array of members {id: id, password: password, selected: selected} from store
        const state = managedAccountsStore.getState();
        const storeCopyMembersDetails: Array<AccountState> = state.members.members
          .filter((member) => member.password || member.selected)
          .map((member) => ({
            externalId: member.externalId,
            password: member.password,
            selected: member.selected,
          }));

        // 2 - reloadMembersDetails()
        const members = response.payload.members;
        if (members) await reloadMembersDetails(members);

        // 3 - apply the "password" and "selected" to the reloadMembersDetails (filter if some accounts have been removed)
        // Read again from store to get the updated state
        const updateState = managedAccountsStore.getState();
        const temp = storeCopyMembersDetails.filter((copyMember) =>
          updateState.members.members.some((member) => copyMember.externalId === member.externalId)
        );
        temp.forEach((member: AccountState) =>
          dispatch(
            getUsersSlice.actions.setAccountState({
              externalId: member.externalId,
              password: member.password,
              selected: member.selected,
            })
          )
        );
      }
    }
  }

  /**
   * Without user interaction
   * 1 - Search for a "managed-accounts" Group
   * 2 - If the Group is not found, create a new Group "managed-accounts" and save the Group ID in the state ManagedAccountsGroup
   * 3 - If the Group is found, set the Group ID in the state ManagedAccountsGroup and show the Users in the Group
   */
  useEffect(() => {
    const initializeManagedAccountsGroup = async () => {
      try {
        dispatch(getUsersSlice.actions.initialize());
        dispatch(getGroupsSlice.actions.initialize());
        const result = await dispatch(getGroupsSearch({ searchFilter: GROUP_NAME }));
        if (getGroupsSearch.fulfilled.match(result)) {
          dispatch(appSlice.actions.isFetching(true));
          if (!result.payload?.Resources?.length) {
            dispatch(createGroup({ displayName: GROUP_NAME }));
          } else if (result.payload.Resources?.length === 1) {
            const response = await dispatch(getGroupDetails({ id: result.payload.Resources[0].id }));
            if (getGroupDetails.fulfilled.match(response)) {
              const members = response.payload.members;
              if (members) await reloadMembersDetails(members);
            }
          }
          dispatch(appSlice.actions.isFetching(false));
        } else if (getGroupsSearch.rejected.match(result)) {
          // when user get 401 error, it will redirect to login page or landing page
        }
      } catch (error) {
        console.log("Error", error);
      }
    };
    if (!isLoaded) {
      initializeManagedAccountsGroup();
      dispatch(appSlice.actions.appIsLoaded(true));
    }
  }, []);

  return (
    <React.Fragment>
      <section className="intro">
        <h1>
          <FormattedMessage
            defaultMessage="Welcome {user}"
            id="intro-heading"
            values={{
              user: `${parsedUserInfo?.attributes?.givenName} ${parsedUserInfo?.attributes?.sn}`,
            }}
          />
        </h1>
        <div className="lead">
          <p>
            <FormattedMessage
              defaultMessage="In the forms below you can manage your organisations accounts by adding students, to create their individual account with a unique username -
            EPPN - and the password that they will need to be able to perform the Digital National Exam."
              id="intro-lead"
            />
          </p>
          <div className="text-small">
            <em>
              <FormattedMessage
                defaultMessage="The contents can be presented in Swedish or English, choose language in the footer of this web page. 
              You are advised to use the service in a larger browser window, i.e. not mobile device, for legibility and to read the full instructions under the READ MORE... links. If you are managing accounts for the first time, or many at once, it may take some time until complete."
                id="intro-leadEmphasis"
              />
            </em>
          </div>
        </div>
      </section>
      <section>
        <CreateAccounts handleGroupVersion={handleGroupVersion} scope={scope} />
      </section>
      {membersDetails.length > 0 ? (
        <section>
          <MembersListIntro />
          <MembersList handleGroupVersion={handleGroupVersion} />
        </section>
      ) : null}
    </React.Fragment>
  );
}
