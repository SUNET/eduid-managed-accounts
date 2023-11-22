import { useEffect, useRef } from "react";
import { fetchGroups, getGroupDetails, getGroupsSearch, postUser, putGroup } from "../apis/scimRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import Splash from "./Splash";

export default function GroupManagement() {
  const dispatch = useAppDispatch();
  const groupsData = useAppSelector((state) => state.groups.groups);
  const members = useAppSelector((state) => state.groups.members);
  const familyNameRef = useRef<HTMLInputElement | null>(null);
  const givenNameRef = useRef<HTMLInputElement | null>(null);
  const filterString = useRef<HTMLInputElement | null>(null);

  console.log("groupsData", groupsData);

  useEffect(() => {
    const fetchScimTest = async () => {
      dispatch(fetchGroups());
    };
    fetchScimTest();
  }, []);

  function getGroupsSearch1(e: any) {
    e.preventDefault();
    const filterStringValue = filterString?.current?.value;
    if (filterStringValue) {
      dispatch(getGroupsSearch({ searchFilter: filterStringValue }));
    }
  }

  const renderHeader = () => {
    let headerElement = ["Group name", ""];

    return headerElement.map((key, index) => {
      return (
        <th className={key} key={index}>
          {key}
        </th>
      );
    });
  };

  const saveUser = async (e: any) => {
    console.log("e", e);
    e.preventDefault();
    // TODO
    const givenName = document.querySelector('[name="given_name"]') as HTMLInputElement;
    const middleName = document.querySelector('[name="middleName"]') as HTMLInputElement;
    const familyName = document.querySelector('[name="family_name"]') as HTMLInputElement;
    //POST USER
    if (givenName.value && familyName.value) {
      const response = await dispatch(
        postUser({
          familyName: familyName.value,
          givenName: givenName.value,
        })
      );
      if (postUser.fulfilled.match(response)) {
        const result = await dispatch(getGroupDetails({ id: "16bda7c5-b7f7-470a-b44a-0a7a32b4876c" }));
        console.log("1...result", result);
        if (getGroupDetails.fulfilled.match(result)) {
          const addedUserResult = await dispatch(
            putGroup({
              result: {
                ...result.payload,
                members: [
                  ...result.payload.members,
                  {
                    $ref: response.payload.meta?.location,
                    value: response.payload.id,
                    display: response.payload.name.familyName + "" + response.payload.name.givenName,
                  },
                ],
              },
            })
          );

          if (putGroup.fulfilled.match(addedUserResult)) {
            dispatch(fetchGroups());
          }
        }
      }
    }
  };

  return (
    <Splash showChildren={groupsData.length > 0}>
      <section className="intro">
        <h1>Welcome</h1>
        <div className="lead">
          <p>You can search through your groups here and provide detailed information.</p>
        </div>
      </section>
      <section>
        <form onSubmit={(e) => saveUser(e)}>
          <fieldset>
            <label>Given name</label>
            <input type="text" name="givenName"></input>
          </fieldset>
          <fieldset>
            <label>Middle name (optional)</label>
            <input type="text" name="middleName"></input>
          </fieldset>
          <fieldset>
            <label>Surname</label>
            <input type="text" name="familyName"></input>
          </fieldset>
          <div className="buttons">
            <button className="btn-primary">Create</button>
          </div>
          <br />
          <table>
            <thead>
              <tr>
                <th>Given name*</th>
                <th>Middle name</th>
                <th>Surname*</th>
                <th>EPPN</th>
                <th>Password</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button>Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </section>
      {/* hämtar användaren */}
      <article className="intro">
        <form onSubmit={(e) => getGroupsSearch1(e)}>
          <label>Search groups</label>
          <input className="form-control" name="filter_string" ref={filterString} />
          <div className="buttons">
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </form>
      </article>
      <article className="intro">
        <h2>Groups</h2>
        <p>Click on a group to see more details about it.</p>
        <table>
          <thead>
            <tr>{renderHeader()}</tr>
          </thead>
          <tbody>
            {groupsData?.map((group: any) => (
              <tr key={group.id}>
                <td>{group.displayName}</td>
                <td>
                  <button className="btn-link btn-sm" onClick={() => dispatch(getGroupDetails({ id: group.id }))}>
                    see more
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members?.map((member: any) => (
          <li key={member.value}>{member.display}</li>
        ))}

        <br />
      </article>
      <div>
        <h2> Users</h2>
        <form onSubmit={saveUser} style={{ display: "flex" }}>
          <div>
            <label>Family name</label>
            <input name="family_name" ref={familyNameRef} />
          </div>

          <div>
            <label>Given name</label>
            <input name="given_name" ref={givenNameRef} />
          </div>

          <button className="btn btn-primary" type="submit">
            create user
          </button>
        </form>
      </div>
    </Splash>
  );
}
