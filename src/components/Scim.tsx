import { useEffect, useRef } from "react";
import { fetchGroups, getGroupDetails, getGroupsSearch, postUser } from "../apis/scimRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import Splash from "./Splash";

export default function Scim() {
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

  return (
    <Splash showChildren={groupsData}>
      <div>
        <div>
          <h1>Welcome, </h1>
        </div>
        <table>
          <tbody>
            {groupsData?.map((group: any) => (
              <tr key={group.id}>
                <td>{group.displayName}</td>
                <td>
                  <button className="btn-link btn-sm" onClick={() => dispatch(getGroupDetails({ id: group.id }))}>
                    see members
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members?.map((member: any) => (
          <li key={member.value}>{member.display}</li>
        ))}

        <form onSubmit={(e) => getGroupsSearch1(e)}>
          <input className="form-control" name="filter_string" ref={filterString} />

          <button className="btn btn-primary" type="submit">
            Get Groups Search
          </button>
        </form>
      </div>
      <div>
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
      </div>
    </Splash>
  );
}
