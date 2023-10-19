import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//const { GnapClient } = require('@interop/gnap-client')
//import { GnapClient } from '@interop/gnap-client-js'
import { GnapClient } from './'


function App() {
  const [count, setCount] = useState(0)



  // PAGE 1 - Creating a client instance:
  
  const store = {} // TODO: Store for persisting `nonce`s, request handles, etc

  const clientDisplay = {
    name: 'My RP Application',
    uri: 'https://app.example.com',
    logo_uri: 'https://app.example.com/logo.png'
  }

  const capabilities = ['jwsd']

  const key = {
    proof: 'jwsd',
    jwks: { keys: [/* ... */] }
  }

  // If you pass into the constructor params that would normally go into 
  // `createRequest`, they're stored as defaults that will be auto-included
  // in requests.
  const defaults = {
    user: { /* .. */ },
    key,
    interact
  }

  const auth = new GnapClient({ store, clientDisplay, capabilities, ...defaults })




  // page 2 - Create and send a request (low-level API):

  const interact = {
    redirect: true, // default
    callback: {
      uri: 'https://app.example.com/callback/1234',
      nonce: 'LKLTI25DK82FX4T4QFZC'
    }
  }
  const resources = {
    actions: [/* ... */],
    locations: [/* ... */],
    datatype: [/* ... */]
  }
  
  const request = auth.createRequest({ resources, interact, key })
  
  // Proposed/experimental
  const { endpoint } = await auth.discover({ server: 'https://as.example.com' })
  
  // Send the request to the transaction endpoint
  const txResponse = await auth.post({ endpoint, request })
  
  const { transaction, accessToken, interactionUrl } = txResponse
  
  if (accessToken) { /* success! Although see sessionFromResponse() below */ }
  
  // `transaction` holds the various handles and nonces, can be used for
  // continuation requests 
  
  if (interactionUrl) {
    /* send the user's browser to it */
    transaction.interactRedirectWindow({ interactionUrl }) // or,
  
    /* open a popup window and redirect it  */
    transaction.interactPopup({ interactionUrl }) // or,
  
    /* in Node / Express */
    res.redirect(interactionUrl) // assuming a `res` ServerResponse object
    // transaction is saved, will be accessible at the `callback.uri`
  }


  // page 3
  // Parsing the interact_handle from front-end response, at the callback url. This is low-level (to illustrate the protocol),
  // app devs are expected to use a helper method like sessionFromResponse() instead.

  // get `callbackUrl` from current url (browser) or request url (server)
  // `transaction` is from the original transaction response

  // this also validates the incoming `hash` value against saved nonces
  const interactHandle = await transaction.parseFromUrl(callbackUrl)

  const { accessToken } = await transaction.continueWith({ interactHandle })


  
  
  // page 4 - High-level helper API (used at the callback url, instead of parseFromUrl / continueWith):

  const session = await auth.sessionFromResponse()

  session.accessToken // validated `access_token`
  session.fetch // wrapped whatwg `fetch()` that makes authenticated requests 


























  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
