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
import Upcoming_v from './village/Upcoming_v'
import Upcoming_tr from './trust/Upcoming_tr'
import Ongoing_tr from './trust/Ongoing_tr'
import Ongoing_v from './village/Ongoing_v'
import 'bootstrap/dist/css/bootstrap.min.css';
import Past_tr from './trust/Past_tr'
import RootAdmin from './admin/RootAdmin'
import LoginAdmin from './admin/LoginAdmin'
import Unver_v from './admin/unver_v'
import Unver_tr from './admin/unver_tr'
import Verified_v from './admin/verified_v'
import Verified_tr from './admin/verified_tr'
import AdminHeader from './admin/AdminHeader'
import Village_i from './common/Village_i'
import Trust_i from './common/Trust_i'
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
            },
            {
              path:'upcoming',
              element:<Upcoming_tr/>
            },
            {
              path:'ongoing',
              element:<Ongoing_tr/>
            },
            {
              path:'past',
              element:<Past_tr/>
            }
          ]
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
            },
            {
              path:'upcoming',
              element:<Upcoming_v/>
            },
            {
              path:'ongoing',
              element:<Ongoing_v/>
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
              element:<Village_i/>
            },
            {
              path:'trusts',
              element:<Trust_i/>
            }         
          ]
          }
          ]
        },
        {
          path:'admin',
          element: <RootAdmin/>,
          children:[
            {
              path: "",
              element: <Navigate to="login" replace />, 
            },
            {
              path:'login',
              element:<LoginAdmin/>
            },
            {
              path:'',
              element:<AdminHeader/>,
              children:[
            {
              path:'unverified-villages',
              element:<Unver_v/>
            },
            {
              path:'unverified-trusts',
              element:<Unver_tr/>
            },
            {
              path: 'verified-villages',
              element:<Verified_v/>
            },
            {
              path: 'verified-trusts',
              element:<Verified_tr/>
            }         
          ]
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