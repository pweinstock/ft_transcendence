import { useState } from 'react';

import './chatstart.css';

// import Login from './Login';
import InputMessage from './InputMessage';
import MessageList from './MessageList';
// import Logout from './Logout';

function ChatStarter() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
         <>
            <InputMessage/>
            <MessageList/>
         </>
    </div>
  );
}

export default ChatStarter;
// { !user && <Login user={user} onLogin={setUser} /> }
// { user && (
//   <>
//     {/* <Logout user={user} /> */}
//     <InputMessage user={user} />
//     <MessageList user={user}/>
//   </>
// ) }