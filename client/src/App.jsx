import {createBrowserRouter,RouterProvider,Navigate} from 'react-router-dom'
import Home from "./common/Home"
import RootLayout from './common/RootLayout'
import RootVillage from './village/RootVillage'
import RootIndividual from './individual/RootIndividual'
import RootTrust from './trust/RootTrust'
import Login_in from './individual/Login_in'
import Login_tr from './trust/Login_tr'
import Login_vi from './village/Login_vi'
import Register_in from './individual/Register_in'
import Register_tr from './trust/Register_tr'
import Register_vi from './village/Register_vi'
import Trust_profile from './trust/Trust_profile'
import Users from './common/Users'
import Trusts from './common/Trusts'
import Villages from './common/Villages'
import Trust_header from './trust/Trust_header'
import Individual_header from './individual/Individual_header'
import Village_header from './village/Village_header'
import Village_profile from './village/Village_profile'
import Individual_profile from './individual/Individual_profile'
import Add_prob from './village/Add_prob'
import Accepted from './village/Accepted'
function App() {

  let b = createBrowserRouter([
    {
      path:'',
      element: <RootLayout></RootLayout>,
      children:[
        {
          path:'',
          element: <Home></Home>,
        },
        {
          path:'trust',
          element: <RootTrust></RootTrust>,
          children:[
            {
              path: "",
              element: <Navigate to="login" replace />,
            },
            {
              path:'login',
              element:<Login_tr/>
            },
            {
              path:'register',
              element:<Register_tr/>
            },
            {
              path:'',
              element:<Trust_header/>,
              children:[
            {
              path:'profile/:trust',
              element:<Trust_profile/>
            },
            {
              path:'villages',
              element:<Villages/>
            },
            {
              path:'users',
              element:<Users/>
            }]
          }

          ]
        },
        {
          path:'village',
          element: <RootVillage></RootVillage>,
          children:[
            {
              path: "",
              element: <Navigate to="login" replace />, 
            },
            {
              path:'login',
              element:<Login_vi/>
            },
            {
              path:'register',
              element:<Register_vi/>
            },
            {
              path:'',
              element:<Village_header/>,
              children:[
            {
              path:'profile/:name',
              element:<Village_profile/>
            },
            {
              path:'trusts',
              element:<Trusts/>
            },
            {
              path:'users',
              element:<Users/>
            },
            {
              path:'add-problem',
              element:<Add_prob/>
            },
            {
              path:'accepted',
              element:<Accepted/>
            }
          ]
          }
          ]
        },
        {
          path:'individual',
          element: <RootIndividual></RootIndividual>,
          children:[
            {
              path: "",
              element: <Navigate to="login" replace />, 
            },
            {
              path:'login',
              element:<Login_in/>
            },
            {
              path:'register',
              element:<Register_in/>
            },
            {
              path:'',
              element:<Individual_header/>,
              children:[
            {
              path:'profile/:name',
              element:<Individual_profile/>
            },
            {
              path:'villages',
              element:<Villages/>
            },
            {
              path:'trusts',
              element:<Trusts/>
            }]
          }
          ]
        }
      ]
    }

  ])

  return (
   <RouterProvider router={b} />
  )
}

export default App