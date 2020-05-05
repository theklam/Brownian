import React from "react";
import {
    Route,
    Redirect
} from "react-router-dom";

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export default function PrivateRoute({ children, ...rest }) {
    let currentUser = window.localStorage.getItem('userID');
    console.log(currentUser);
    return (
        <Route
            {...rest}
            render={({ location }) =>
                (currentUser != null &&  currentUser.length != 0) ? (
                    children
                ) : (
                        <Redirect
                            to={{
                                pathname: "/loginsignup",
                                state: { from: location }
                            }}
                        />
                    )
            }
        />
    );
}

// testing: the below works! 
// export default function PrivateRoute() {
//     return (
//         <div>private route!</div>
//     );
// }