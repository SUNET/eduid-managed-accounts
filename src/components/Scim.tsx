import { useState } from "react";

const containerStyle = {
  border: "1px solid orange",
  borderRadius: "10px",
  padding: "20px",
  margin: "10px",
};

const buttonStyle = {
  backgroundColor: "orange",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "20px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  width: "80%",
  marginBottom: "0",
};

export default function Scim() {
  // const location = useLocation();
  // const { accessToken } = location.state;
  const [groups, setGroups] = useState<any>();
  const [group, setGroup] = useState<any>();
  const accessTokenTest =
    "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTY5OTQ0OTgxMSwiaWF0IjoxNjk5NDQ2MjExLCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNjk5NDQ2MjExLCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.hhxPw6MRV4GePjbVj7oFNHRmpdD_pGuDOaZq1FVg5lUwK976dbfFMJMAzkGfFTdWF3i8OHr2Rfh9gIR9EGBzyA";

  // useEffect(() => {
  //   const fetchScimTest = async () => {
  //     const url = "https://api.eduid.docker/scim/Groups";
  //     const config = {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/scim+json",
  //         // Authorization: `Bearer ${accessToken}`,
  //         Authorization: `Bearer ${accessTokenTest}`,
  //       },
  //     };

  //     try {
  //       const response = await fetch(url, config);
  //       if (response.ok) {
  //         const resp_json = await response.json();
  //         console.log("[resp_json]", resp_json);
  //       }
  //     } catch {}
  //   };
  //   fetchScimTest();
  // }, []);

  const baseURL = "https://api.eduid.docker/scim/";

  async function getGroups() {
    const url = baseURL + "Groups/";
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/scim+json",
        // Authorization: `Bearer ${accessToken}`,
        Authorization: `Bearer ${accessTokenTest}`,
      },
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
        //startIndex: 1,
        //count: 100,
        //attributes: ["string"],
      };
    }
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/scim+json",
        // Authorization: `Bearer ${accessToken}`,
        Authorization: `Bearer ${accessTokenTest}`,
      },
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
      headers: {
        "Content-Type": "application/scim+json",
        // Authorization: `Bearer ${accessToken}`,
        Authorization: `Bearer ${accessTokenTest}`,
      },
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
      headers: {
        "Content-Type": "application/scim+json",
        // Authorization: `Bearer ${accessToken}`,
        Authorization: `Bearer ${accessTokenTest}`,
      },
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
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h2>Get All Groups</h2>
          <button style={buttonStyle} onClick={() => getGroups()}>
            Get Groups
          </button>
        </div>

        {groups?.map((group: any) => (
          <table
            key={group.id}
            style={{
              margin: "10px",
              width: "100%",
              border: "2px solid gray",

              borderCollapse: "collapse",
            }}
          >
            <tbody>
              <tr>
                <td style={{ borderBottom: "1px solid black", padding: "10px" }}>{group.displayName}</td>
                <td style={{ borderBottom: "1px solid black", padding: "10px" }}>
                  <button
                    style={{ ...buttonStyle, fontSize: "12px", padding: "5px 10px" }}
                    onClick={() => setGroup(group)}
                  >
                    Choose Group
                  </button>
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
            <button onClick={() => getGroupDetails(group.id)}>Get Group Details</button>
          </>
        )}
        <form onSubmit={(e) => getGroupsSearch(e)}>
          <input style={inputStyle} name="filter_string" />
          <button style={{ ...buttonStyle, fontSize: "12px", padding: "5px 10px" }} type="submit">
            Get Groups Search
          </button>
        </form>
        {/* <form onSubmit={(e) => getGroupDetails(e)}>
        <input name="group_id" />
        <button type="submit">Get Group Details</button>
      </form> */}
      </div>
      <div style={containerStyle}>
        <h2> Users</h2>
        <form onSubmit={(e) => createUser(e)} style={{ display: "flex" }}>
          <div style={{ display: "flex", marginBottom: "10px" }}>
            <label
              style={{ flex: 1, marginRight: "10px", display: "flex", flexDirection: "column", marginBottom: "0" }}
            >
              Family name
            </label>
            <input style={inputStyle} name="family_name" />
          </div>

          <div style={{ display: "flex", marginBottom: "10px" }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: "0" }}>Given name</label>
            <input style={inputStyle} name="given_name" />
          </div>

          <button style={{ ...buttonStyle, fontSize: "12px", padding: "5px 10px" }} type="submit">
            create user
          </button>
        </form>
      </div>
    </>
  );
}
