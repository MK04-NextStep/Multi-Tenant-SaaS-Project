import { createContext, useState } from "react";

const UserContext = createContext();

export default UserContext;

function UserProvider({ children }) {

    const [userId, setUserId] = useState(null);
    const [me, setMe] = useState(null)

    return (
        <UserContext.Provider
            value={{
                userId,
                setUserId,
                me, setMe
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export { UserProvider };