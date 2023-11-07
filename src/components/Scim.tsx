export default function Scim() {
  // const location = useLocation();
  // const { accessToken } = location.state;
  const accessTokenTest = "add_here_access_token";

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

  async function getGroupInfo(e: any) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[name="group_id"]');
    const url = baseURL + "Groups/" + input.value;
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

  return (
    <>
      <h1>Scim Page</h1>
      <button onClick={() => getGroups()}>Get Groups</button>
      <br />
      <form onSubmit={(e) => getGroupsSearch(e)}>
        <input name="filter_string" />
        <button type="submit">Get Groups Search</button>
      </form>
      <form onSubmit={(e) => getGroupInfo(e)}>
        <input name="group_id" />
        <button type="submit">Get Group Info</button>
      </form>
    </>
  );
}
