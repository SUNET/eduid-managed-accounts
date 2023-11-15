import { useEffect, useRef } from "react";
import { fetchGroups, getGroupDetails, getGroupsSearch, postUser } from "../apis/scimRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import Splash from "./Splash";

export default function GroupManagement() {
  const dispatch = useAppDispatch();
  const groupsData = useAppSelector((state) => state.groups.groups);
  const members = useAppSelector((state) => state.groups.members);
  const familyNameRef = useRef<HTMLInputElement | null>(null);
  const givenNameRef = useRef<HTMLInputElement | null>(null);
  const filterString = useRef<HTMLInputElement | null>(null);

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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const familyNameValue = familyNameRef?.current?.value;
    const givenNameValue = givenNameRef?.current?.value;
    if (familyNameValue && givenNameValue) {
      dispatch(
        postUser({
          familyName: familyNameValue,
          givenName: givenNameValue,
        })
      );
    }
  };

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

  return (
    <Splash showChildren={groupsData.length > 0}>
      <section className="intro">
        <h1>Welcome</h1>
        <div className="lead">
          <p>You can search through your groups here and provide detailed information.</p>
        </div>
      </section>
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
      {/* <div>
        <h2> Users</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex" }}>
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
      </div> */}
    </Splash>
  );
}
