import { useState } from "react";

// TODO: Scim TypeScript Client could be used here

export default function Scim() {
  // const location = useLocation();
  // const { accessToken } = location.state;
  const [groups, setGroups] = useState<any>();
  const [group, setGroup] = useState<any>();
  const accessTokenTest =
    "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTY5OTQ2Mjk0OSwiaWF0IjoxNjk5NDU5MzQ5LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNjk5NDU5MzQ5LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.DNSgBJsXS2znCUv2nGYcL2I1ngE6AOcw8QKy8JTI5M64_TlDUZvhuFgnI0WvyyH5sxpRt006YSF3jipGMJm1Yw";

  const baseURL = "https://api.eduid.docker/scim/";

  const headers = {
    "Content-Type": "application/scim+json",
    // Authorization: `Bearer ${accessToken}`,
    Authorization: `Bearer ${accessTokenTest}`,
  };

  async function getGroups() {
    const url = baseURL + "Groups/";
    const config = {
      method: "GET",
      headers: headers,
    };

    try {
      const response = await fetch(url, config);
      if (response.ok) {
        const resp_json = await response.json();
        console.log("[resp_json]", resp_json);
        setGroups(resp_json.Resources);
      }
    } catch {}
  }

  async function getGroupsSearch(e: any) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[name="filter_string"]');
    const url = baseURL + "Groups/.search";
    let payload = {};
    if (input) {
      payload = {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
        filter: `displayName eq "${input.value}"`,
      };
    }
    const config = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(url, config);
      if (response.ok) {
        const resp_json = await response.json();
        console.log("[resp_json]", resp_json);
      }
    } catch {}
  }

  async function getGroupDetails(id: string) {
    // e.preventDefault();
    // const form = e.target;
    // const input = form.querySelector('input[name="group_id"]');
    // const url = baseURL + "Groups/" + input.value;
    const url = baseURL + "Groups/" + id;
    const config = {
      method: "GET",
      headers: headers,
    };

    try {
      const response = await fetch(url, config);
      if (response.ok) {
        const resp_json = await response.json();
        console.log("[resp_json]", resp_json);
      }
    } catch {}
  }

  async function createUser(e: any) {
    e.preventDefault();
    const form = e.target;
    const familyName = form.querySelector('input[name="family_name"]').value;
    const givenName = form.querySelector('input[name="given_name"]').value;
    const url = baseURL + "Users";
    const payload = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      externalId: givenName,
      name: {
        familyName: familyName,
        givenName: givenName,
      },
    };
    const config = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(url, config);
      if (response.ok) {
        const resp_json = await response.json();
        console.log("[resp_json]", resp_json);
      }
    } catch {}
  }

  return (
    <>
      <h1>Scim Page</h1>
      <div>
        <div>
          <h2>Get All Groups</h2>
          <button onClick={() => getGroups()}>Get Groups</button>
        </div>

        {groups?.map((group: any) => (
          <table key={group.id}>
            <tbody>
              <tr>
                <td>{group.displayName}</td>
                <td>
                  <button onClick={() => setGroup(group)}>Choose Group</button>
                </td>
              </tr>
            </tbody>
          </table>
        ))}
        <h3>State (choosen)</h3>
        {group !== undefined && (
          <>
            <p>
              Group: {group.id} {group.displayName}
            </p>
            <button onClick={() => getGroupDetails(group.id)}>
              Get Group Details
            </button>
          </>
        )}
        <form onSubmit={(e) => getGroupsSearch(e)}>
          <input className="form-control" name="filter_string" />

          <button className="btn btn-primary" type="submit">
            Get Groups Search
          </button>
        </form>
        {/* <form onSubmit={(e) => getGroupDetails(e)}>
        <input name="group_id" />
        <button type="submit">Get Group Details</button>
      </form> */}
      </div>
      <div>
        <h2> Users</h2>
        <form onSubmit={(e) => createUser(e)} style={{ display: "flex" }}>
          <div>
            <label>Family name</label>
            <input name="family_name" />
          </div>

          <div>
            <label>Given name</label>
            <input name="given_name" />
          </div>

          <button className="btn btn-primary" type="submit">
            create user
          </button>
        </form>
      </div>
    </>
  );
}
